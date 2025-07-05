import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import axios, { AxiosError } from "axios";
import { User } from "@/types";

export async function GET(request: NextRequest) {
  // 1. Get the session
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Extract the access token from the session.
    const accessToken = session.accessToken;

    // 3. Call the nestjs backend with the auth header.
    const response = await axios.get(
      `${process.env.BACKEND_URL}/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 4. Return the data to the client.
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 401 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // 1. Get the session
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Extract the access token from the session.
    const accessToken = session.accessToken;

    // 3. Call the nestjs backend with the auth header.
    await axios.delete(`${process.env.BACKEND_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 4. Return a success response.
    return NextResponse.json(
      { message: "Profile deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
