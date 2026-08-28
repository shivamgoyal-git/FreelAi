import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config — NO Node.js-only imports (bcryptjs, mongoose, etc.).
 * Used by middleware which runs on the Edge runtime.
 * The full auth config (with DB callbacks) lives in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as { role?: string })?.role;
      const isPortalRoute = nextUrl.pathname.startsWith("/portal");
      const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
      const isInviteRoute = nextUrl.pathname.startsWith("/portal/invite");
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/signup");

      // Invitations can be viewed publicly
      if (isInviteRoute) return true;

      // Portal requires login
      if (isPortalRoute && !isLoggedIn) return false;

      // Dashboard requires login
      if (isDashboardRoute && !isLoggedIn) return false;

      // If logged in as client and accessing dashboard -> redirect to portal
      if (isLoggedIn && userRole === "client" && isDashboardRoute) {
        return Response.redirect(new URL("/portal", nextUrl.origin));
      }

      // If logged in and accessing auth routes
      if (isAuthRoute && isLoggedIn) {
        const dest = userRole === "client" ? "/portal" : "/dashboard";
        return Response.redirect(new URL(dest, nextUrl.origin));
      }

      return true;
    },
  },

  // Providers are intentionally empty here — real providers live in auth.ts
  providers: [],
};
