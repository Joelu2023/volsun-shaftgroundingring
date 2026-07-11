import { NextResponse, type NextRequest } from "next/server";

/** Request header forwarded upstream for root/admin layout pathname resolution. */
export const PATHNAME_HEADER = "x-pathname";

/**
 * Clone incoming request headers and set pathname from the URL.
 * Always overwrites any client-supplied x-pathname value.
 */
export function buildForwardedRequestHeaders(incoming: Headers, pathname: string): Headers {
  const requestHeaders = new Headers(incoming);
  requestHeaders.set(PATHNAME_HEADER, pathname);
  return requestHeaders;
}

/** Continue to Next.js with pathname available via headers() in Server Components. */
export function nextWithPathname(request: NextRequest): NextResponse {
  return NextResponse.next({
    request: {
      headers: buildForwardedRequestHeaders(request.headers, request.nextUrl.pathname),
    },
  });
}
