"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/services/api";

import { User } from "@/types";
import axios from "axios";

// Define the shape of the context's value
interface UserContextType {
  userProfile: User | null;
  isLoading: boolean;
  refetchProfile: () => void; // A function to manually refetch the profile if needed
}

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create the Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    // Don't try to fetch if we are not authenticated
    if (status !== "authenticated") {
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching user profile from backend...");
      const profileData = await getProfile();
      setUserProfile(profileData);
      console.log("User profile fetched successfully:", profileData);
    } catch (error) {
      // Handle 401 and 404 errors specifically
      // This is important to ensure that if the user is deleted or session is invalid,
      if (axios.isAxiosError(error)) {
        // A 401 or 404 on a profile fetch means the user has been deleted
        // or their session is otherwise invalid. We must sign them out.
        if (error.response?.status === 401 || error.response?.status === 404) {
          console.log("Profile not found or unauthorized. Forcing sign out.");
          signOut({ callbackUrl: "/login" });
          return; // Stop further execution
        }
      }
      console.error("Failed to fetch user profile:", error);
      setUserProfile(null); // Clear profile on error
    } finally {
      setIsLoading(false);
    }
  };

  // This useEffect hook is the engine of the context.
  // It runs whenever the authentication status changes.
  useEffect(() => {
    if (status === "loading") {
      // Session is still being determined, do nothing yet.
      return;
    }

    if (status === "unauthenticated") {
      // If the user is not authenticated, clear the profile
      setUserProfile(null);
      return;
    }

    if (session?.error === "RefreshAccessTokenError") {
      console.error("Refresh token failed, signing out.");
      signOut();
    }

    fetchProfile();
  }, [status, session]); // Dependency array is crucial

  // The value provided to consuming components
  const value = {
    userProfile,
    isLoading,
    refetchProfile: fetchProfile, // Expose the fetch function
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Create a custom hook for easy consumption of the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
