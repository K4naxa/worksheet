import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get email and password
    const { email, password } = await request.json();

    // Validate email and password
    // Ensure both email and password are provided
    // If either is missing, return a 400 Bad Request response
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Make a POST request to the backend for login
    // The backend returns access and refresh tokens
    const response = await axios.post(`${process.env.BACKEND_URL}/auth/login`, {
      email,
      password,
    });

    const { access_token, refresh_token } = response.data;

    // Create the response
    const responseObj = NextResponse.json({ message: "Login successful" });

    // Set cookies
    responseObj.cookies.set("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "strict",
    });

    responseObj.cookies.set("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
      sameSite: "strict",
    });

    // Log the successful login
    console.log("nextjs api/ User logged in successfully:", email);

    return responseObj;
  } catch (error) {
    console.error("Login error:");

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      const message =
        axiosError.response?.data?.message || "Authentication failed";
      const status = axiosError.response?.status || 500;

      console.log("Axios error response:", message, status);

      return NextResponse.json({ message }, { status });
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
