import {
  RESOURCE_ADMIN_ROLES,
  RESOURCE_CATEGORIES,
  RESOURCE_STATUSES,
} from "@/lib/resource-center/constants";

export type ResourceCenterTimestamp = string;
export type ResourceUserStatusValue = "active" | "disabled";
export type ResourceAdminRoleCodeValue = (typeof RESOURCE_ADMIN_ROLES)[number];
export type ResourceCategoryValue = (typeof RESOURCE_CATEGORIES)[number];
export type ResourceStatusValue = (typeof RESOURCE_STATUSES)[number];

export type ResourceUserRow = {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  display_name: string;
  status: ResourceUserStatusValue;
  created_at: ResourceCenterTimestamp;
  updated_at: ResourceCenterTimestamp;
  last_login_at: ResourceCenterTimestamp | null;
};

export type ResourceRoleRow = {
  id: string;
  code: ResourceAdminRoleCodeValue;
  name: string;
  description: string | null;
  created_at: ResourceCenterTimestamp;
};

export type ResourceUserRoleRow = {
  user_id: string;
  role_id: string;
  created_at: ResourceCenterTimestamp;
};

export type ResourceUserRoleWithRoleRow = ResourceUserRoleRow & {
  role: ResourceRoleRow;
};

export type ResourceRow = {
  id: string;
  resource_key: string;
  locale: string;
  slug: string;
  title: string;
  category: ResourceCategoryValue;
  summary: string;
  version_label: string;
  related_product_slug: string | null;
  status: ResourceStatusValue;
  sort_order: number;
  published_at: ResourceCenterTimestamp | null;
  current_file_id: string | null;
  created_at: ResourceCenterTimestamp;
  updated_at: ResourceCenterTimestamp;
  created_by: string | null;
  updated_by: string | null;
};

export type ResourceFileRow = {
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
  uploaded_at: ResourceCenterTimestamp;
  uploaded_by: string | null;
};

export type ResourceAuditLogRow = {
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
  created_at: ResourceCenterTimestamp;
};
