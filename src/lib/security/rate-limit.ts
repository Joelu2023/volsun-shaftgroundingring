type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSec: number;
};

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

function cleanupBucket(now: number, bucket: Bucket, windowMs: number) {
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);
}

export function consumeRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(input.key) ?? { timestamps: [] };
  cleanupBucket(now, bucket, input.windowMs);

  if (bucket.timestamps.length >= input.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((input.windowMs - (now - oldest)) / 1000));
    buckets.set(input.key, bucket);
    return { allowed: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  buckets.set(input.key, bucket);
  return { allowed: true, retryAfterSec: 0 };
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || headers.get("cf-connecting-ip")?.trim() || "unknown";
}
