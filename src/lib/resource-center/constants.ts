export const RESOURCE_STATUSES = ["draft", "published", "archived"] as const;

export const RESOURCE_CATEGORIES = [
  "catalog",
  "datasheet",
  "installation",
  "case-study",
  "faq",
] as const;

export const RESOURCE_ADMIN_ROLES = ["admin", "editor"] as const;

export const RESOURCE_CENTER_FLAGS = {
  dbEnabled: "RC_DB_ENABLED",
  dbReadEnabled: "RC_DB_READ_ENABLED",
  authDbEnabled: "RC_AUTH_DB_ENABLED",
} as const;

