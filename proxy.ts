import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * First gate for the admin area: runs before any admin route renders, so an
 * anonymous or non-admin request never reaches the page code.
 *
 * This is not the only check. The auth check in app/admin/layout.tsx does not
 * protect pages on its own (layouts and pages render in parallel, and layouts
 * don't re-run on client navigation), so every admin page also calls
 * requireAdminPage() and every admin Server Action calls requireAdmin(), which
 * re-read the user's current role from the database.
 */
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.id) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
