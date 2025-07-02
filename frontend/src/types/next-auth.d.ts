// types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend the JWT type to include the properties you are adding in the jwt callback
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
  }
}

// Extend the Session type to include the properties you are adding in the session callback
declare module "next-auth" {
  interface Session {
    accessToken: string; // The access token is now a required property on the session
    user: {
      id: string; // Add the user ID to the user object
    } & DefaultSession["user"]; // ...and merge with the default user properties
  }
}
