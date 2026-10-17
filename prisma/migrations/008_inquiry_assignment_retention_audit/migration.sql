-- Inquiry assignment, follow-up, and retention audit.
-- Does not alter resource-center rc_* tables and does not seed sales users.

ALTER TABLE "inquiry_records"
  ADD COLUMN "assigned_username" VARCHAR(64),
  ADD COLUMN "assigned_user_id" UUID,
  ADD COLUMN "assigned_at" TIMESTAMPTZ(6),
  ADD COLUMN "follow_up_status" VARCHAR(32) NOT NULL DEFAULT 'unassigned';

ALTER TABLE "inquiry_records"
  ADD CONSTRAINT "inquiry_records_follow_up_status_check"
  CHECK ("follow_up_status" IN ('unassigned', 'open', 'in_progress', 'closed'));

CREATE INDEX "inquiry_records_assigned_username_idx" ON "inquiry_records" ("assigned_username");
CREATE INDEX "inquiry_records_assigned_user_id_idx" ON "inquiry_records" ("assigned_user_id");
CREATE INDEX "inquiry_records_follow_up_status_idx" ON "inquiry_records" ("follow_up_status");

CREATE TABLE "inquiry_audit_events" (
  "id" UUID NOT NULL,
  "inquiry_id" UUID,
  "action" VARCHAR(64) NOT NULL,
  "actor_username" VARCHAR(64) NOT NULL,
  "actor_role" VARCHAR(32) NOT NULL,
  "detail" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "inquiry_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inquiry_audit_events_inquiry_id_idx" ON "inquiry_audit_events" ("inquiry_id");
CREATE INDEX "inquiry_audit_events_action_created_at_idx" ON "inquiry_audit_events" ("action", "created_at");
