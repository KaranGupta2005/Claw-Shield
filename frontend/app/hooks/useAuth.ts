"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  chronotype?: string;
  soundSensitivity?: number;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store tokens
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        return {
          success: false,
          error: result.error || "Login failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error",
      };
    }
  };

  const signup = async (data: SignupData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store tokens
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        return {
          success: false,
          error: result.error || "Signup failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error",
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return false;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    refreshToken,
    checkAuth,
  };
}
