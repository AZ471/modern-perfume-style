import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";

export type Role = "admin" | "client";

interface User {
  id: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (sessionUser: any) => {
    try {
      // 1. Fetch role from Supabase 'users' table by id or email
      const { data } = await supabase
        .from("users")
        .select("role")
        .or(`id.eq.${sessionUser.id},email.eq.${sessionUser.email}`)
        .maybeSingle();

      if (data && data.role) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email || "",
          role: data.role as Role,
        });
        return;
      }
    } catch (e) {
      console.warn("Could not fetch user role from Supabase 'users' table:", e);
    }

    // 2. Fallback check for explicit admin emails or metadata
    const emailLower = (sessionUser.email || "").toLowerCase();
    const isAdmin =
      emailLower === "dioufmorfay@gmail.com" ||
      emailLower.includes("admin") ||
      sessionUser.user_metadata?.role === "admin";

    const role: Role = isAdmin ? "admin" : "client";

    setUser({
      id: sessionUser.id,
      email: sessionUser.email || "",
      role,
    });
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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
