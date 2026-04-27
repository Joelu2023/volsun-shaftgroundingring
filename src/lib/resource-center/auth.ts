import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getDbResourceUserSessionById } from "@/lib/resource-center/services/auth-users";
import type { ResourceAdminRole, ResourceAdminUser, ResourceSession } from "@/types/resource-center";

const SESSION_COOKIE = "resource_center_session";
const DEFAULT_SECRET = "resource-center-dev-secret";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSessionSecret() {
  return process.env.RESOURCE_CENTER_SESSION_SECRET?.trim() || DEFAULT_SECRET;
}

export function isResourceCenterDbAuthEnabled() {
  return process.env.RC_AUTH_DB_ENABLED?.trim().toLowerCase() === "true";
}

export function getResourceCenterUsers(): ResourceAdminUser[] {
  const raw = process.env.RESOURCE_CENTER_USERS?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (
        item &&
        typeof item === "object" &&
        typeof item.username === "string" &&
        typeof item.password === "string" &&
        (item.role === "admin" || item.role === "editor")
      ) {
        return [{ username: item.username, password: item.password, role: item.role }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function encodeSession(session: ResourceSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(cookieValue: string | undefined): ResourceSession | null {
  if (!cookieValue) return null;
  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const left = Buffer.from(signature, "utf8");
  const right = Buffer.from(expected, "utf8");
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ResourceSession;
    if (!parsed || typeof parsed.username !== "string" || (parsed.role !== "admin" && parsed.role !== "editor")) {
      return null;
    }
    if (parsed.authMode && parsed.authMode !== "env" && parsed.authMode !== "db") {
      return null;
    }
    if (parsed.authMode === "db" && typeof parsed.userId !== "string") {
      return null;
    }
    if (typeof parsed.expiresAt !== "number" || parsed.expiresAt < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isSessionAllowedForCurrentAuthMode(session: ResourceSession) {
  const authMode = session.authMode ?? "env";
  return isResourceCenterDbAuthEnabled() ? authMode === "db" : authMode === "env";
}

async function verifyDbSession(session: ResourceSession): Promise<ResourceSession | null> {
  if (session.authMode !== "db" || !session.userId) {
    return null;
  }

  const user = await getDbResourceUserSessionById(session.userId);
  if (!user || user.username !== session.username || user.role !== session.role) {
    return null;
  }

  return session;
}

async function resolveSessionForCurrentAuthMode(session: ResourceSession | null): Promise<ResourceSession | null> {
  if (!session || !isSessionAllowedForCurrentAuthMode(session)) {
    return null;
  }

  if (!isResourceCenterDbAuthEnabled()) {
    return session;
  }

  return verifyDbSession(session);
}

export async function createResourceSession(
  username: string,
  role: ResourceAdminRole,
  options?: { authMode?: "env" | "db"; userId?: string },
) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const authMode = options?.authMode ?? "env";
  cookieStore.set(SESSION_COOKIE, encodeSession({ username, role, expiresAt, authMode, userId: options?.userId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearResourceSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getResourceSession() {
  const cookieStore = await cookies();
  return resolveSessionForCurrentAuthMode(decodeSession(cookieStore.get(SESSION_COOKIE)?.value));
}

export async function requireResourceSession() {
  const session = await getResourceSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireResourceSession();
  if (session.role !== "admin") {
    redirect("/admin/resources?error=admin_required");
  }
  return session;
}

export function getRequestResourceSession(request: NextRequest) {
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  return session && isSessionAllowedForCurrentAuthMode(session) ? session : null;
}

export async function getVerifiedRequestResourceSession(request: NextRequest) {
  return resolveSessionForCurrentAuthMode(decodeSession(request.cookies.get(SESSION_COOKIE)?.value));
}

export function authenticateResourceUser(username: string, password: string) {
  return getResourceCenterUsers().find((user) => user.username === username && user.password === password) ?? null;
}
