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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("forge_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("forge_token"));

  const login = useCallback(async (email: string, password: string) => {
    // Demo auth - replace with real API
    await new Promise((r) => setTimeout(r, 800));
    const demoUsers = getDemoUsers();
    const found = demoUsers.find((u: any) => u.email === email && u.password === password);
    if (!found && !(email === "demo@forge.ai" && password === "password123")) {
      throw new Error("Invalid credentials");
    }
    const u = found || { full_name: "Demo User", email: "demo@forge.ai", password: "" };
    const fakeToken = btoa(JSON.stringify({ email: u.email, exp: Date.now() + 86400000 }));
    const userData = { id: "1", full_name: u.full_name, email: u.email };
    localStorage.setItem("forge_token", fakeToken);
    localStorage.setItem("forge_user", JSON.stringify(userData));
    setToken(fakeToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (full_name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const demoUsers = getDemoUsers();
    if (demoUsers.find((u: any) => u.email === email)) {
      throw new Error("Email already registered");
    }
    const newUsers = [...demoUsers, { full_name, email, password }];
    saveDemoUsers(newUsers);
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
