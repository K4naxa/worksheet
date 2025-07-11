// src/lib/auth.ts (or wherever your authOptions are)

import { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import axios from "axios";
import { JWT } from "next-auth/jwt";

// This is our promise-based lock. It will hold the promise of the token refresh.
let refreshingTokenPromise: Promise<JWT> | null = null;

// Augment the Session and JWT types
declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      registrationCompleted?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    registrationCompleted?: boolean;
    error?: string;
  }
}

// Helper function remains the same
const fetchRegistrationStatus = async (token: string): Promise<boolean> => {
  try {
    console.log("Fetching registration completed status from backend...");
    const response = await axios.get(`${process.env.BACKEND_URL}/user/registration-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.registrationCompleted as boolean;
  } catch (error) {
    console.error("Error fetching registration status:", error);
    return false; // Fail safely
  }
};

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`,
    }),
  ],
  callbacks: {
    async jwt({ token, account, trigger }) {
      // 1. Initial sign-in
      if (account && account.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : 0;
        token.registrationCompleted = await fetchRegistrationStatus(account.access_token);
        return token;
      }

      // 2. Handle session updates
      if (trigger === "update" && token.accessToken) {
        console.log("Updating JWT token with registration status...");
        token.registrationCompleted = await fetchRegistrationStatus(token.accessToken as string);
        return token;
      }

      // 3. If token is still valid, return it.
      if (Date.now() < (token.accessTokenExpires as number)) {
        console.log("✅ JWT: Access token is still valid.");
        return token;
      }

      // 4. If token is expired, we need to refresh it.
      // Check if a refresh is already in progress.
      if (refreshingTokenPromise) {
        console.log("🔄 A token refresh is already in progress, waiting for it to complete...");
        // Wait for the existing refresh promise to resolve
        return await refreshingTokenPromise;
      }

      console.log("JWT: Token expired, attempting to refresh...");
      if (!token.refreshToken) {
        console.error("JWT: No refresh token available.");
        return { ...token, error: "RefreshAccessTokenError" };
      }

      // Create a new promise for the refresh operation and store it.
      // This is our lock.
      refreshingTokenPromise = new Promise(async (resolve) => {
        try {
          const tokenUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;
          const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
            client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          });

          const response = await axios.post(tokenUrl, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          const refreshedTokens = response.data;
          console.log("✅ Tokens refreshed successfully");

          // Resolve the promise with the newly refreshed token
          resolve({
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
            error: undefined,
          });
        } catch (error) {
          console.error("❌ Error refreshing access token", axios.isAxiosError(error) ? error.response?.data : error);
          // Resolve the promise with the old token but with an error
          resolve({
            ...token,
            error: "RefreshAccessTokenError",
          });
        } finally {
          // IMPORTANT: Clear the promise lock so the next expired token
          // can trigger a new refresh.
          refreshingTokenPromise = null;
        }
      });

      return await refreshingTokenPromise;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub;
      session.user.registrationCompleted = token.registrationCompleted;
      session.error = token.error;

      // If there's a refresh error, effectively invalidate the session for the client
      if (token.error === "RefreshAccessTokenError") {
        return {
          ...session,
          error: "RefreshAccessTokenError",
        };
      }

      return session;
    },
  },
};
