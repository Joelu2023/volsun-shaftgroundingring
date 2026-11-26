import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { acceptDurableInquiry } from "@/lib/inquiries/accept-inquiry";
import { deliverInquirySubmission } from "@/lib/inquiries/deliver-inquiry";
import { getInquiryStore, isInquiryDurableStorageEnabled } from "@/lib/inquiries/durable-store";
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

  if (isInquiryDurableStorageEnabled()) {
    let store;
    try {
      store = getInquiryStore();
    } catch {
      console.error("[inquiry] storage unavailable", { requestId });
      return NextResponse.json(
        {
          ok: false as const,
          received: false as const,
          delivered: false as const,
          error: "inquiry_storage_failed",
          request_id: requestId,
        },
        { status: 503 },
      );
    }

    const rawRecord = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const accepted = await acceptDurableInquiry(parsed.data, requestId, rawRecord.idempotency_key, { store });
    if (!accepted.ok) {
      return NextResponse.json(
        {
          ok: false as const,
          received: false as const,
          delivered: false as const,
          error: accepted.error,
          request_id: requestId,
        },
        { status: accepted.httpStatus },
      );
    }

    console.log("[inquiry] received", {
      requestId,
      inquiryId: accepted.inquiryId,
      publicNumber: accepted.inquiryNumber,
      status: accepted.notificationStatus,
      delivered: accepted.delivered,
    });
    return NextResponse.json({
      ok: true as const,
      received: true as const,
      delivered: accepted.delivered,
      channel: accepted.channel,
      request_id: requestId,
      inquiry_number: accepted.inquiryNumber,
      notification_status: accepted.notificationStatus,
      notification_uncertain: accepted.notificationUncertain,
    });
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
