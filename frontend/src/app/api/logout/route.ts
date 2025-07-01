import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (accessToken) {
    try {
      // Tell the NestJS backend to invalidate the session
      const nestJsBackendUrl =
        process.env.BACKEND_URL || "http://localhost:3001";
      await axios.post(
        `${nestJsBackendUrl}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (error) {
      // Log error but continue to clear cookies
      console.error(
        "Failed to logout from backend, clearing cookies anyway.",
        error
      );
    }
  }

  // Create the response
  const response = NextResponse.json({ message: "Logout successful" });

  // Clear both cookies by setting their expiry to the past
  response.cookies.set("access_token", "", { maxAge: -1, path: "/" });
  response.cookies.set("refresh_token", "", { maxAge: -1, path: "/" });

  return response;
}
