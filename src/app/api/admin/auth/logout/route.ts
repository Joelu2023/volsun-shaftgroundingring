import { NextResponse } from "next/server";
import { clearResourceSession } from "@/lib/resource-center/auth";

export async function POST(request: Request) {
  await clearResourceSession();
  return NextResponse.redirect(new URL("/admin/login?message=Signed%20out", request.url), 303);
}

