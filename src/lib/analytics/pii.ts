export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

const BLOCKED_PAYLOAD_KEYS = new Set([
  "name",
  "full_name",
  "first_name",
  "last_name",
  "email",
  "email_address",
  "phone",
  "telephone",
  "mobile",
  "phone_or_whatsapp",
  "whatsapp",
  "whatsapp_number",
  "message",
  "inquiry_content",
  "drawing_file_url",
  "drawing_file_name",
  "drawing_url",
  "drawing_link",
]);

export function isBlockedAnalyticsKey(key: string): boolean {
  const normalized = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return BLOCKED_PAYLOAD_KEYS.has(normalized);
}

export function sanitizeAnalyticsPayload(payload: AnalyticsPayload = {}): Record<string, string | number | boolean> {
  const next: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value == null || value === "") continue;
    if (isBlockedAnalyticsKey(key)) continue;
    next[key] = value;
  }
  return next;
}
