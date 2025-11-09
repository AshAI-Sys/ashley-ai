"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setUserContext, clearUserContext } from "../../sentry.client.config";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  workspaceId: string; // Added for inventory system
  position?: string;
  department?: string;
  permissions?: string[];
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  requires_2fa?: boolean;
  two_factor_enabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount (only in browser)
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("ash_token");
      console.log(
        "🔐 AuthContext - Stored token:",
        storedToken ? "EXISTS" : "NONE"
      );

      if (storedToken) {
        // Verify token is valid before using it
        try {
          // Decode JWT to check expiration (without verification - just parsing)
          const tokenParts = storedToken.split(".");
          if (tokenParts.length === 3 && tokenParts[1]) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const now = Math.floor(Date.now() / 1000);

            // Check if token is expired
            if (payload.exp && payload.exp < now) {
              console.warn("⚠️ Stored token is expired - clearing");
              localStorage.removeItem("ash_token");
              localStorage.removeItem("ash_user");
              setIsLoading(false);
              return;
            }

            // Token is valid
            setToken(storedToken);
          }
        } catch (error) {
          console.error("❌ Error decoding token:", error);
          localStorage.removeItem("ash_token");
          localStorage.removeItem("ash_user");
          setIsLoading(false);
          return;
        }

        // Get stored user data if available
        const storedUser = localStorage.getItem("ash_user");
        console.log("👤 AuthContext - Stored user:", storedUser);

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log("✅ AuthContext - Parsed user:", userData);
            setUser(userData);

            // Set Sentry user context for returning users
            setUserContext({
              id: userData.id,
              email: userData.email,
              name: userData.name || userData.email,
              role: userData.role,
            });
          } catch (error) {
            console.error("❌ Error parsing stored user data:", error);
            // Clear invalid user data only - keep token for now
            localStorage.removeItem("ash_user");
            setUser(null);
          }
        } else {
          console.log(
            "⚠️ Token found but no user data - will attempt to fetch from API"
          );
          // Token exists but no user data - this could be a timing issue
          // Keep the token and let the app try to use it
          // If it's invalid, the API calls will fail and trigger logout
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Invalid credentials" }));
        throw new Error(errorData.error || "Invalid credentials");
      }

      const data = await response.json();

      // Validate response structure
      if (!data || !data.access_token || !data.user) {
        console.error("❌ Invalid login response structure:", data);
        throw new Error("Invalid server response");
      }

      const { access_token, user: userData } = data;

      setUser(userData);
      setToken(access_token);
      localStorage.setItem("ash_token", access_token);
      localStorage.setItem("ash_user", JSON.stringify(userData));

      // Set Sentry user context for error tracking
      setUserContext({
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.email,
        role: userData.role,
      });

      console.log("✅ Login successful for user:", userData.email);
    } catch (error) {
      console.error("❌ Login error:", error);
      // Clear any partial state
      setUser(null);
      setToken(null);
      localStorage.removeItem("ash_token");
      localStorage.removeItem("ash_user");
      throw error instanceof Error ? error : new Error("Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ash_token");
      localStorage.removeItem("ash_user");
    }

    // Clear Sentry user context on logout
    clearUserContext();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
