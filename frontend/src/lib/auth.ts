import { AuthOptions } from "next-auth";
import KeycloakProvider, { KeycloakProfile } from "next-auth/providers/keycloak";
import axios, { AxiosError } from "axios";
import { JWT } from "next-auth/jwt";
import { OAuthConfig } from "next-auth/providers/oauth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    id_token: string;
    provider: string;
    error?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      registrationCompleted?: boolean;
    };
  }
}

const keycloak = KeycloakProvider({
  clientId: process.env.KEYCLOAK_CLIENT_ID!,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
  issuer: `${process.env.KEYCLOAK_AUTH_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`,
});

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
    throw error;
  }
};

let isRefreshing = false; // Flag to prevent multiple refresh attempts
async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (isRefreshing) {
    console.log("🔄 Already refreshing access token, waiting for completion...");
    return token; // Return the existing token while waiting
  }

  isRefreshing = true; // Set the flag to indicate a refresh is in progress
  console.log("🔄 Refreshing access token...");

  try {
    const tokenUrl = `${process.env.KEYCLOAK_AUTH_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;

    // The data for the request needs to be in x-www-form-urlencoded format
    const params = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    const response = await axios.post(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const refreshedTokens = response.data;
    console.log("✅ Tokens refreshed successfully");

    isRefreshing = false; // Reset the flag after successful refresh

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("❌ Error refreshing access token", axios.isAxiosError(error) ? error.response?.data : error);
    isRefreshing = false; // Reset the flag on error

    return {
      ...token,
      error: "RefreshAccessTokenError", // This will be used in the session callback
    };
  }
}

async function doFinalSignoutHandshake(jwt: JWT) {
  const { provider, id_token } = jwt;

  if (provider == keycloak.id) {
    try {
      // Add the id_token_hint to the query string
      const params = new URLSearchParams();
      params.append("id_token_hint", id_token as string);
      const issuer =
        keycloak.options?.issuer ?? process.env.KEYCLOAK_AUTH_URL + `/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`;
      const { status, statusText } = await axios.get(`${issuer}/protocol/openid-connect/logout?${params.toString()}`);

      // The response body should contain a confirmation that the user has been logged out
      console.log("Completed post-logout handshake", status, statusText);
    } catch (e: any) {
      console.error("Unable to perform post-logout handshake", (e as AxiosError)?.code || e);
    }
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  providers: [keycloak],

  // Callbacks to handle tokens and session
  callbacks: {
    async jwt({ token, account, trigger, session }) {
      // 1. Initial signin, store the access token and id_token in the JWT
      if (account && account.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.id_token = account.id_token;
        token.provider = account.provider || "keycloak";
        token.registrationCompleted = (await fetchRegistrationStatus(account.access_token)) as boolean;

        if (account.expires_at) {
          token.accessTokenExpires = account.expires_at * 1000;
        }

        return token;
      }

      // 3. If token has an error, it's invalid. Return it to propagate the error.
      if (token.error) {
        console.log("JWT: Token has error, returning as is.");
        return token;
      }

      if (trigger === "update" && token.accessToken) {
        console.log("Updating JWT token with registration status...");
        try {
          const registrationStatus = await fetchRegistrationStatus(token.accessToken as string);
          token.registrationCompleted = registrationStatus;
        } catch (error) {
          console.error("Error updating registration status in JWT:", error);
          // Optionally, you can set a default value or handle the error
          token.registrationCompleted = false;
        }
        return token;
      }

      // 5. If token is expired, attempt to refresh it.
      console.log("JWT: Token expired, attempting locked refresh...");
      return refreshAccessToken(token);
    },

    // This callback is called whenever a session is checked
    async session({ session, token }) {
      // We pass accessToken from the JWT token to the session
      // To the session object. This allows us to access the server-side session
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub as string; // Use sub as user ID
      session.user.registrationCompleted = token.registrationCompleted as boolean;
      session.error = token.error as string; // Pass any error from the JWT to the session

      return session;
    },
  },

  events: {
    signOut: ({ session, token }) => doFinalSignoutHandshake(token),
  },
};
