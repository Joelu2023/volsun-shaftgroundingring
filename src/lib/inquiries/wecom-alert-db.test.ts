import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { createPgAlertNoticeStore } from "./wecom-alert-store";
import type { WeComAlertResult } from "./wecom-alert";

const url = process.env.INQUIRY_TEST_DATABASE_URL?.trim();

function delivery(overrides: Partial<WeComAlertResult> = {}): WeComAlertResult {
  return {
    ok: false,
    level: "P1",
    publicNumber: "INQ-DB-0001",
    alertType: "db_unavailable",
    status: "failed",
    reason: "http_error",
    httpStatus: 503,
    webhookHost: "qyapi.weixin.qq.com",
    ...overrides,
  };
}

test("真实数据库：告警失败记录与人工确认可追溯，重复确认被拒", { skip: url ? false : "no test database" }, async () => {
  const pool = new Pool({ connectionString: url, max: 4 });
  const store = createPgAlertNoticeStore(pool);
  const number = `INQ-DB-${randomUUID().slice(0, 8).toUpperCase()}`;
  try {
    await store.record(delivery({ publicNumber: number }), new Date("2026-11-28T00:00:00.000Z"));
    await store.record(
      delivery({ publicNumber: number, level: "P3", status: "sent", ok: true, reason: undefined, alertType: "config_missing" }),
      new Date("2026-11-28T00:01:00.000Z"),
    );

    const list = await store.list(20);
    const rows = list.filter((row) => row.publicNumber === number);
    assert.equal(rows.length, 2);
    const failed = rows.find((row) => row.status === "failed");
    assert.ok(failed);
    assert.equal(failed.level, "P1");
    assert.equal(failed.errorCode, null); // http_error 不写 errcode
    assert.equal(failed.webhookHost, "qyapi.weixin.qq.com");
    assert.equal(failed.acknowledgedAt, null);
    assert.equal(JSON.stringify(list).includes("key="), false, "webhook key must never be persisted");
    assert.equal(JSON.stringify(list).includes("qyapi.weixin.qq.com/cgi-bin"), false);

    const ack = await store.acknowledge(failed.id, "ops-admin", new Date("2026-11-28T00:05:00.000Z"));
    assert.equal(ack.ok, true);
    if (ack.ok) {
      assert.equal(ack.row.acknowledgedBy, "ops-admin");
      assert.equal(ack.row.acknowledgedAt, "2026-11-28T00:05:00.000Z");
    }
    const again = await store.acknowledge(failed.id, "ops-admin");
    assert.equal(again.ok, false);
    if (!again.ok) assert.equal(again.error, "already_acknowledged");

    const missing = await store.acknowledge(randomUUID(), "ops-admin");
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.error, "not_found");
  } finally {
    await pool.query("delete from inquiry_alert_notices where public_number = $1", [number]);
    await pool.end();
  }
});
