"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
        setToken(storedToken);

        // Get stored user data if available
        const storedUser = localStorage.getItem("ash_user");
        console.log("👤 AuthContext - Stored user:", storedUser);

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log("✅ AuthContext - Parsed user:", userData);
            setUser(userData);
          } catch (error) {
            console.error("❌ Error parsing stored user data:", error);
            // Clear invalid token and user data
            localStorage.removeItem("ash_token");
            localStorage.removeItem("ash_user");
            setToken(null);
            setUser(null);
          }
        } else {
          // No user data - clear token and require re-login
          localStorage.removeItem("ash_token");
          setToken(null);
          setUser(null);
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
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      const { access_token, user: userData } = data;

      setUser(userData);
      setToken(access_token);
      localStorage.setItem("ash_token", access_token);
      localStorage.setItem("ash_user", JSON.stringify(userData));
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ash_token");
      localStorage.removeItem("ash_user");
    }
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
