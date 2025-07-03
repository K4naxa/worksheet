import { RegistrationComplition, User } from "@/types";
import axios from "axios";

// Axios instance for internal API routes (all requests go through Next.js API proxy)
const nextApiClient = axios.create({});

// -- Business Logic Functions (via Next.js API proxy) --

export const completeRegistration = (
  data: RegistrationComplition
): Promise<User> => {
  console.log("✅ Completing registration via Next.js API proxy");

  try {
    const response = nextApiClient.post("/api/register", data);
    console.log("✅Registration successfull, redirecting to home page");

    window.location.href = "/";
  } catch (error) {
    console.error("❌ Error completing registration:", error);
    throw new Error("Failed to complete registration");
  }

  return nextApiClient
    .post("/api/register", data)
    .then((response) => response.data);
};

// Get the current users profile including workdays
export const getProfile = (): Promise<User> => {
  console.log("👤 Fetching profile via Next.js API proxy");
  return nextApiClient.get("/api/profile");
};

export const getWorkDaysFromServer = () => {
  console.log("📅 Fetching work days via Next.js API proxy");
  return nextApiClient.get("/api/workday").then((response) => response.data);
};

export const saveWorkDayToServer = (workDay: any) => {
  console.log("💾 Saving work day via Next.js API proxy");
  return nextApiClient
    .post("/api/workday", workDay)
    .then((response) => response.data);
};
