-- One retention-cleanup claim per UTC day. Does not alter resource-center tables.

CREATE TABLE "inquiry_retention_runs" (
  "run_date" DATE NOT NULL,
  "status" VARCHAR(32) NOT NULL,
  "started_at" TIMESTAMPTZ(6) NOT NULL,
  "finished_at" TIMESTAMPTZ(6),
  "deleted_count" INTEGER,

  CONSTRAINT "inquiry_retention_runs_pkey" PRIMARY KEY ("run_date"),
  CONSTRAINT "inquiry_retention_runs_status_check"
    CHECK ("status" IN ('running', 'succeeded', 'failed'))
);
