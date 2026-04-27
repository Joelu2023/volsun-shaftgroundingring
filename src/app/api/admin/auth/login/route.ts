import { NextResponse } from "next/server";
import {
  authenticateResourceUser,
  createResourceSession,
  isResourceCenterDbAuthEnabled,
} from "@/lib/resource-center/auth";
import { authenticateDbResourceUser } from "@/lib/resource-center/services/auth-users";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (isResourceCenterDbAuthEnabled()) {
    const user = await authenticateDbResourceUser(username, password);
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login?error=Invalid%20username%20or%20password", request.url), 303);
    }

    await createResourceSession(user.username, user.role, {
      authMode: "db",
      userId: user.userId,
    });
    return NextResponse.redirect(new URL("/admin/resources?message=Signed%20in", request.url), 303);
  }

  const user = authenticateResourceUser(username, password);
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login?error=Invalid%20username%20or%20password", request.url), 303);
  }

  await createResourceSession(user.username, user.role, { authMode: "env" });
  return NextResponse.redirect(new URL("/admin/resources?message=Signed%20in", request.url), 303);
}
