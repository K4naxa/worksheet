import { RegistrationComplition, User } from "@/types";
import axios from "axios";

// Axios instance for internal API routes (all requests go through Next.js API proxy)
const nextApiClient = axios.create({});

// -- Business Logic Functions (via Next.js API proxy) --

export const completeRegistration = async (data: RegistrationComplition) => {
  console.log("✅ Completing registration via Next.js API proxy");

  try {
    const response = await nextApiClient.post("/api/register", data);
    console.log("✅Registration successfull, redirecting to home page");

    return response.data;
  } catch (error) {
    // Handle Axios errors properly
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Error completing registration:",
        error.response?.data?.message || error.message
      );
      // Throw a more specific error to be caught by the component
      throw new Error(
        error.response?.data?.message || "Failed to complete registration"
      );
    }
    // Handle other types of errors
    console.error("❌ An unexpected error occurred:", error);
    throw new Error("An unexpected error occurred during registration.");
  }
};

// Get the current users profile including workdays
export const getProfile = async (): Promise<User> => {
  console.log("👤 Fetching profile via Next.js API proxy");

  const response = await nextApiClient.get("/api/profile");
  return response.data;
};

export const getWorkDaysFromServer = async () => {
  console.log("📅 Fetching work days via Next.js API proxy");
  const response = await nextApiClient.get("/api/workday");
  return response.data;
};

export const saveWorkDayToServer = (workDay: any) => {
  console.log("💾 Saving work day via Next.js API proxy");
  return nextApiClient
    .post("/api/workday", workDay)
    .then((response) => response.data);
};
