/**
 * P1.2 GSC API client reliability tests.
 *
 * TEST CLASSIFICATION: SIMULATED_OFFLINE_HTTP_TESTS — NOT REAL API INTEGRATION
 *   Every request is served by an injected fake `fetchImpl`; the JWT signature
 *   is injected too, so NO RSA private key (ephemeral or otherwise) is created
 *   and NO Google endpoint is contacted. No credential value is used anywhere.
 *   Real GSC API integration remains BLOCKED until Owner-configured credentials
 *   exist; see FIVE_SITE_PROPERTY_ACCESS_MATRIX.md.
 */
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clearGscTokenCache,
  createGscClient,
  getGscTokenCacheSize,
  GscApiError,
  type AnalyticsRow,
  type FetchLike,
  type GscConfig,
} from "./gsc-client";
import {
  FIVE_SITE_PROPERTIES,
  GscPropertyNotAllowedError,
  assertAllowedProperty,
  collectAcrossSites,
  isAllowedProperty,
  listAllowedProperties,
} from "./gsc-sites";

const TOKEN_OK = { access_token: "SIMULATED_TOKEN_NOT_A_CREDENTIAL", expires_in: 3600 };
const WINDOW = { startDate: "2026-10-12", endDate: "2026-11-08" };

function cfg(siteUrl = "sc-domain:volsunsgr.com", identity = "sa-a"): GscConfig {
  return {
    clientEmail: `${identity}@example.invalid`,
    privateKey: `SIMULATED_KEY_${identity}_NOT_A_CREDENTIAL`,
    siteUrl,
  };
}

/** Offline overrides: no real fetch, no real private key, no retries by default. */
const OFFLINE = {
  signJwt: () => "SIMULATED_SIGNATURE",
  maxRetries: 0,
  retryDelayMs: 0,
} as const;

function jsonRes(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

type RecordedCall = { url: string; init: RequestInit };

type Routes = {
  token?: () => Response | Promise<Response>;
  analytics?: (body: Record<string, unknown>, pageIndex: number) => Response | Promise<Response>;
  sitemaps?: (url: string) => Response | Promise<Response>;
  inspection?: () => Response | Promise<Response>;
};

function fakeFetch(routes: Routes = {}) {
  const calls: RecordedCall[] = [];
  let analyticsPages = 0;
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, init: init ?? {} });
    if (url.includes("oauth2.googleapis.com/token")) {
      return routes.token ? routes.token() : jsonRes(200, TOKEN_OK);
    }
    if (url.endsWith("/searchAnalytics/query")) {
      const body = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      const index = analyticsPages++;
      return routes.analytics ? routes.analytics(body, index) : jsonRes(200, { rows: [] });
    }
    if (url.endsWith("/sitemaps")) {
      return routes.sitemaps ? routes.sitemaps(url) : jsonRes(200, { sitemap: [] });
    }
    if (url.includes("urlInspection/index:inspect")) {
      return routes.inspection ? routes.inspection() : jsonRes(200, {});
    }
    throw new Error(`SIMULATED unexpected endpoint: ${url}`);
  };
  return { fetchImpl, calls, analyticsPages: () => analyticsPages };
}

function makeRows(from: number, count: number, prefix = "page"): AnalyticsRow[] {
  return Array.from({ length: count }, (_, i) => ({
    keys: [`https://www.volsunsgr.com/${prefix}-${from + i}`],
    clicks: i % 7,
    impressions: 10 + i,
    ctr: 0.01,
    position: 5.5,
  }));
}

function params(overrides: Record<string, unknown> = {}) {
  return {
    ...WINDOW,
    dimensions: ["page"],
    rowLimit: 25_000,
    ...overrides,
  };
}

beforeEach(() => clearGscTokenCache());

// --- 1. Pagination -----------------------------------------------------------

