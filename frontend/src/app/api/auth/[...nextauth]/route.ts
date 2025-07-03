import axios from "axios";
import NextAuth, { AuthOptions } from "next-auth";
import KeycloackProvider from "next-auth/providers/keycloak";

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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;

        // Fetch Registration Completed Status
        try {
          console.log("Fetching registration completed status...");
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/registration-status`,
            {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            }
          );
          token.registrationCompleted = response.data.registrationCompleted;
        } catch (error) {
          console.error("Error fetching registration status:", error);
          token.registrationCompleted = false;

          // If there's an error, we can assume registration is not completed
        }

        return token;
      }

      return token; // Return the token unchanged if no account is present
    },

    // This callback is called whenever a session is checked
    async session({ session, token }) {
      // We pass accessToken from the JWT token to the session
      // To the session object. This allows us to access the server-side session
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub as string; // Use sub as user ID

      return session;
    },
  },
};

// Create handlers for Next.js API routes
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// This file handles authentication using NextAuth.js with Keycloak as the provider.
// It exports GET and POST handlers for Next.js API routes.
