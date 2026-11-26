-- Durable website inquiries. Separate from resource-center rc_* tables.

CREATE TYPE "inquiry_record_status" AS ENUM (
  'received',
  'notification_pending',
  'notified',
  'notification_failed'
);

CREATE TABLE "inquiry_records" (
  "id" UUID NOT NULL,
  "public_number" VARCHAR(32) NOT NULL,
  "idempotency_key" VARCHAR(80) NOT NULL,
  "status" "inquiry_record_status" NOT NULL,
  "smtp_outcome" VARCHAR(32),
  "payload" JSONB NOT NULL,
  "latest_request_id" VARCHAR(64) NOT NULL,
  "smtp_error_sanitized" VARCHAR(500),
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "attempt_started_at" TIMESTAMPTZ(6),
  "notified_at" TIMESTAMPTZ(6),
  "retain_until" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "inquiry_records_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inquiry_records_public_number_key" UNIQUE ("public_number"),
  CONSTRAINT "inquiry_records_idempotency_key_key" UNIQUE ("idempotency_key")
);

CREATE INDEX "inquiry_records_status_created_at_idx" ON "inquiry_records" ("status", "created_at");
CREATE INDEX "inquiry_records_retain_until_idx" ON "inquiry_records" ("retain_until");
