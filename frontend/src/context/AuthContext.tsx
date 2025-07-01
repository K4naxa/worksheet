"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as api from "../services/api";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if access token exists before fetching profile
    const hasToken = document.cookie.includes("access_token");
    if (!hasToken) {
      setIsLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const { data } = await api.getProfile();
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("authcontext login called with:", email, password);
      await api.login(email, password);
      console.log("Login successful, fetching user profile...");
      // After successful login, fetch the user profile
      const { data } = await api.getProfile();
      setUser(data);
      router.push("/"); // Redirect to home page after login
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Propagate the error to the component
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
      throw error; // Propagate the error to the component
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading: isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
