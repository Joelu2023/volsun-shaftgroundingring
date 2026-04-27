-- Resource Center Phase 1 / Step 3
-- Core tables only:
--   rc_users
--   rc_roles
--   rc_user_roles
-- Do not add resource, file, or audit tables in this migration.

CREATE TYPE "rc_user_status" AS ENUM ('active', 'disabled');
CREATE TYPE "rc_admin_role_code" AS ENUM ('admin', 'editor');

CREATE TABLE "rc_users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "email" VARCHAR(255),
    "password_hash" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "status" "rc_user_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "rc_users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rc_users_username_key" UNIQUE ("username"),
    CONSTRAINT "rc_users_email_key" UNIQUE ("email")
);

CREATE TABLE "rc_roles" (
    "id" UUID NOT NULL,
    "code" "rc_admin_role_code" NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rc_roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rc_roles_code_key" UNIQUE ("code")
);

CREATE TABLE "rc_user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rc_user_roles_pkey" PRIMARY KEY ("user_id", "role_id"),
    CONSTRAINT "rc_user_roles_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "rc_users"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT "rc_user_roles_role_id_fkey"
        FOREIGN KEY ("role_id") REFERENCES "rc_roles"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX "rc_users_status_idx" ON "rc_users"("status");
CREATE INDEX "rc_users_created_at_idx" ON "rc_users"("created_at");
CREATE INDEX "rc_roles_created_at_idx" ON "rc_roles"("created_at");
CREATE INDEX "rc_user_roles_role_id_idx" ON "rc_user_roles"("role_id");
