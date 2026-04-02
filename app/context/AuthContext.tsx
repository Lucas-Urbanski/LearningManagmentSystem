"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type UserRole = "student" | "instructor";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Using the SSR-friendly browser client
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error || !authUser) {
          setUser(null);
        } else {
          setUser({
            id: authUser.id,
            email: authUser.email ?? "",
            name:
              (authUser.user_metadata?.fullName as string) ||
              (authUser.email?.split("@")[0] ?? "User"),
            role: (authUser.user_metadata?.role as UserRole) || "student",
          });
        }
      } catch (err) {
        console.error("Auth context error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
      } else {
        const sUser = session.user;
        setUser({
          id: sUser.id,
          email: sUser.email ?? "",
          name:
            (sUser.user_metadata?.fullName as string) ||
            (sUser.email?.split("@")[0] ?? "User"),
          role: (sUser.user_metadata?.role as UserRole) || "student",
        });
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
