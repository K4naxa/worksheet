import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function middleware(req: NextRequest) {
  console.log("🛡️ Middleware: Processing request to:", req.nextUrl.pathname);

  // Check for a token
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  // 1. Allow API routes to handle their own auth
  if (pathname.startsWith("/api/")) {
    console.log("🔌 Middleware: API route, allowing through");
    return NextResponse.next();
  }

  // 2. Allow static assets
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
    hasToken: !!token,
    isPublicRoute,
    isProtectedRoute,
  });

  // 3. If no token and accessing protected route -> redirect to login
  if (!token && isProtectedRoute) {
    console.log(
      "🚫 Middleware: No token for protected route, redirecting to login"
    );
    return NextResponse.redirect(new URL("/login", req.url));
  }

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
