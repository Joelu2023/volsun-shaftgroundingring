-- Resource Center Phase 1 / Step 5
-- Audit logs only:
--   rc_audit_logs
-- Do not modify core tables or resource tables in this migration.

CREATE TABLE "rc_audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" VARCHAR(64) NOT NULL,
    "target_type" VARCHAR(40) NOT NULL,
    "target_id" VARCHAR(120),
    "summary" VARCHAR(255) NOT NULL,
    "before_json" JSONB,
    "after_json" JSONB,
    "ip" VARCHAR(64),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rc_audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rc_audit_logs_actor_user_id_fkey"
        FOREIGN KEY ("actor_user_id") REFERENCES "rc_users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX "rc_audit_logs_actor_user_id_idx" ON "rc_audit_logs"("actor_user_id");
CREATE INDEX "rc_audit_logs_target_type_target_id_idx" ON "rc_audit_logs"("target_type", "target_id");
CREATE INDEX "rc_audit_logs_created_at_idx" ON "rc_audit_logs"("created_at");
