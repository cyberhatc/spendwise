"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? "");
  const [currency, setCurrency] = useState(user?.user_metadata?.currency ?? "INR");
  const [theme, setTheme] = useState<"light" | "dark">(user?.user_metadata?.theme ?? "light");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ full_name: fullName, currency, theme });
    setSaving(false);
    toast("Profile updated");
  };

  const onSignOut = async () => {
    setSigningOut(true);
    await signOut();
    toast("Signed out", "info");
    router.push("/login");
  };

  if (!user) {
    return (
      <CardSkeleton className="h-64" />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Profile &amp; settings</h1>
        <p className="mt-1 text-sm text-ink-600">Manage your account details and preferences.</p>
      </div>

      <Card>
        <h2 className="font-semibold text-ink-900">Account</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-600">Name</span>
            <span className="font-medium text-ink-900">{user.user_metadata?.full_name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-600">Email</span>
            <span className="font-medium text-ink-900">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-600">Member since</span>
            <span className="font-medium text-ink-900">{new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink-900">Preferences</h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full">
            <option value="INR">Indian Rupee (₹ INR)</option>
            <option value="USD">US Dollar ($ USD)</option>
            <option value="EUR">Euro (€ EUR)</option>
          </Select>
          <Select label="Theme" value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")} className="w-full">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
          <Button type="submit" loading={saving}>Save preferences</Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold text-ink-900">Session</h2>
        <p className="mt-2 text-sm text-ink-600">Signed in as {user.email}</p>
        <div className="mt-4">
          <Button variant="danger" onClick={() => void onSignOut()} loading={signingOut}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
