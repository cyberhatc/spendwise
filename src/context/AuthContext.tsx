"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/mode";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ error?: string }>;
  updateProfile: (patch: { full_name?: string; currency?: string; theme?: "light" | "dark" }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER_ID = "demo_user_spendwise";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode()) {
      const demoUser = {
        id: DEMO_USER_ID,
        aud: "authenticated",
        role: "authenticated",
        email: "demo@spendwise.app",
        email_confirmed_at: new Date().toISOString(),
        user_metadata: { full_name: "Aarav Mehta", currency: "INR", theme: "light" },
        app_metadata: { provider: "demo" },
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as User;
      setUser(demoUser);
      setLoading(false);
      return;
    }

    let mounted = true;
    let client: ReturnType<typeof createClient> | null = null;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      const c = createClient();
      client = c;
      const { data } = await c.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      const { data: sub } = c.auth.onAuthStateChange((_event, s) => {
        if (!mounted) return;
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    };
    void init();

    return () => {
      mounted = false;
      unsubscribe?.();
      void client;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode()) {
      if (password.length >= 4) {
        const demoUser = {
          id: "demo_user_spendwise",
          aud: "authenticated",
          role: "authenticated",
          email: email || "demo@spendwise.app",
          email_confirmed_at: new Date().toISOString(),
          user_metadata: { full_name: "Aarav Mehta", currency: "INR", theme: "light" },
          app_metadata: { provider: "demo" },
          identities: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as User;
        setUser(demoUser);
        return { error: undefined };
      }
      return { error: "Invalid email or password" };
    }
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    return { error: error?.message ?? undefined };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (isDemoMode()) {
      const demoUser = {
        id: "demo_user_spendwise",
        aud: "authenticated",
        role: "authenticated",
        email: email || "demo@spendwise.app",
        email_confirmed_at: new Date().toISOString(),
        user_metadata: { full_name: fullName || "Aarav Mehta", currency: "INR", theme: "light" },
        app_metadata: { provider: "demo" },
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as User;
      setUser(demoUser);
      return { error: undefined };
    }
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? undefined };
  }, []);

  const signOut = useCallback(async () => {
    if (!isDemoMode()) {
      const { error } = await createClient().auth.signOut();
      if (error) throw new Error(error.message);
    }
    setSession(null);
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (isDemoMode()) return { error: undefined };
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password`,
    });
    return { error: error?.message ?? undefined };
  }, []);

  const resetPassword = useCallback(async (_token: string, password: string) => {
    if (isDemoMode()) return { error: undefined };
    const { error } = await createClient().auth.updateUser({ password });
    return { error: error?.message ?? undefined };
  }, []);

  const updateProfile = useCallback(
    async (patch: { full_name?: string; currency?: string; theme?: "light" | "dark" }) => {
      if (isDemoMode()) {
        return { error: undefined };
      }
      const { error } = await createClient().auth.updateUser({
        data: {
          full_name: patch.full_name,
          currency: patch.currency,
          theme: patch.theme,
        },
      });
      if (error) return { error: error.message };
      return {};
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      resetPassword,
      updateProfile,
    }),
    [user, session, loading, signIn, signUp, signOut, requestPasswordReset, resetPassword, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
