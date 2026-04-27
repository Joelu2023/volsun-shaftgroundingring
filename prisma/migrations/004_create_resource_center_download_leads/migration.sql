-- Resource Center Lead Capture
-- Table:
--   rc_resource_download_leads

CREATE TABLE "rc_resource_download_leads" (
    "id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255),
    "name" VARCHAR(120),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rc_resource_download_leads_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rc_resource_download_leads_resource_id_fkey"
        FOREIGN KEY ("resource_id") REFERENCES "rc_resources"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "rc_resource_download_leads_resource_id_idx" ON "rc_resource_download_leads"("resource_id");
CREATE INDEX "rc_resource_download_leads_created_at_idx" ON "rc_resource_download_leads"("created_at");
