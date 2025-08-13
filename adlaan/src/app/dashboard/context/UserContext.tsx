"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API_CONFIG } from "@/lib/constants";

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  twoFactorEnabled: boolean;
  companyId?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      // Get Bearer token from localStorage
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.warn(
          "⚠️ No access token found in UserContext, redirecting to login"
        );
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("🔍 UserContext profile response:", responseData);

        // Extract user data - handle both { user: {...} } and direct user object
        const userData = responseData.user || responseData;

        // Check if user has a company
        if (!userData.companyId) {
          // User doesn't have a company, redirect to complete registration
          console.log("📝 User missing company, redirecting to registration");
          window.location.href = "/register";
          return;
        }

        console.log("✅ UserContext: User authenticated and has company");
        setUser(userData);
      } else {
        console.error(
          `❌ UserContext: Auth check failed with status ${response.status}`
        );

        // If unauthorized, remove invalid token and redirect to login
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          console.log("🗑️ Removed invalid tokens");
        }

        // User not authenticated, redirect to login
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("❌ UserContext: Auth check failed with error:", error);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
