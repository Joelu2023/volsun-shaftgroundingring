-- Records which admin last handled an inquiry. Does not alter resource-center tables.

ALTER TABLE "inquiry_records"
  ADD COLUMN "handled_by" VARCHAR(64),
  ADD COLUMN "handled_at" TIMESTAMPTZ(6);
