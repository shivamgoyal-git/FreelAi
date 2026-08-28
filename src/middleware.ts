import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Use only the edge-safe config — no bcryptjs/mongoose imports
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as { role?: string })?.role;

  const isPortalRoute = pathname.startsWith("/portal");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isInviteRoute = pathname.startsWith("/portal/invite");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isInviteRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users away from protected routes
  if ((isPortalRoute || isDashboardRoute) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in as client and trying to access freelancer dashboard -> redirect to portal
  if (isDashboardRoute && isLoggedIn && userRole === "client") {
    return NextResponse.redirect(new URL("/portal", req.nextUrl.origin));
  }

  // Redirect authenticated users away from login/signup
  if (isAuthRoute && isLoggedIn) {
    const dest = userRole === "client" ? "/portal" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
