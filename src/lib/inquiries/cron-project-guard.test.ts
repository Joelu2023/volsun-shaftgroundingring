import assert from "node:assert/strict";
import test from "node:test";
import {
  APPROVED_CRON_PROJECT,
  checkCronProjectIsolation,
  isDedicatedSecret,
} from "./cron-project-guard";
import type { CronProjectEnv } from "./cron-project-guard";

const SECRET = "b3_dedicated_cron_secret_2026";
const AUTH = `Bearer ${SECRET}`;

function env(overrides: Partial<CronProjectEnv> = {}): CronProjectEnv {
  return {
    INQUIRY_CRON_PROJECT: APPROVED_CRON_PROJECT,
    INQUIRY_CRON_ENABLED: "true",
    INQUIRY_CRON_SECRET: SECRET,
    ...overrides,
  };
}

test("三道门全通过才允许", () => {
  const result = checkCronProjectIsolation(AUTH, env());
  assert.deepEqual(result, { allowed: true });
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
});

test("独立密钥不得与旧 CRON_SECRET 相同", () => {
  assert.equal(isDedicatedSecret("shared", "shared"), false);
  assert.equal(isDedicatedSecret("dedicated", "legacy"), true);
  assert.equal(isDedicatedSecret(undefined, "legacy"), false);
  assert.equal(isDedicatedSecret("  ", "legacy"), false);
});

test("大小写/前后空格归一：项目名小写化后严格匹配", () => {
  const result = checkCronProjectIsolation(AUTH, env({ INQUIRY_CRON_PROJECT: "  volsun-shaftgroundingring  " }));
  assert.equal(result.allowed, true);
});
