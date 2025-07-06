import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

export async function middleware(req: NextRequest) {
  console.log("🛡️ Middleware: Processing request to:", req.nextUrl.pathname);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const registrationCompleted = token?.registrationCompleted || false; // Default to false if not set

  const { pathname } = req.nextUrl;

  // 1. Allow API routes to handle their own auth
  if (pathname.startsWith("/api/")) {
    console.log("🔌 Middleware: API route, allowing through");
    return NextResponse.next();
  }

  // 1.1. Allow static assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/images/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = !isPublicRoute;

  console.log("🔍 Middleware: Route analysis:", {
    pathname,
    isAuthenticated: !!token,
    registrationCompleted,
    isPublicRoute,
    isProtectedRoute,
  });

  // 2. If no session and accessing protected route -> redirect to login
  if (!token && isProtectedRoute) {
    console.log(
      "🚫 Middleware: No session for protected route, redirecting to login"
    );

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If session exists but not completed registration
  if (token && !registrationCompleted && pathname !== "/register") {
    console.log(
      "🚫 Middleware: Registration not completed, redirecting to registration"
    );
    return NextResponse.redirect(new URL("/register", req.url));
  }

  // 4. if session exists and registration is completed

  console.log("✅ Middleware: Allowing request through");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