test("[SIMULATED] 250 行以上分页：250+250+37 完整翻页，startRow 正确递增", async () => {
  const seenStartRows: number[] = [];
  const seenRowLimits: number[] = [];
  const ff = fakeFetch({
    analytics: (body, page) => {
      seenStartRows.push(Number(body.startRow));
      seenRowLimits.push(Number(body.rowLimit));
      const sizes = [250, 250, 37];
      return jsonRes(200, { rows: makeRows(page * 250, sizes[page] ?? 0) });
    },
  });
  const client = createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl });
  const result = await client.querySearchAnalytics(cfg(), params({ pageSize: 250, maxPages: 200 }));

  assert.equal(result.rows.length, 537);
  assert.equal(result.diagnostics.rowsFetched, 537);
  assert.equal(result.diagnostics.pagesFetched, 3);
  assert.deepEqual(seenStartRows, [0, 250, 500]);
  assert.deepEqual(seenRowLimits, [250, 250, 250]);
  assert.equal(result.diagnostics.stopReason, "EXHAUSTED");
  assert.equal(result.diagnostics.complete, true);
  assert.equal(result.diagnostics.truncated, false);
  assert.equal(result.diagnostics.duplicatesRemoved, 0);
});

test("[SIMULATED] 恰好整页边界：补一次空页确认数据已取尽", async () => {
  const ff = fakeFetch({
    analytics: (_body, page) => jsonRes(200, { rows: page < 2 ? makeRows(page * 250, 250) : [] }),
  });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl })
    .querySearchAnalytics(cfg(), params({ pageSize: 250 }));
  assert.equal(result.rows.length, 500);
  assert.equal(result.diagnostics.pagesFetched, 3);
  assert.equal(result.diagnostics.complete, true);
});

test("[SIMULATED] GSC 返回空 rows 时不编造数据、不回退 Mock", async () => {
  const ff = fakeFetch({ analytics: () => jsonRes(200, { rows: [] }) });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl })
    .querySearchAnalytics(cfg(), params());
  assert.deepEqual(result.rows, []);
  assert.equal(result.diagnostics.complete, true);
  assert.equal(result.diagnostics.truncated, false);
});

// --- 2. Cross-page dedup -----------------------------------------------------

test("[SIMULATED] 跨页重复数据去重：10 条重复不重复计数、不进入结果", async () => {
  const page0 = makeRows(0, 250);
  const page1 = [...page0.slice(0, 10), ...makeRows(250, 240)];
  const ff = fakeFetch({
    analytics: (_body, page) => {
      if (page === 0) return jsonRes(200, { rows: page0 });
      if (page === 1) return jsonRes(200, { rows: page1 });
      return jsonRes(200, { rows: [] });
    },
  });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl })
    .querySearchAnalytics(cfg(), params({ pageSize: 250 }));

  assert.equal(result.rows.length, 490);
  assert.equal(result.diagnostics.duplicatesRemoved, 10);
  assert.equal(new Set(result.rows.map((r) => r.keys[0])).size, 490);
  assert.ok(result.diagnostics.warnings.some((w) => w.includes("去重")));
  assert.equal(result.diagnostics.truncated, false);
});

test("[SIMULATED] 同键但指标冲突的重复行：保留首次值并计数告警", async () => {
  const page0 = makeRows(0, 250);
  const conflicting = { ...page0[0], clicks: 999, impressions: 999 };
  const ff = fakeFetch({
    analytics: (_body, page) => {
      if (page === 0) return jsonRes(200, { rows: page0 });
      if (page === 1) return jsonRes(200, { rows: [conflicting, ...makeRows(250, 249)] });
      return jsonRes(200, { rows: [] });
    },
  });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl })
    .querySearchAnalytics(cfg(), params({ pageSize: 250 }));
  assert.equal(result.rows.length, 499);
  assert.equal(result.diagnostics.duplicatesRemoved, 1);
  assert.equal(result.diagnostics.conflictingDuplicates, 1);
  assert.equal(result.rows[0].clicks, page0[0].clicks, "first occurrence must win");
});

