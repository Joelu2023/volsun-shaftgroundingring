-- B1: bounded automatic notification retry.
-- Additive only. No existing column is dropped or rewritten.
-- Feature stays disabled until INQUIRY_AUTO_RETRY_ENABLED=true.

ALTER TABLE "inquiry_records"
  ADD COLUMN "next_retry_at" TIMESTAMPTZ(6),
  ADD COLUMN "auto_retry_exhausted" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "inquiry_records_auto_retry_due_idx"
  ON "inquiry_records" ("next_retry_at")
  WHERE "next_retry_at" IS NOT NULL;

-- One row per (inquiry, auto-retry sequence number). The unique constraint is the
-- idempotency guard: concurrent sweeps cannot send the same retry twice.
CREATE TABLE "inquiry_auto_retry_attempts" (
  "id" UUID NOT NULL,
  "inquiry_id" UUID NOT NULL,
  "attempt_no" INTEGER NOT NULL,
  "status" VARCHAR(16) NOT NULL DEFAULT 'claimed',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_auto_retry_attempts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inquiry_auto_retry_attempts_inquiry_attempt_key" UNIQUE ("inquiry_id", "attempt_no")
);

CREATE INDEX "inquiry_auto_retry_attempts_inquiry_idx"
  ON "inquiry_auto_retry_attempts" ("inquiry_id");

-- P0-2: recover attempts whose worker died while holding the claim.
CREATE INDEX "inquiry_auto_retry_attempts_stale_idx"
  ON "inquiry_auto_retry_attempts" ("created_at")
  WHERE "status" = 'claimed';
