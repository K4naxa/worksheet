import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import axios from "axios";
import { RegistrationComplition } from "@/types";
import { NextResponse } from "next/server";

/**
 * This route handles the completion of user registration.
 * It expects a POST request with a JSON body containing the registration details.
 * The request must include an authorization header with a valid access token.
 */

const validateRegistrationData = (data: RegistrationComplition) => {
  if (!data.company || !data.instructor || !data.startDate || !data.endDate) {
    return NextResponse.json(
      {
        error:
          "Puuttuvia kenttiä rekisteröinnissä, Täytä kaikki kentät ja yritä uudelleen",
      },
      { status: 400 }
    );
  }

  if (!Array.isArray(data.workdays) || data.workdays.length === 0) {
    return NextResponse.json(
      { error: "Työpäiviä pitää olla vähintään yksi." },
      { status: 400 }
    );
  }

  if (
    data.workdays.some((day) => typeof day !== "number" || day < 0 || day > 6)
  ) {
    return NextResponse.json(
      { error: "Työpäivissä virhe, lataa sivu uudelleen" },
      { status: 400 }
    );
  }

  if (
    isNaN(Date.parse(data.startDate)) ||
    isNaN(Date.parse(data.endDate)) ||
    new Date(data.startDate) >= new Date(data.endDate)
  ) {
    return NextResponse.json(
      { error: "Väärin täytetty aloitus-, tai viimeinen päivä." },
      { status: 400 }
    );
  }

  // Additional validation can be added here as needed
};

export async function POST(request: Request) {
  // 1. get the session
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // 2. parse the request body and validate it
  let requestBody: RegistrationComplition;
  requestBody = await request.json();
  const validationResponse = validateRegistrationData(requestBody);
  if (validationResponse) {
    return validationResponse;
  }

  // 3. call the backend with the auth header
  try {
    const accessToken = session.accessToken;
    const response = await axios.post(
      `${process.env.BACKEND_URL}/user/complete-registration`,
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
