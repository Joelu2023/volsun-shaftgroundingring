-- Resource Center download page view counter (minimal analytics)
CREATE TABLE "rc_resource_download_visits" (
    "id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rc_resource_download_visits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rc_resource_download_visits_resource_id_fkey"
        FOREIGN KEY ("resource_id") REFERENCES "rc_resources"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "rc_resource_download_visits_resource_id_idx" ON "rc_resource_download_visits"("resource_id");
CREATE INDEX "rc_resource_download_visits_created_at_idx" ON "rc_resource_download_visits"("created_at");
