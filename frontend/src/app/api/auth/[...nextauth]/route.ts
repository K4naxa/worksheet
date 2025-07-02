import NextAuth, { AuthOptions } from "next-auth";
import KeycloackProvider from "next-auth/providers/keycloak";

// This code runs on the server side only
export const authOptions: AuthOptions = {
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
      }
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      // This is what getServerSession and useSession will see
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub; // Use sub as user ID

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
// This file handles authentication using NextAuth.js with Keycloak as the provider.
// It exports GET and POST handlers for Next.js API routes.
