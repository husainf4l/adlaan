"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { client } from "../lib/apollo-client";
import { LOGIN_MUTATION, REGISTER_MUTATION, CREATE_COMPANY_MUTATION, UPDATE_COMPANY_MUTATION, ME_QUERY } from "../lib/graphql";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: {
    id: string;
    name: string;
    description?: string;
  } | null;
}

interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateUser: (name: string, email: string) => void;
  createCompany: (name: string, description?: string, address?: string, phone?: string, email?: string, website?: string) => Promise<void>;
  updateCompany: (id: string, name: string, description?: string, address?: string, phone?: string, email?: string, website?: string) => Promise<void>;
  isAuthenticated: boolean;
  needsCompanySetup: boolean;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompanyState] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

    // Load user and token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Validate token and fetch current user
      client.query({ query: ME_QUERY, fetchPolicy: 'network-only' as any })
        .then(({ data }: { data: any }) => {
          if (data.me) {
            setUser(data.me);
            // Also fetch user's company if they have one
            if (data.me.company) {
              setCompanyState(data.me.company);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          // Token might be invalid, clear it
          localStorage.removeItem("auth_token");
          setUser(null);
          setCompanyState(null);
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data }: { data: any } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          input: { email, password }
        },
      });

      const { user: userData, access_token } = data.login;

      // Store token
      localStorage.setItem("auth_token", access_token);
      setUser(userData);

      // Set company if user has one
      if (userData.company) {
        setCompanyState(userData.company);
      }

    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: string = "ADMIN") => {
    console.log('AuthContext signup called with:', { name, email, password: '***', role });
    setLoading(true);
    setError(null);

    try {
      console.log('Making GraphQL mutation...');
      const { data }: { data: any } = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          input: { name, email, password, role }
        },
      });
      console.log('GraphQL response:', data);

      const { user: userData, access_token } = data.register;

      // Store token
      localStorage.setItem("auth_token", access_token);
      setUser(userData);

      // Set company if user already has one
      if (userData.company) {
        setCompanyState(userData.company);
      }

      console.log('Signup completed successfully');

    } catch (err: any) {
      console.error('AuthContext signup error:', err);
      setError(err.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCompanyState(null);
    localStorage.removeItem("auth_token");
    setError(null);
  };

  const updateUser = (name: string, email: string) => {
    if (user) {
      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
    }
  };

  const createCompany = async (name: string, description?: string, address?: string, phone?: string, email?: string, website?: string) => {
    if (!user) throw new Error("Authentication required");

    setLoading(true);
    setError(null);

    try {
      const { data }: { data: any } = await client.mutate({
        mutation: CREATE_COMPANY_MUTATION,
        variables: {
          input: {
            name,
            description,
            address,
            phone,
            email,
            website,
          },
        },
      });

      const { company: companyData } = data.createCompany;
      setCompanyState(companyData);

    } catch (err: any) {
      setError(err.message || "Failed to create company");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (id: string, name: string, description?: string, address?: string, phone?: string, email?: string, website?: string) => {
    if (!user) throw new Error("Authentication required");

    setLoading(true);
    setError(null);

    try {
      const { data }: { data: any } = await client.mutate({
        mutation: UPDATE_COMPANY_MUTATION,
        variables: {
          input: {
            id,
            name,
            description,
            address,
            phone,
            email,
            website,
          },
        },
      });

      const { company: companyData } = data.updateCompany;
      setCompanyState(companyData);

    } catch (err: any) {
      setError(err.message || "Failed to update company");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const needsCompanySetup = !!user && !company;

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        login,
        signup,
        logout,
        updateUser,
        createCompany,
        updateCompany,
        isAuthenticated: !!user,
        needsCompanySetup,
        loading,
        authLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
