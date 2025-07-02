import axios from "axios";

// Axios instance for internal API routes (all requests go through Next.js API proxy)
const nextApiClient = axios.create({});

// -- Business Logic Functions (via Next.js API proxy) --
export const getProfile = () => {
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
