-- B2: enterprise WeCom alert delivery records, deduplication and human workflow.
-- ADDITIVE only. No production migration is executed by this PR.
-- Security: the webhook key is NEVER persisted; only the host is stored for audit.

CREATE TABLE "inquiry_alert_notices" (
  "id" UUID NOT NULL,
  "public_number" VARCHAR(64) NOT NULL,
  "level" VARCHAR(2) NOT NULL,
  "alert_type" VARCHAR(64) NOT NULL,
  "status" VARCHAR(16) NOT NULL,
  "error_code" VARCHAR(64),
  "failure_reason" VARCHAR(64),
  "failed_at" TIMESTAMPTZ(6),
  "webhook_host" VARCHAR(128) NOT NULL,
  "attempted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dedupe_key" VARCHAR(160),
  "workflow_status" VARCHAR(16) NOT NULL DEFAULT 'open',
  "acknowledged_at" TIMESTAMPTZ(6),
  "acknowledged_by" VARCHAR(64),
  "closed_at" TIMESTAMPTZ(6),
  "closed_by" VARCHAR(64),

  CONSTRAINT "inquiry_alert_notices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "inquiry_alert_notices_level_check" CHECK ("level" IN ('P1','P2','P3')),
  CONSTRAINT "inquiry_alert_notices_status_check" CHECK ("status" IN ('sent','failed','skipped')),
  CONSTRAINT "inquiry_alert_notices_workflow_check" CHECK ("workflow_status" IN ('open','in_progress','closed'))
);

CREATE UNIQUE INDEX "inquiry_alert_notices_dedupe_key"
  ON "inquiry_alert_notices" ("dedupe_key") WHERE "dedupe_key" IS NOT NULL;
CREATE INDEX "inquiry_alert_notices_level_attempted_idx" ON "inquiry_alert_notices" ("level", "attempted_at");
CREATE INDEX "inquiry_alert_notices_public_number_idx" ON "inquiry_alert_notices" ("public_number");
