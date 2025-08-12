"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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
      const response = await fetch("http://localhost:4007/auth/profile", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();

        // Check if user has a company
        if (!userData.companyId) {
          // User doesn't have a company, redirect to complete registration
          window.location.href = "/register";
          return;
        }

        setUser(userData);
      } else {
        // User not authenticated, redirect to login
        window.location.href = "/login";
      }
    } catch {
      console.error("Auth check failed");
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
