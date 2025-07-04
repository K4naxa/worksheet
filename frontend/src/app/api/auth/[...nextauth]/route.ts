import axios from "axios";
import NextAuth, { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import KeycloackProvider from "next-auth/providers/keycloak";

const fetchRegistrationStatus = async (token: string): Promise<boolean> => {
  try {
    console.log("Fetching registration completed status from backend...");
    const response = await axios.get(
      `${process.env.BACKEND_URL}/user/registration-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.registrationCompleted as boolean;
  } catch (error) {
    console.error("Error fetching registration status:", error);
    throw error;
  }
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const tokenUrl = `${process.env.KEYCLOAK_AUTH_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    // The data for the request needs to be in x-www-form-urlencoded format
    const params = new URLSearchParams();
    params.append("client_id", process.env.KEYCLOAK_CLIENT_ID!);
    params.append("client_secret", process.env.KEYCLOAK_CLIENT_SECRET!);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", token.refreshToken as string);

    const { data: refreshedTokens } = await axios.post(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("✅ Tokens refreshed successfully");

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      // `expires_in` is in seconds, convert to milliseconds for Date
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error(
      "❌ Error refreshing access token",
      axios.isAxiosError(error) ? error.response?.data : error
    );

    return {
      ...token,
      error: "RefreshAccessTokenError", // This will be used in the session callback
    };
  }
}

// This code runs on the server side only
export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloackProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: `${process.env.KEYCLOAK_AUTH_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    }),
  ],

  // Callbacks to handle tokens and session
  callbacks: {
    async jwt({ token, account, trigger }) {
      // This callback is called whenever a JWT is created or updated
      if (account && account.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // Fetching registration status only on the initial login
        token.registrationCompleted = (await fetchRegistrationStatus(
          account.access_token
        )) as boolean;

        if (account.expires_at) {
          token.accessTokenExpires = account.expires_at * 1000;
        }

        return token;
      }

      // 2. On subsequent requests, check if the access token is expired.
      // Give a 60-second buffer to be safe.
      if (Date.now() < (token.accessTokenExpires as number) - 60 * 1000) {
        console.log("✅ Access token is still valid");
      }

      // 3. If the access token is expired, try to refresh it
      if (Date.now() >= (token.accessTokenExpires as number)) {
        console.log("❌ Access token expired, refreshing...");
        token = await refreshAccessToken(token);
      }

      // If the trigger is "update", we check if the token has an accessToken
      // and update the registration status accordingly
      if (trigger === "update" && token.accessToken) {
        console.log("Updating JWT token with registration status...");
        try {
          const registrationStatus = await fetchRegistrationStatus(
            token.accessToken as string
          );
          token.registrationCompleted = registrationStatus;
        } catch (error) {
          console.error("Error updating registration status in JWT:", error);
          // Optionally, you can set a default value or handle the error
          token.registrationCompleted = false;
        }
      }

      return token; // Return the token unchanged if no account is present
    },

    // This callback is called whenever a session is checked
    async session({ session, token }) {
      // We pass accessToken from the JWT token to the session
      // To the session object. This allows us to access the server-side session
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub as string; // Use sub as user ID
      session.user.registrationCompleted =
        token.registrationCompleted as boolean;
      session.error = token.error as string; // Pass any error from the JWT to the session

      return session;
    },
  },
};

// Create handlers for Next.js API routes
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// This file handles authentication using NextAuth.js with Keycloak as the provider.
// It exports GET and POST handlers for Next.js API routes.
