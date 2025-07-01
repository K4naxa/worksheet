import axios from "axios";

const API_URL = process.env.BACKEND_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is important for sending cookies
});

// Create a separate axios instance for internal API routes (no base URL)
const internalApiClient = axios.create({
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Use Axios interceptors to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and it's not a retry request
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue the request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await internalApiClient.post("/api/refresh"); // Use internal API client for refresh

        processQueue(null, null); // Resolve all queued requests
        return apiClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        processQueue(refreshError, null); // Reject all queued requests
        // If refresh fails, logout the user
        // Clear any existing cookies and redirect to login
        document.cookie =
          "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient }; // Export the configured axios instance

// -- Auth Functions --

export const login = (email: string, password: string) => {
  console.log("Service api called, Logging in with:", email, password);
  return internalApiClient.post("/api/login", { email, password });
};

export const logout = () => {
  return internalApiClient.post("/api/logout");
};
export const refreshTokens = () => {
  return internalApiClient.post("/api/refresh");
};
export const getProfile = () => {
  console.log("service/api called,  Fetching user profile");
  return apiClient.get("/auth/profile");
};
