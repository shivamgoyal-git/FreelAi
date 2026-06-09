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
      const protectedRoutes = ["/dashboard"];
      const authRoutes = ["/login", "/signup"];

      const isProtected = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );
      const isAuthRoute = authRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      );

      if (isProtected && !isLoggedIn) return false; // NextAuth redirects to signIn page
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl.origin));
      }

      return true;
    },
  },

  // Providers are intentionally empty here — real providers live in auth.ts
  providers: [],
};
