import assert from "node:assert/strict";
import test from "node:test";
import {
  APPROVED_CRON_PROJECT,
  checkCronProjectIsolation,
  isDedicatedSecret,
  verifyCronPreAuthorization,
} from "./cron-project-guard";
import type { CronProjectEnv } from "./cron-project-guard";
import { runScheduledRetentionCleanup } from "./retention-cron";

const SECRET = "b3_dedicated_cron_secret_2026";
const LEGACY = "b3_legacy_cron_secret_2026";
const AUTH = `Bearer ${SECRET}`;

function env(overrides: Partial<CronProjectEnv> = {}): CronProjectEnv {
  return {
    INQUIRY_CRON_PROJECT: APPROVED_CRON_PROJECT,
    INQUIRY_CRON_ENABLED: "true",
    INQUIRY_CRON_SECRET: SECRET,
    CRON_SECRET: LEGACY,
    ...overrides,
  };
}

function pass(authorization: string | null = AUTH, overrides: Partial<CronProjectEnv> = {}) {
  const result = checkCronProjectIsolation(authorization, env(overrides));
  assert.equal(result.allowed, true);
  if (!result.allowed) throw new Error("guard must pass");
  return result.preAuthorization;
}

test("四道门全通过才允许，并签发不可伪造的预授权凭据", () => {
  const token = pass();
  assert.equal(verifyCronPreAuthorization(token, AUTH), true);
  // 同一凭据绑定到原请求头，换一个请求头即失效。
  assert.equal(verifyCronPreAuthorization(token, "Bearer another-secret"), false);
  // boolean / 普通对象无法伪造。
  assert.equal(verifyCronPreAuthorization(true, AUTH), false);
  assert.equal(verifyCronPreAuthorization({ authorization: AUTH }, AUTH), false);
  assert.equal(verifyCronPreAuthorization(null, AUTH), false);
});

test("项目名错误或未配置：403 project_not_allowed（scratch 项目自动拒绝）", () => {
  for (const project of [undefined, "", "volsunsgr-w40-installation-links-20261008", "VOLSUGR-SHAFTGROUNDINGRING "]) {
    const result = checkCronProjectIsolation(AUTH, env({ INQUIRY_CRON_PROJECT: project }));
    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.equal(result.reason, "project_not_allowed");
      assert.equal(result.httpStatus, 403);
    }
  }
});

test("项目开关未启用：409 cron_disabled（沿用 isCronEnabledForProject 的大小写归一语义）", () => {
  for (const value of [undefined, "", "false", "1", "yes"]) {
    const result = checkCronProjectIsolation(AUTH, env({ INQUIRY_CRON_ENABLED: value }));
    assert.equal(result.allowed, false);
    if (!result.allowed) {
      assert.equal(result.reason, "cron_disabled");
      assert.equal(result.httpStatus, 409);
    }
  }
});

test("独立密钥缺失或错误：401，且不明文回显", () => {
  const missing = checkCronProjectIsolation(AUTH, env({ INQUIRY_CRON_SECRET: "" }));
  assert.equal(missing.allowed, false);
  if (!missing.allowed) {
    assert.equal(missing.reason, "secret_missing");
    assert.equal(missing.httpStatus, 401);
  }
  const wrong = checkCronProjectIsolation("Bearer wrong-secret", env());
  assert.equal(wrong.allowed, false);
  if (!wrong.allowed) {
    assert.equal(wrong.reason, "unauthorized");
    assert.equal(JSON.stringify(wrong).includes(SECRET), false);
  }
  const noBearer = checkCronProjectIsolation(SECRET, env());
  assert.equal(noBearer.allowed, false);
  const lowerBearer = checkCronProjectIsolation(`bearer ${SECRET}`, env());
  assert.equal(lowerBearer.allowed, false);
});

test("独立密钥不得与旧 CRON_SECRET 相同（含空格归一）", () => {
  assert.equal(isDedicatedSecret("shared", "shared"), false);
  assert.equal(isDedicatedSecret("  shared  ", "shared"), false);
  assert.equal(isDedicatedSecret("dedicated", "legacy"), true);
  assert.equal(isDedicatedSecret(undefined, "legacy"), false);
  assert.equal(isDedicatedSecret("  ", "legacy"), false);

  // 即使请求头完全匹配，共用旧密钥也必须被守卫拒绝。
  const shared = checkCronProjectIsolation("Bearer shared", env({ INQUIRY_CRON_SECRET: " shared ", CRON_SECRET: "shared" }));
  assert.equal(shared.allowed, false);
  if (!shared.allowed) {
    assert.equal(shared.reason, "secret_not_dedicated");
    assert.equal(shared.httpStatus, 409);
  }
  // 旧密钥未配置时，独立密钥可以正常使用。
  assert.equal(checkCronProjectIsolation(AUTH, env({ CRON_SECRET: undefined })).allowed, true);
});

test("身份伪造：scratch 项目名 + 生产密钥、生产项目名 + scratch 配置都拒绝", () => {
  const scratch = env({ INQUIRY_CRON_PROJECT: "volsunsgr-w40-installation-links-20261008" });
  assert.equal(checkCronProjectIsolation(AUTH, scratch).allowed, false);
  // scratch 未配置独立密钥，冒充生产项目名仍拒绝。
  const spoofed = env({ INQUIRY_CRON_SECRET: undefined, CRON_SECRET: undefined });
  const spoofedResult = checkCronProjectIsolation(AUTH, spoofed);
  assert.equal(spoofedResult.allowed, false);
  if (!spoofedResult.allowed) assert.equal(spoofedResult.reason, "secret_missing");
  // scratch 使用与通用 CRON_SECRET 相同的密钥，冒充生产项目名拒绝。
  const reused = env({ INQUIRY_CRON_SECRET: LEGACY });
  const reusedResult = checkCronProjectIsolation(`Bearer ${LEGACY}`, reused);
  assert.equal(reusedResult.allowed, false);
  if (!reusedResult.allowed) assert.equal(reusedResult.reason, "secret_not_dedicated");
});

test("预授权凭据绑定环境：A 项目签发的凭据不能在 B 请求头下跳过密钥校验", async () => {
  const token = pass();
  const result = await runScheduledRetentionCleanup({
    now: new Date(),
    authorization: "Bearer wrong-secret",
    store: {} as never,
    preAuthorization: token,
  });
  assert.equal(result.httpStatus, 401);
});

test("大小写/前后空格归一：项目名小写化后严格匹配", () => {
  assert.equal(checkCronProjectIsolation(AUTH, env({ INQUIRY_CRON_PROJECT: "  volsun-shaftgroundingring  " })).allowed, true);
});
