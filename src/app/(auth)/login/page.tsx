"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { APP_NAME } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    const { error } = await signIn(values.email, values.password);
    if (error) {
      setFormError(error);
      return;
    }
    toast("Welcome back to SpendWise!");
    router.push("/dashboard");
  };

  return (
    <Card className="p-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-600">Log in to continue tracking your expenses.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
        {formError ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</div> : null}
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@college.edu"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={isSubmitting} fullWidth size="lg">
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">
        New to SpendWise?{" "}
        <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
          Create an account
        </Link>
      </p>
      <div className="mt-6 rounded-2xl bg-primary-50 p-4 text-center text-xs text-primary-800">
        <p className="font-semibold">Demo account</p>
        <p className="mt-1">Use any password (6+ chars) or <span className="font-mono">demo@spendwise.app</span> with any password to explore.</p>
      </div>
    </Card>
  );
}
