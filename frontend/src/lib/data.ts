import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RegistrationComplition, User, Workday } from "@/types";

// This is our custom fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const session = await getServerSession(authOptions);

  if (session?.error === "RefreshAccessTokenError" || !session?.accessToken) {
    return null;
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };

  const response = await fetch(`${process.env.BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    console.warn(
      `Backend rejected token for ${endpoint}. User is unauthorized.`
    );
    return null; // Treat as unauthenticated.
  }

  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    // You might want to parse the error body for more details
    throw new Error(`Failed to fetch API: ${response.status}`);
  }

  // Handle empty responses for DELETE/204 cases
  if (
    response.status === 204 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return null;
  }

  return response.json();
}

// --- Data Fetching Functions ---

// Fetches core user info, tagged for revalidation
export async function getUserProfile(): Promise<User | null> {
  try {
    return await apiFetch("/user/profile", {
      next: { tags: ["userProfile"] },
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null; // Return null on failure
  }
}

// Fetches user workdays, tagged for revalidation
export async function getUserWorkdays(): Promise<Workday[]> {
  try {
    const workdays = await apiFetch("/workday", {
      next: { tags: ["workdays"] },
    });
    return workdays || [];
  } catch (error) {
    console.error("Failed to fetch workdays:", error);
    return []; // Return empty array on failure
  }
}

// --- Mutation Functions (to be used by Server Actions) ---
// These don't need to be exported if only used in actions.ts, but it's clean.

export async function saveWorkdayOnServer(workday: Workday) {
  return apiFetch("/workday", {
    method: "POST",
    body: JSON.stringify(workday),
  });
}

export async function deleteWorkdayOnServer(date: string) {
  return apiFetch("/workday", {
    method: "DELETE",
    body: JSON.stringify({ date: date }),
  });
}

export async function updateUserProfileOnServer(data: RegistrationComplition) {
  // Assuming your backend expects a POST/PUT to /user/profile to update
  // The original function was completeRegistration, so I'll use the /register endpoint.
  // Adjust the endpoint if it's different (e.g., PUT to /user/profile).
  return apiFetch("/user/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteProfileOnServer() {
  return apiFetch("/user/profile", {
    method: "DELETE",
  });
}
