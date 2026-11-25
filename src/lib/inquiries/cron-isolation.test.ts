import assert from "node:assert/strict";
import test from "node:test";
import { isCronEnabledForProject, isPurgeAllowed, selectPurgeableNumbers } from "./cron-isolation";

test("项目级开关：仅严格 true 启用", () => {
  assert.equal(isCronEnabledForProject("true"), true);
  assert.equal(isCronEnabledForProject(" TRUE "), true);
  assert.equal(isCronEnabledForProject("false"), false);
  assert.equal(isCronEnabledForProject(""), false);
  assert.equal(isCronEnabledForProject(null), false);
  assert.equal(isCronEnabledForProject("1"), false);
});

const now = new Date("2026-11-25T12:00:00.000Z");
const expired = "2026-01-01T00:00:00.000Z";
const future = "2027-01-01T00:00:00.000Z";

test("红线：未通知询盘即使过期也不清理", () => {
  const base = { publicNumber: "INQ-1", retainUntil: expired };
  assert.equal(isPurgeAllowed({ ...base, status: "notification_failed", smtpOutcome: "failed" }, now), false);
  assert.equal(isPurgeAllowed({ ...base, status: "notification_pending", smtpOutcome: "uncertain" }, now), false);
  assert.equal(isPurgeAllowed({ ...base, status: "received", smtpOutcome: null }, now), false);
});

test("仅已通知成功且过期可清理", () => {
  assert.equal(
    isPurgeAllowed({ publicNumber: "INQ-2", retainUntil: expired, status: "notified", smtpOutcome: "accepted" }, now),
    true,
  );
});

test("未过期 / 无保留期 / 无效日期均不清理", () => {
  assert.equal(
    isPurgeAllowed({ publicNumber: "INQ-3", retainUntil: future, status: "notified", smtpOutcome: "accepted" }, now),
    false,
  );
  assert.equal(
    isPurgeAllowed({ publicNumber: "INQ-4", retainUntil: null, status: "notified", smtpOutcome: "accepted" }, now),
    false,
  );
  assert.equal(
    isPurgeAllowed({ publicNumber: "INQ-5", retainUntil: "not-a-date", status: "notified", smtpOutcome: "accepted" }, now),
    false,
  );
});

test("批量过滤只返回可清理编号", () => {
  const rows = [
    { publicNumber: "A", retainUntil: expired, status: "notified", smtpOutcome: "accepted" },
    { publicNumber: "B", retainUntil: expired, status: "notification_failed", smtpOutcome: "failed" },
    { publicNumber: "C", retainUntil: future, status: "notified", smtpOutcome: "accepted" },
  ];
  assert.deepEqual(selectPurgeableNumbers(rows, now), ["A"]);
});
