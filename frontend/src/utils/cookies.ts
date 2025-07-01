import { cookies } from "next/headers";

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
} as const;

// Client-side cookie operations
export const clientCookies = {
  set: (
    name: string,
    value: string,
    options?: {
      expires?: Date;
      maxAge?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
    }
  ) => {
    const cookieOptions = {
      expires: options?.expires,
      "max-age": options?.maxAge,
      secure: options?.secure ?? process.env.NODE_ENV === "production",
      samesite: options?.sameSite ?? "lax",
      path: "/",
      ...options,
    };

    const cookieString = Object.entries(cookieOptions)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");

    document.cookie = `${name}=${value}; ${cookieString}`;
  },

  get: (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  },

  remove: (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};

// Server-side cookie operations (for server components and API routes)
export const serverCookies = {
  get: (name: string) => {
    const cookieStore = cookies();
    return cookieStore.get(name)?.value || null;
  },
};
