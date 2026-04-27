import type { AppLocale } from "@/lib/i18n/locales";
import {
  RESOURCE_ADMIN_ROLES,
  RESOURCE_CATEGORIES,
  RESOURCE_STATUSES,
} from "@/lib/resource-center/constants";

export { RESOURCE_ADMIN_ROLES, RESOURCE_CATEGORIES, RESOURCE_STATUSES };

export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
export type ResourceAdminRole = (typeof RESOURCE_ADMIN_ROLES)[number];

export type ResourceRecord = {
  id: string;
  slug: string;
  title: string;
  locale: AppLocale;
  category: ResourceCategory;
  summary: string;
  file_url: string | null;
  cover_image_url: string | null;
  file_type: string | null;
  file_size: number | null;
  version: string;
  related_product_slug: string | null;
  is_published: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type ResourceEntity = {
  id: string;
  resource_key: string;
  locale: AppLocale;
  slug: string;
  title: string;
  category: ResourceCategory;
  summary: string;
  version_label: string;
  related_product_slug: string | null;
  status: ResourceStatus;
  sort_order: number;
  published_at: string | null;
  current_file_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ResourceFileEntity = {
  id: string;
  resource_id: string;
  version_no: number;
  storage_provider: string;
  storage_bucket: string | null;
  storage_key: string;
  public_url_cache: string | null;
  original_filename: string;
  normalized_filename: string;
  mime_type: string;
  file_size_bytes: number;
  checksum_sha256: string | null;
  is_current: boolean;
  uploaded_at: string;
  uploaded_by: string | null;
};

// current_file_id is the primary truth for the active file pointer.
// is_current is a synchronized secondary marker kept for indexing and checks.
export type ResourceCurrentFileReference = {
  current_file_id: ResourceEntity["current_file_id"];
  is_current: ResourceFileEntity["is_current"];
};

export type ResourceUserEntity = {
  id: string;
  username: string;
  email: string | null;
  display_name: string;
  status: "active" | "disabled";
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

export type AuditLogEntity = {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  summary: string;
  before_json: unknown;
  after_json: unknown;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

export type ResourceAdminUser = {
  username: string;
  password: string;
  role: ResourceAdminRole;
};

export type ResourceSession = {
  authMode?: "env" | "db";
  userId?: string;
  username: string;
  role: ResourceAdminRole;
  expiresAt: number;
};

export type ResourceFormInput = {
  title: string;
  locale: AppLocale;
  category: ResourceCategory;
  summary: string;
  cover_image_url: string | null;
  version: string;
  related_product_slug: string | null;
  is_published: boolean;
  sort_order: number;
};
