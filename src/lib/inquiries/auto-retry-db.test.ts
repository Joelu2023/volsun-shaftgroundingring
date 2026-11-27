import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { runAutoRetrySweep } from "./auto-retry";
import { closeInquiryStoreForTests, createPgInquiryStore, setInquiryStoreForTests } from "./durable-store";
import { parseInquirySubmission } from "./validate";

const url = process.env.INQUIRY_TEST_DATABASE_URL?.trim();
const options = { skip: url ? false : "INQUIRY_TEST_DATABASE_URL is not set" };

function payload() {
  const parsed = parseInquirySubmission({
    name: "B1 DB Test",
    company: "VOLSUN Internal",
    email: "b1-db@example.com",
    phone_or_whatsapp: "+1 555 0102",
    country: "Singapore",
    product_interest: "solid-shaft-grounding-ring",
    inquiry_type: "rfq",
    page_source: "contact",
    cta_source: "contact_form",
    cta_key: "quote",
    source_page: "/en/contact",
    submitted_at: "2026-11-27T00:00:00.000Z",
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error("payload");
  return parsed.data;
}

test("B1 integration: schema, idempotency, and UNCERTAIN protection on a real PostgreSQL", options, async () => {
  assert.ok(url);
  const pool = new Pool({ connectionString: url, max: 5 });
  const store = createPgInquiryStore(pool);
  setInquiryStoreForTests(store);
  const now = new Date("2026-11-27T01:00:00.000Z");
  let sends = 0;

  try {
    const columns = await pool.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_name = 'inquiry_records' and column_name in ('next_retry_at','auto_retry_exhausted')`,
    );
    assert.equal(columns.rows.length, 2, "migration 010 columns must exist");

    const ids: string[] = [];
    for (const outcome of ["failed", "uncertain"]) {
      const id = randomUUID();
      ids.push(id);
      await pool.query(
        `insert into inquiry_records (
           id, public_number, idempotency_key, status, smtp_outcome, payload, latest_request_id,
           smtp_error_sanitized, attempt_count, next_retry_at, created_at, updated_at
         ) values ($1,$2,$3,'notification_failed',$4,$5::jsonb,$6,$7,1,$8,$9,$9)`,
        [
          id,
          `INQ-B1-${outcome.toUpperCase()}-${id.slice(0, 6)}`,
          randomUUID(),
          outcome,
          JSON.stringify(payload()),
          "req-b1-db",
          outcome === "failed" ? "ECONNREFUSED" : "smtp_uncertain",
          new Date("2026-11-27T00:30:00.000Z"),
          now,
        ],
      );
    }

    // Two concurrent sweeps must not send the same retry twice.
    const deps = {
      enabled: true,
      now: () => now,
      sendInquiryEmail: async () => {
        sends += 1;
      },
      getMissingSmtpEnv: () => [],
    };
    const [a, b] = await Promise.all([
      runAutoRetrySweep({ store, ...deps }),
      runAutoRetrySweep({ store, ...deps }),
    ]);
    assert.equal(a.stats.sent + b.stats.sent, 1, "exactly one send across concurrent sweeps");
    assert.equal(sends, 1);

    const rows = await pool.query<{ id: string; smtp_outcome: string; status: string; attempt_count: number }>(
      `select id, smtp_outcome, status, attempt_count from inquiry_records where id = any($1::uuid[])`,
      [ids],
    );
    const uncertain = rows.rows.find((r) => r.id === ids[1]);
    assert.ok(uncertain);
    assert.equal(uncertain.status, "notification_failed");
    assert.equal(uncertain.attempt_count, 1, "UNCERTAIN row must never be auto-retried");
  } finally {
    setInquiryStoreForTests(undefined);
    await closeInquiryStoreForTests();
    await pool.end();
  }
});
