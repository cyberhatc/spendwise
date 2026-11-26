"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotValues) => {
    setFormError(null);
    const { error } = await requestPasswordReset(values.email);
    if (error) {
      setFormError(error);
      return;
    }
    setSent(true);
    toast("Password reset link sent", "info");
  };

  return (
    <Card className="p-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Reset your password</h1>
        <p className="mt-2 text-sm text-ink-600">We&apos;ll email you a secure link to reset your password.</p>
      </div>
      {sent ? (
        <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-center">
          <p className="font-semibold text-emerald-800">Check your inbox</p>
          <p className="mt-1 text-sm text-emerald-700">If an account exists for that email, a reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
          {formError ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</div> : null}
          <Input label="Email address" type="email" placeholder="you@college.edu" autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Button type="submit" loading={isSubmitting} fullWidth size="lg">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-ink-600">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
