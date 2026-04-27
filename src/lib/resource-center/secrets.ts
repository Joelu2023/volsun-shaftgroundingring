const DEV_SESSION_SECRET = "resource-center-dev-session-secret";
const DEV_LEAD_SIGNING_SECRET = "resource-center-dev-lead-signing-secret";

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getResourceCenterSessionSecret() {
  const value = readEnv("RESOURCE_CENTER_SESSION_SECRET");
  if (value) {
    return value;
  }
  if (isProductionRuntime()) {
    throw new Error("[resource-center] Missing required env: RESOURCE_CENTER_SESSION_SECRET");
  }
  return DEV_SESSION_SECRET;
}

export function getResourceCenterLeadSigningSecret() {
  const value = readEnv("RESOURCE_CENTER_LEAD_SIGNING_SECRET");
  if (value) {
    return value;
  }
  if (isProductionRuntime()) {
    throw new Error("[resource-center] Missing required env: RESOURCE_CENTER_LEAD_SIGNING_SECRET");
  }
  return DEV_LEAD_SIGNING_SECRET;
}
