import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const nestJsBackendUrl = process.env.BACKEND_URL || "http://localhost:3001";

    // Forward the refresh token to your NestJS backend
    const { data } = await axios.post(
      `${nestJsBackendUrl}/auth/refresh`,
      {},
      {
        headers: {
          Cookie: `refresh_token=${refreshToken}`, // Forward refresh token cookie to the backend
        },
      }
    );

    const { access_token, refresh_token } = data;

    // Create the response
    const response = NextResponse.json({
      message: "Token refreshed successfully",
    });

    // Set both the new access token and refresh token cookies
    response.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    response.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error refreshing tokens");

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      const message =
        axiosError.response?.data?.message || "Token refresh failure failed";
      const status = axiosError.response?.status || 500;

      return NextResponse.json({ message }, { status });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