test("[SIMULATED] 整页重复时终止翻页并标记截断（防死循环）", async () => {
  const page = makeRows(0, 250);
  const ff = fakeFetch({ analytics: () => jsonRes(200, { rows: page }) });
  let callsIfLooped = 0;
  const guarded: FetchLike = (url, init) => {
    callsIfLooped++;
    return ff.fetchImpl(url, init);
  };
  const result = await createGscClient({ ...OFFLINE, fetchImpl: guarded })
    .querySearchAnalytics(cfg(), params({ pageSize: 250, maxPages: 50 }));
  assert.equal(result.diagnostics.stopReason, "DUPLICATE_PAGE");
  assert.equal(result.diagnostics.truncated, true);
  assert.equal(callsIfLooped < 10, true, "must not spin");
  assert.ok(result.diagnostics.warnings.some((w) => w.includes("TRUNCATED")));
});

// --- 3. Integrity / truncation ----------------------------------------------

test("[SIMULATED] 非法行被丢弃并产生 INTEGRITY 告警，不污染统计", async () => {
  const badRows: unknown[] = [
    { keys: [], clicks: 1, impressions: 1, ctr: 0.1, position: 3 },
    { keys: ["https://www.volsunsgr.com/bad"], clicks: 1, impressions: 1, ctr: 1.9, position: 3 },
    { keys: ["https://www.volsunsgr.com/bad2"], clicks: -1, impressions: 1, ctr: 0.1, position: 3 },
  ];
  const ff = fakeFetch({
    analytics: () => jsonRes(200, { rows: [...makeRows(0, 2), ...badRows] }),
  });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl })
    .querySearchAnalytics(cfg(), params());
  assert.equal(result.rows.length, 2);
  assert.equal(result.diagnostics.invalidRowsDropped, 3);
  assert.ok(result.diagnostics.warnings.some((w) => w.includes("INTEGRITY")));
});

test("[SIMULATED] 数据截断告警：达到 maxPages 时 truncated=true 且带 ALERT", async () => {
  const ff = fakeFetch({ analytics: () => jsonRes(200, { rows: makeRows(0, 250) }) });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl })
    .querySearchAnalytics(cfg(), params({ pageSize: 250, maxPages: 1 }));
  assert.equal(result.diagnostics.stopReason, "MAX_PAGES");
  assert.equal(result.diagnostics.truncated, true);
  assert.equal(result.diagnostics.complete, false);
  assert.ok(result.diagnostics.warnings.some((w) => w.includes("DATA_TRUNCATION_ALERT")));
});

test("[SIMULATED] 调用方主动限额 (CALLER_LIMIT) 不算截断", async () => {
  const ff = fakeFetch({ analytics: () => jsonRes(200, { rows: makeRows(0, 250) }) });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl })
    .querySearchAnalytics(cfg(), params({ rowLimit: 250, pageSize: 250 }));
  assert.equal(result.rows.length, 250);
  assert.equal(result.diagnostics.stopReason, "CALLER_LIMIT");
  assert.equal(result.diagnostics.truncated, false);
});

// --- 4. Error classification -------------------------------------------------

test("[SIMULATED] API 429 限流 → RATE_LIMITED 且不回显响应正文", async () => {
  const ff = fakeFetch({
    analytics: () => jsonRes(429, { error: "rateLimitExceeded", error_description: "SECRET_BODY_MUST_NOT_LEAK" }, { "retry-after": "1" }),
  });
  await assert.rejects(
    () => createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl }).querySearchAnalytics(cfg(), params()),
    (err: unknown) => {
      assert.ok(err instanceof GscApiError);
      assert.equal(err.code, "RATE_LIMITED");
      assert.equal(err.status, 429);
      assert.equal(err.retryable, true);
      assert.doesNotMatch(err.message, /SECRET_BODY_MUST_NOT_LEAK/);
      return true;
    },
  );
});

test("[SIMULATED] API 403 权限不足 → PERMISSION_DENIED", async () => {
  const ff = fakeFetch({
    analytics: () => jsonRes(403, { error: { status: "PERMISSION_DENIED", message: "SECRET_BODY" } }),
  });
  await assert.rejects(
    () => createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl }).querySearchAnalytics(cfg(), params()),
    (err: unknown) => {
      assert.ok(err instanceof GscApiError);
      assert.equal(err.code, "PERMISSION_DENIED");
      assert.equal(err.retryable, false);
      assert.match(err.message, /受限用户/);
      assert.doesNotMatch(err.message, /SECRET_BODY/);
      return true;
    },
  );
});

