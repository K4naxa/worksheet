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
        error.response?.data?.error || error.message
      );
      // Throw a more specific error to be caught by the component
      throw new Error(
        error.response?.data?.error || "Failed to complete registration"
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

  try {
    const response = await nextApiClient.get("/api/profile");
    return response.data;
  } catch (error) {
    // Handle Axios errors properly
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ Error fetching profile:",
        error.response?.data?.message || error.message,
        "with status code:",
        error.response?.status
      );
      // Throw a more specific error to be caught by the component
      throw error;
    }
  }
};

// delete the current users profile
export const deleteProfile = async (): Promise<void> => {
  console.log("🗑️ Deleting profile via Next.js API proxy");
  await nextApiClient.delete("/api/profile");
};

export const saveWorkDayToServer = (workDay: any) => {
  console.log("💾 Saving work day via Next.js API proxy");
  return nextApiClient
    .post("/api/workday", workDay)
    .then((response) => response.data);
};

export const deleteWorkdayFromServer = (date: string) => {
  console.log("🗑️ Deleting work day via Next.js API proxy");
  return nextApiClient
    .delete(`/api/workday/`, { data: { date } })
    .then((response) => response.data);
};
