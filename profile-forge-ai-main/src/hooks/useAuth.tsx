import React from "react";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (full_name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users store (replaced by real backend when Cloud is connected)
const getDemoUsers = () => {
  const users = localStorage.getItem("forge_demo_users");
  return users ? JSON.parse(users) : [];
};

const saveDemoUsers = (users: any[]) => {
  localStorage.setItem("forge_demo_users", JSON.stringify(users));
};

const API_BASE = (import.meta as any).env.VITE_API_URL || "";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("forge_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("forge_token"));

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Invalid credentials");
    }

    const fakeToken = btoa(JSON.stringify({ email: data.email, exp: Date.now() + 86400000 }));
    const userData = { id: String(data.id), full_name: data.full_name, email: data.email };

    localStorage.setItem("forge_token", fakeToken);
    localStorage.setItem("forge_user", JSON.stringify(userData));
    setToken(fakeToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (full_name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("forge_token");
    localStorage.removeItem("forge_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
