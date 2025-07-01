import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function middleware(req: NextRequest) {
  // 1. Check for a token
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  // 2.1 If the request is for API routes, allow it (API routes handle their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2.2 If the request is for a static asset, allow it
  // This includes things like images, CSS, JS, etc.
  if (
    pathname.startsWith("/_next/") || // static assets
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/images/") || // if you serve static images
    pathname.includes(".") // includes things like .css, .js
  ) {
    return NextResponse.next();
  }

  // 3. Decide what to do based on authentication status and route access
  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = !isPublicRoute;

  // 3.1. If user is not authenticated and trying to access a protected route
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3.2. If user IS logged in and is trying to access a public route, redirect to the profile page
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3.4. If the user is authenticated, allow the request to proceed
  return NextResponse.next();
}
