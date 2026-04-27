import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAllowedPublicResourceFileKey, validateResourceFileSignature } from "@/lib/resource-center/download-leads";

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".xls") return "application/vnd.ms-excel";
  if (ext === ".xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === ".ppt") return "application/vnd.ms-powerpoint";
  if (ext === ".pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (ext === ".zip") return "application/zip";
  return "application/octet-stream";
}

function resolveSafeFilePath(key: string) {
  if (!isAllowedPublicResourceFileKey(key)) {
    return null;
  }
  if (key.includes("..")) {
    return null;
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const relativeKey = key.replace(/^\/+/, "");
  const absoluteFilePath = path.resolve(publicRoot, relativeKey);
  if (!absoluteFilePath.startsWith(publicRoot)) {
    return null;
  }
  return absoluteFilePath;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key")?.trim() ?? "";
  const expires = url.searchParams.get("expires")?.trim() ?? "";
  const sig = url.searchParams.get("sig")?.trim() ?? "";

  if (!key || !expires || !sig || !validateResourceFileSignature(key, expires, sig)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const filePath = resolveSafeFilePath(key);
  if (!filePath) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(filePath),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(path.basename(filePath))}"`,
      },
    });
  } catch (error) {
    console.error("[resource-center] Signed file read failed", { key, error });
    return new NextResponse("Not Found", { status: 404 });
  }
}
