import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login"];

export async function middleware(req: NextRequest) {
  console.log("🛡️ Middleware: Processing request to:", req.nextUrl.pathname);
  const pathname = req.nextUrl.pathname;

  // 1. Allow all static sites and API routes to pass through without authentication
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt")
  ) {
    console.log("🔌 Middleware: Static or API route, allowing through");
    return NextResponse.next();
  }

  // 2. Get the token from the request

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token; // Check if token exists
  const registrationCompleted = token?.registrationCompleted || false; // Default to false if not set

  console.log("🛡️ Middleware: Processing", { pathname, isAuthenticated, registrationCompleted });

  // 3. Define routes
  const isPublicRoute = publicRoutes.includes(pathname);
  const isRegisterRoute = pathname === "/register";

  // 4. Decision logic

  if (!isAuthenticated) {
    if (isPublicRoute) {
      console.log("✅ Middleware: Public route, allowing through");
      return NextResponse.next();
    }
    console.log("🚫 Middleware: No session found, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated) {
    // Check if registration is completed
    if (!registrationCompleted && !isRegisterRoute) {
      console.log("🚫 Middleware: Registration not completed, redirecting to registration");
      return NextResponse.redirect(new URL("/register", req.url));
    }
    // If user is authenticated and registration is completed, redirect home /register request
    if (registrationCompleted && isRegisterRoute) {
      console.log("🚫 Middleware: User is authenticated and registered, redirecting to home");
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // If none of the above rules caused a redirect, the user is authorized for the page.
  console.log("✅ Authorized. Allowing request.");
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
