import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isAppLocale } from "@/lib/i18n/locales";
import { createLeadDownloadToken, isValidLeadEmail } from "@/lib/resource-center/download-leads";
import { processDownloadLead } from "@/lib/resource-center/process-download-lead";
import { consumeRateLimit, getClientIpFromHeaders } from "@/lib/security/rate-limit";

function asTrimmedString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function wantsJson(request: Request) {
  const accept = request.headers.get("accept")?.toLowerCase() ?? "";
  return accept.includes("application/json");
}

function redirectWithError(request: Request, path: string, message: string) {
  const url = new URL(path, request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const ip = getClientIpFromHeaders(request.headers);
  const limiter = consumeRateLimit({
    key: `download-leads:${ip}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!limiter.allowed) {
    return NextResponse.json(
      {
        ok: false as const,
        error: "rate_limited",
        message: "Too many download requests. Please retry later.",
        requestId,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limiter.retryAfterSec) },
      },
    );
  }

  const formData = await request.formData();
  const localeRaw = asTrimmedString(formData.get("locale"));
  const slug = asTrimmedString(formData.get("slug"));
  const email = asTrimmedString(formData.get("email")).toLowerCase();
  const company = asTrimmedString(formData.get("company"));
  const name = asTrimmedString(formData.get("name"));
  const json = wantsJson(request);

  if (!isAppLocale(localeRaw)) {
    if (json) {
      return NextResponse.json(
        { ok: false as const, error: "invalid_locale", message: "Invalid locale", requestId },
        { status: 400 },
      );
    }
    return NextResponse.redirect(new URL("/en/resources", request.url), 303);
  }

  const locale = localeRaw;
  if (!slug) {
    if (json) {
      return NextResponse.json(
        { ok: false as const, error: "missing_resource", message: "Missing resource", requestId },
        { status: 400 },
      );
    }
    return redirectWithError(request, `/${locale}/resources`, "Missing resource");
  }

  if (!email || !isValidLeadEmail(email)) {
    if (json) {
      return NextResponse.json(
        {
          ok: false as const,
          error: "invalid_email",
          message: "Please enter a valid email",
          requestId,
        },
        { status: 400 },
      );
    }
    return redirectWithError(
      request,
      `/${locale}/resources/download/${encodeURIComponent(slug)}`,
      "Please enter a valid email",
    );
  }

  const result = await processDownloadLead({
    requestId,
    locale,
    slug,
    email,
    company,
    name,
    requestUrl: request.url,
  });

  if (result.status !== "success") {
    if (json) {
      return NextResponse.json(
        {
          ok: false as const,
          error: result.status,
          message: result.message,
          requestId: result.requestId,
        },
        { status: result.httpStatus },
      );
    }

    if (result.status === "validation_error") {
      return redirectWithError(
        request,
        `/${locale}/resources/download/${encodeURIComponent(slug)}`,
        result.message,
      );
    }

    if (result.status === "resource_unavailable") {
      return redirectWithError(request, `/${locale}/resources`, result.message);
    }

    return redirectWithError(
      request,
      `/${locale}/resources/download/${encodeURIComponent(slug)}`,
      result.message,
    );
  }

  if (json) {
    return NextResponse.json({
      ok: true as const,
      requestId: result.requestId,
      downloadUrl: result.downloadUrl,
      dbPersisted: result.dbPersisted,
      inquiryPersisted: result.inquiryPersisted,
      emailSent: result.emailSent,
    });
  }

  const response = NextResponse.redirect(result.downloadUrl, 303);
  // Cookie only when Prisma lead exists — token validation requires a DB lead row.
  if (result.leadId) {
    const token = createLeadDownloadToken({
      leadId: result.leadId,
      resourceId: result.resourceId,
      timestamp: Date.now(),
    });
    response.cookies.set("resource_center_lead_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}
