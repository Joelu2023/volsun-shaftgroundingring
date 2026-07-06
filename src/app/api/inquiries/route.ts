import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { deliverInquirySubmission } from "@/lib/inquiries/deliver-inquiry";
import { parseInquirySubmission } from "@/lib/inquiries/validate";
import { consumeRateLimit, getClientIpFromHeaders } from "@/lib/security/rate-limit";

/** POST /api/inquiries — validated inquiry; production success requires SMTP delivery. */
export async function POST(req: Request) {
  const requestId = randomUUID();
  const ip = getClientIpFromHeaders(req.headers);
  const limiter = consumeRateLimit({
    key: `inquiries:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limiter.allowed) {
    return NextResponse.json(
      {
        ok: false as const,
        delivered: false as const,
        error: "rate_limited",
        request_id: requestId,
        message: "Too many inquiry submissions. Please retry later.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limiter.retryAfterSec) },
      },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    console.error("[inquiry] invalid JSON", { requestId });
    return NextResponse.json(
      { ok: false as const, delivered: false as const, error: "invalid_json", request_id: requestId },
      { status: 400 },
    );
  }

  const parsed = parseInquirySubmission(raw);
  if (!parsed.ok) {
    console.error("[inquiry] validation failed", { requestId, error: parsed.error });
    return NextResponse.json(
      { ok: false as const, delivered: false as const, error: parsed.error, request_id: requestId },
      { status: 400 },
    );
  }

  const delivery = await deliverInquirySubmission(parsed.data, requestId);

  if (!delivery.ok) {
    return NextResponse.json(
      {
        ok: false as const,
        delivered: false as const,
        error: delivery.error,
        request_id: requestId,
      },
      { status: delivery.httpStatus },
    );
  }

  if (delivery.delivered) {
    console.log("[inquiry] delivered", {
      requestId,
      inquiry_type: parsed.data.inquiry_type,
      cta_key: parsed.data.cta_key,
      channel: delivery.channel,
    });
    return NextResponse.json({
      ok: true as const,
      delivered: true as const,
      channel: delivery.channel,
      request_id: requestId,
    });
  }

  return NextResponse.json({
    ok: true as const,
    delivered: false as const,
    devPersisted: delivery.devPersisted,
    message: delivery.message,
    request_id: requestId,
  });
}
