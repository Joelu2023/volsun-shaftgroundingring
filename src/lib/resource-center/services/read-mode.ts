import { RESOURCE_CENTER_FLAGS } from "@/lib/resource-center/constants";

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return value.trim().toLowerCase() === "true";
}

export function isResourceCenterDbEnabled(): boolean {
  return isTruthyFlag(process.env[RESOURCE_CENTER_FLAGS.dbEnabled]);
}

export function isResourceCenterDbReadEnabled(): boolean {
  return isTruthyFlag(process.env[RESOURCE_CENTER_FLAGS.dbReadEnabled]);
}

export function shouldPreferResourceCenterDbRead(): boolean {
  return isResourceCenterDbEnabled() && isResourceCenterDbReadEnabled();
}