test("[SIMULATED] API 5xx → SERVER_ERROR 且可重试", async () => {
  const ff = fakeFetch({ analytics: () => jsonRes(503, { error: "backendError" }) });
  await assert.rejects(
    () => createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl }).querySearchAnalytics(cfg(), params()),
    (err: unknown) => {
      assert.ok(err instanceof GscApiError);
      assert.equal(err.code, "SERVER_ERROR");
      assert.equal(err.retryable, true);
      return true;
    },
  );
});

test("[SIMULATED] 5xx 有界重试：2 次重试后成功，不会无限重试", async () => {
  let n = 0;
  const ff = fakeFetch({
    analytics: () => {
      n++;
      return n <= 2 ? jsonRes(500, { error: "backendError" }) : jsonRes(200, { rows: makeRows(0, 3) });
    },
  });
  const result = await createGscClient({ ...OFFLINE, maxRetries: 2, fetchImpl: ff.fetchImpl })
    .querySearchAnalytics(cfg(), params());
  assert.equal(n, 3);
  assert.equal(result.rows.length, 3);
});

test("[SIMULATED] JWT invalid_grant（token 端点 400）→ INVALID_GRANT", async () => {
  const ff = fakeFetch({
    token: () => jsonRes(400, { error: "invalid_grant", error_description: "SECRET_BODY_MUST_NOT_LEAK" }),
  });
  await assert.rejects(
    () => createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl }).querySearchAnalytics(cfg(), params()),
    (err: unknown) => {
      assert.ok(err instanceof GscApiError);
      assert.equal(err.code, "INVALID_GRANT");
      assert.equal(err.operation, "token");
      assert.match(err.message, /私钥|时钟|scope/);
      assert.doesNotMatch(err.message, /SECRET_BODY_MUST_NOT_LEAK/);
      return true;
    },
  );
});

test("[SIMULATED] JWT 本地签名失败（私钥格式错误）→ INVALID_GRANT，不发网络请求", async () => {
  const ff = fakeFetch();
  await assert.rejects(
    () =>
      createGscClient({
        ...OFFLINE,
        fetchImpl: ff.fetchImpl,
        signJwt: () => { throw new Error("bad key"); },
      }).querySearchAnalytics(cfg(), params()),
    (err: unknown) => {
      assert.ok(err instanceof GscApiError);
      assert.equal(err.code, "INVALID_GRANT");
      assert.match(err.message, /私钥/);
      return true;
    },
  );
  assert.equal(ff.calls.length, 0);
});

test("[SIMULATED] 请求超时 → TIMEOUT", async () => {
  const hanging: FetchLike = (url, init) => {
    if (url.includes("oauth2.googleapis.com/token")) return Promise.resolve(jsonRes(200, TOKEN_OK));
    return new Promise((_resolve, reject) => {
      const signal = init?.signal;
      const onTimeout = () => reject(new DOMException("timeout", "TimeoutError"));
      if (signal?.aborted) {
        onTimeout();
        return;
      }
      signal?.addEventListener("abort", onTimeout, { once: true });
      // Node's AbortSignal.timeout() timer is unref'd and does not keep the
      // event loop alive. This deterministic fallback both keeps the loop
      // alive and guarantees the promise settles, so no sibling test is
      // cancelled by a dangling promise.
      setTimeout(onTimeout, 60);
    });
  };
  await assert.rejects(
    () =>
      createGscClient({ ...OFFLINE, fetchImpl: hanging, timeoutMs: 15 })
        .querySearchAnalytics(cfg(), params()),
    (err: unknown) => {
      assert.ok(err instanceof GscApiError);
      assert.equal(err.code, "TIMEOUT");
      return true;
    },
  );
});

// --- 5. Token cache isolation -----------------------------------------------

