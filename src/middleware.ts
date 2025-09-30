import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;
    // console.log(token, pathname); // --- IGNORE ---

    // Prevent access to /sign-in if user is already logged in
    if (token && pathname === "/sign-in") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect to profile completion if not completed
    if (
      token &&
      !token.isProfileComplete &&
      pathname !== "/complete-profile" &&
      !pathname.startsWith("/api") &&
      pathname !== "/sign-in"
    ) {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }
    console.log(token?.isProfileComplete, pathname, req.url); // --- IGNORE ---

    // Prevent visiting /complete-profile after completing profile
    if (token?.isProfileComplete && pathname === "/complete-profile") {
      console.log("redirecting..."); // --- IGNORE ---
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public pages that don't require authentication
        if (
          pathname.startsWith("/sign-in") ||
          pathname === "/auth/error" ||
          pathname === "/verify-request"
        ) {
          return true;
        }

        // API endpoints and profile setup allowed
        if (pathname.startsWith("/api") || pathname === "/complete-profile") {
          return true;
        }

        // Protect dashboard and profile routes
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/profile")
        ) {
          return !!token;
        }

        return !!token;
      },
    },
    pages: {
      error: "/auth/error",
    },
  }
);

export const config = {
  matcher: [
    "/sign-in",
    "/dashboard/:path*",
    "/profile/:path*",
    "/complete-profile",
    "/api/complete-profile",
    "/api/hosts/:path*",
    "/api/room/:path*",
    "/api/attendance/:path*",
    // "/api/plans/:path((?!display).*)",
  ],
};
