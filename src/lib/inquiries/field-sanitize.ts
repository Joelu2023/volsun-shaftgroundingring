/** Shared inquiry field sanitizers: header injection, email, drawing URL. */

export const INQUIRY_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LEN = 254;
const DRAWING_URL_MAX_LEN = 2000;

export function containsHeaderBreak(value: string): boolean {
  return /[\r\n]/.test(value);
}

export function sanitizeHeaderText(value: string, maxLen = 80): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/[<>"]/g, "")
    .trim()
    .slice(0, maxLen);
}

export function isSafeEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > EMAIL_MAX_LEN || containsHeaderBreak(trimmed)) {
    return false;
  }
  return INQUIRY_EMAIL_RE.test(trimmed);
}

export function looksLikeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > DRAWING_URL_MAX_LEN || containsHeaderBreak(trimmed)) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function sameValue(left: string, right: string | null | undefined): boolean {
  if (!right) return false;
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function isPlaceholder(value: string): boolean {
  const t = value.trim();
  return t === "" || t === "—" || t === "-" || t === "undefined" || t === "null";
}

export type NormalizedDrawingFields = {
  drawing_file_url: string | null;
  drawing_file_name: string | null;
  drawing_note: string | null;
};

/**
 * Drawing file URL must be an http(s) URL.
 * Customer email/phone and other non-URL notes must never appear as the drawing URL.
 */
export function normalizeDrawingFields(input: {
  drawing_file_url: string | null;
  drawing_file_name: string | null;
  email: string;
  phone_or_whatsapp: string | null;
}): NormalizedDrawingFields {
  const email = input.email.trim();
  const phone = input.phone_or_whatsapp;

  let url = input.drawing_file_url?.trim() || null;
  let name = input.drawing_file_name?.trim() || null;
  let note: string | null = null;

  if (url && (isPlaceholder(url) || sameValue(url, email) || sameValue(url, phone))) {
    url = null;
  } else if (url && INQUIRY_EMAIL_RE.test(url) && !looksLikeHttpUrl(url)) {
    url = null;
  } else if (url && looksLikeHttpUrl(url)) {
    url = url.trim();
  } else if (url) {
    note = url;
    url = null;
  }

  if (name && (isPlaceholder(name) || sameValue(name, email) || sameValue(name, phone))) {
    name = null;
  } else if (name && INQUIRY_EMAIL_RE.test(name) && !looksLikeHttpUrl(name)) {
    name = null;
  } else if (name && looksLikeHttpUrl(name)) {
    if (!url) url = name;
    name = null;
  }

  return {
    drawing_file_url: url,
    drawing_file_name: name,
    drawing_note: note,
  };
}

export function mergeDrawingNoteIntoMessage(message: string | null, note: string | null): string | null {
  if (!note) return message;
  const line = `Drawing details: ${note}`;
  if (!message) return line;
  return `${message}\n\n${line}`;
}