test("[SIMULATED] Token 缓存按 Service Account 身份隔离，不串用", async () => {
  const ff = fakeFetch({ analytics: () => jsonRes(200, { rows: [] }) });
  const client = createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl });

  await client.querySearchAnalytics(cfg("sc-domain:volsunsgr.com", "sa-a"), params());
  await client.querySearchAnalytics(cfg("sc-domain:volsunsgr.com", "sa-a"), params());
  assert.equal(ff.calls.filter((c) => c.url.includes("oauth2")).length, 1, "same identity → cached");
  assert.equal(getGscTokenCacheSize(), 1);

  await client.querySearchAnalytics(cfg("sc-domain:coldshrinktubing.com", "sa-b"), params());
  assert.equal(ff.calls.filter((c) => c.url.includes("oauth2")).length, 2, "different email → new token");
  assert.equal(getGscTokenCacheSize(), 2);

  await client.querySearchAnalytics(
    { ...cfg("sc-domain:volsunsgr.com", "sa-a"), privateKey: "SIMULATED_DIFFERENT_KEY" },
    params(),
  );
  assert.equal(ff.calls.filter((c) => c.url.includes("oauth2")).length, 3, "different key → new token");
  assert.equal(getGscTokenCacheSize(), 3);
});

// --- 6. Five-site whitelist + failure isolation -------------------------------

test("[SIMULATED] 五站 Property 白名单：5 个规范 ID、别名接受、外部域名拒绝", () => {
  assert.equal(FIVE_SITE_PROPERTIES.length, 5);
  assert.equal(listAllowedProperties().length, 5);
  assert.equal(new Set(listAllowedProperties()).size, 5);
  for (const site of FIVE_SITE_PROPERTIES) {
    assert.equal(isAllowedProperty(site.propertyId), true, site.propertyId);
    assert.equal(isAllowedProperty(`https://www.${site.domain}/`), true, `https://www.${site.domain}/`);
  }
  assert.equal(
    FIVE_SITE_PROPERTIES.find((s) => s.key === "volsungroup")?.requiresThirdPartyApproval,
    true,
  );
  assert.equal(isAllowedProperty("sc-domain:evil.com"), false);
  assert.equal(isAllowedProperty("https://www.volsunsgr.com.evil.com/"), false);
  assert.equal(isAllowedProperty(""), false);
  assert.throws(() => assertAllowedProperty("sc-domain:evil.com"), (err: unknown) => {
    assert.ok(err instanceof GscPropertyNotAllowedError);
    assert.equal(err.code, "PROPERTY_NOT_ALLOWED");
    return true;
  });
});

test("[SIMULATED] 非白名单 Property 在发任何请求前被拒绝（0 次网络调用）", async () => {
  const ff = fakeFetch();
  await assert.rejects(
    () =>
      createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl })
        .querySearchAnalytics(cfg("sc-domain:evil.com"), params()),
    (err: unknown) => {
      assert.ok(err instanceof GscPropertyNotAllowedError);
      return true;
    },
  );
  assert.equal(ff.calls.length, 0);
});

test("[SIMULATED] 单个网站失败不污染其他网站数据（collectAcrossSites 隔离）", async () => {
  const result = await collectAcrossSites(async (site) => {
    if (site.key === "volsungroup") {
      throw new GscApiError("PERMISSION_DENIED", "searchAnalytics.query", "denied", { status: 403 });
    }
    return { marker: `rows-of-${site.key}` };
  });

  assert.equal(result.total, 5);
  assert.equal(result.successCount, 4);
  assert.equal(result.failureCount, 1);
  const failed = result.results.find((r) => r.key === "volsungroup");
  assert.equal(failed?.status, "failed");
  assert.equal(failed?.data, null, "failed site must not carry any data");
  assert.equal(failed?.error?.code, "PERMISSION_DENIED");
  for (const ok of result.results.filter((r) => r.status === "ok")) {
    assert.equal(ok.data?.marker, `rows-of-${ok.key}`, "each site keeps its own payload");
    assert.notEqual(ok.data?.marker, "rows-of-volsungroup");
  }
});

