import { NextResponse } from "next/server";
import { isAppLocale } from "@/lib/i18n/locales";
import {
  createLeadDownloadToken,
  createResourceDownloadLead,
  isValidLeadEmail,
  resolveSignedDownloadUrl,
  resolvePublishedDownloadResource,
} from "@/lib/resource-center/download-leads";
import { consumeRateLimit, getClientIpFromHeaders } from "@/lib/security/rate-limit";
import { sendResourceDownloadEmail } from "@/lib/resource-center/send-download-email";

function asTrimmedString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
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

  if (!isAppLocale(localeRaw)) {
    return NextResponse.redirect(new URL("/en/resources", request.url), 303);
  }

  const locale = localeRaw;
  if (!slug) {
    return NextResponse.redirect(new URL(`/${locale}/resources?error=Missing%20resource`, request.url), 303);
  }

  if (!email || !isValidLeadEmail(email)) {
    return NextResponse.redirect(
      new URL(`/${locale}/resources/download/${encodeURIComponent(slug)}?error=Please%20enter%20a%20valid%20email`, request.url),
      303,
    );
  }

  const resource = await resolvePublishedDownloadResource(slug, locale);
  if (!resource?.file_url) {
    return NextResponse.redirect(new URL(`/${locale}/resources?error=Resource%20file%20is%20not%20available`, request.url), 303);
  }

  const lead = await createResourceDownloadLead({
    resourceId: resource.id,
    email,
    company: company || null,
    name: name || null,
  });

  const targetUrl = resolveSignedDownloadUrl(resource.file_url, request.url);
  if (!targetUrl) {
    return NextResponse.redirect(new URL(`/${locale}/resources?error=Resource%20download%20is%20not%20available`, request.url), 303);
  }
  try {
    await sendResourceDownloadEmail({
      to: email,
      resourceTitle: resource.title,
      downloadUrl: targetUrl,
    });
    console.info("[resource-center] Download email sent", {
      email,
      resourceId: resource.id,
    });
  } catch (error) {
    console.error("[resource-center] Download email failed", {
      email,
      resourceId: resource.id,
      error,
    });
  }

  const response = NextResponse.redirect(targetUrl, 303);
  const token = createLeadDownloadToken({
    leadId: lead.id,
    resourceId: resource.id,
    timestamp: Date.now(),
  });
  response.cookies.set("resource_center_lead_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
