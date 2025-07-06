import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// This code runs on the server side only

// Create handlers for Next.js API routes
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// This file handles authentication using NextAuth.js with Keycloak as the provider.
// It exports GET and POST handlers for Next.js API routes.