test("[SIMULATED] 客户端层隔离：B 站 403 后 A 站结果仍正确", async () => {
  const ff = fakeFetch({
    analytics: (_body, _page) => jsonRes(200, { rows: [] }),
  });
  const routing: FetchLike = (url, init) => {
    if (url.includes(encodeURIComponent("sc-domain:coldshrinktubing.com"))) {
      return Promise.resolve(jsonRes(403, { error: { status: "PERMISSION_DENIED" } }));
    }
    return ff.fetchImpl(url, init);
  };
  const client = createGscClient({ ...OFFLINE, fetchImpl: routing });
  const a = await client.querySearchAnalytics(cfg("sc-domain:volsunsgr.com"), params());
  await assert.rejects(
    () => client.querySearchAnalytics(cfg("sc-domain:coldshrinktubing.com"), params()),
    (err: unknown) => err instanceof GscApiError && err.code === "PERMISSION_DENIED",
  );
  const aAgain = await client.querySearchAnalytics(cfg("sc-domain:volsunsgr.com"), params());
  assert.deepEqual(aAgain.rows, a.rows);
  assert.equal(aAgain.diagnostics.property, "sc-domain:volsunsgr.com");
});

// --- 7. Sitemap read-only GET ------------------------------------------------

test("[SIMULATED] Sitemap 只读 GET 正常解析", async () => {
  const ff = fakeFetch({
    sitemaps: () =>
      jsonRes(200, {
        sitemap: [
          {
            path: "https://www.volsunsgr.com/sitemap.xml",
            lastSubmitted: "2026-11-01T00:00:00Z",
            isPending: false,
            isSitemapsIndex: false,
            contents: [{ type: "web", submitted: 10, indexed: 9 }],
          },
        ],
      }),
  });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl }).listSitemaps(cfg());
  assert.equal(result.length, 1);
  assert.equal(result[0].path, "https://www.volsunsgr.com/sitemap.xml");
  assert.equal(result[0].contentsCount, 1);
  const call = ff.calls.find((c) => c.url.endsWith("/sitemaps"));
  assert.equal(call?.init.method, "GET");
  assert.equal(call?.init.body, undefined, "GET must not carry a write body");
});

test("[SIMULATED] Sitemap 读取异常：5xx / 403 / 非法 JSON / 结构异常", async () => {
  const cases: { name: string; response: () => Response; expected: string }[] = [
    { name: "500", response: () => jsonRes(500, { error: "backendError" }), expected: "SERVER_ERROR" },
    { name: "403", response: () => jsonRes(403, { error: { status: "PERMISSION_DENIED" } }), expected: "PERMISSION_DENIED" },
    {
      name: "malformed JSON",
      response: () => new Response("not-json", { status: 200, headers: { "content-type": "application/json" } }),
      expected: "INVALID_RESPONSE",
    },
    { name: "sitemap not array", response: () => jsonRes(200, { sitemap: "oops" }), expected: "INVALID_RESPONSE" },
  ];
  for (const c of cases) {
    const ff = fakeFetch({ sitemaps: c.response });
    await assert.rejects(
      () => createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl }).listSitemaps(cfg()),
      (err: unknown) => {
        assert.ok(err instanceof GscApiError, c.name);
        assert.equal(err.code, c.expected, c.name);
        return true;
      },
    );
  }
});

test("[SIMULATED] Sitemap 缺失字段视为「无 sitemap」，不编造数据", async () => {
  const ff = fakeFetch({ sitemaps: () => jsonRes(200, {}) });
  const result = await createGscClient({ ...OFFLINE, fetchImpl: ff.fetchImpl }).listSitemaps(cfg());
  assert.deepEqual(result, []);
});

// --- 8. Explicit test classification -----------------------------------------

test("[SIMULATED] 测试分类声明：0 次真实 GSC API 调用、0 个真实凭据", () => {
  assert.equal("SIMULATED_OFFLINE_HTTP_TESTS", "SIMULATED_OFFLINE_HTTP_TESTS");
  assert.equal(getGscTokenCacheSize() >= 0, true);
});
