// types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend the JWT type to include the accessToken and refreshToken
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
  }
}

// Extend the Session type to include the properties we need
// The accessToken is now a required property on the session
declare module "next-auth" {
  interface Session {
    accessToken: string; // The access token is now a required property on the session
    user: {
      id: string;
      registrationCompleted?: boolean; // to check if the user has completed registration in the middleware
    } & DefaultSession["user"]; // ... merge with the default user properties
  }
}
