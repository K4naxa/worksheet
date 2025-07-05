import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import axios from "axios";
import { CreateWorkDay } from "@/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. get the session
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let requestBody: CreateWorkDay;

  // 2. parse the request body
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  // 3. call the backend with the auth header
  try {
    const accessToken = session.accessToken;
    const response = await axios.post(
      `${process.env.BACKEND_URL}/workday`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error calling backend:", error);
    return NextResponse.json(
      { error: "Failed to complete registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  // 1. get the session
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // 2. parse the request body
  let requestBody: { date: string };

  try {
    requestBody = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { date } = requestBody;

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  // 3. call the backend with the auth header
  try {
    const accessToken = session.accessToken;
    const response = await axios.delete(
      `${process.env.BACKEND_URL}/workday/${date}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error calling backend:", error);
    return NextResponse.json(
      { error: "Failed to delete workday" },
      { status: 500 }
    );
  }
}
