import axios from "axios";
import NextAuth, { AuthOptions } from "next-auth";
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
      }

      // This block runs when the session is updated MANUALLY (e.g., after registration
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

      return session;
    },
  },
};

// Create handlers for Next.js API routes
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// This file handles authentication using NextAuth.js with Keycloak as the provider.
// It exports GET and POST handlers for Next.js API routes.
