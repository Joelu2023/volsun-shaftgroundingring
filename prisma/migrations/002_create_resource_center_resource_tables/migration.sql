-- Resource Center Phase 1 / Step 4
-- Resource tables only:
--   rc_resources
--   rc_resource_files
-- Do not add audit tables in this migration.

CREATE TYPE "rc_resource_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "rc_resource_category" AS ENUM ('catalog', 'datasheet', 'installation', 'case-study', 'faq');

-- Step 1: create rc_resources first.
-- Define current_file_id now, but do not add the FK yet.
CREATE TABLE "rc_resources" (
    "id" UUID NOT NULL,
    "resource_key" VARCHAR(120) NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" "rc_resource_category" NOT NULL,
    "summary" TEXT NOT NULL,
    "version_label" VARCHAR(64) NOT NULL,
    "related_product_slug" VARCHAR(160),
    "status" "rc_resource_status" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 100,
    "published_at" TIMESTAMPTZ(6),
    "current_file_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "rc_resources_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rc_resources_current_file_id_key" UNIQUE ("current_file_id"),
    CONSTRAINT "rc_resources_slug_key" UNIQUE ("slug"),
    CONSTRAINT "rc_resources_resource_key_locale_key" UNIQUE ("resource_key", "locale"),
    CONSTRAINT "rc_resources_created_by_fkey"
        FOREIGN KEY ("created_by") REFERENCES "rc_users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT "rc_resources_updated_by_fkey"
        FOREIGN KEY ("updated_by") REFERENCES "rc_users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Step 2: create rc_resource_files and add resource_id -> rc_resources.id first.
CREATE TABLE "rc_resource_files" (
    "id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "storage_provider" VARCHAR(40) NOT NULL,
    "storage_bucket" VARCHAR(255),
    "storage_key" VARCHAR(500) NOT NULL,
    "public_url_cache" TEXT,
    "original_filename" VARCHAR(255) NOT NULL,
    "normalized_filename" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(120) NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "checksum_sha256" VARCHAR(128),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" UUID,

    CONSTRAINT "rc_resource_files_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rc_resource_files_resource_id_version_no_key" UNIQUE ("resource_id", "version_no"),
    CONSTRAINT "rc_resource_files_resource_id_fkey"
        FOREIGN KEY ("resource_id") REFERENCES "rc_resources"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT "rc_resource_files_uploaded_by_fkey"
        FOREIGN KEY ("uploaded_by") REFERENCES "rc_users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Step 3: only after rc_resource_files exists, add rc_resources.current_file_id -> rc_resource_files.id.
ALTER TABLE "rc_resources"
ADD CONSTRAINT "rc_resources_current_file_id_fkey"
    FOREIGN KEY ("current_file_id") REFERENCES "rc_resource_files"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Step 4: add the partial unique index for the secondary current marker.
CREATE UNIQUE INDEX "rc_resource_files_one_current_per_resource_idx"
    ON "rc_resource_files"("resource_id")
    WHERE "is_current" = true;

CREATE INDEX "rc_resources_status_idx" ON "rc_resources"("status");
CREATE INDEX "rc_resources_category_idx" ON "rc_resources"("category");
CREATE INDEX "rc_resources_related_product_slug_idx" ON "rc_resources"("related_product_slug");
CREATE INDEX "rc_resource_files_uploaded_at_idx" ON "rc_resource_files"("uploaded_at");
