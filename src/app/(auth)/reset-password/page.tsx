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

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: ResetValues) => {
    setFormError(null);
    const { error } = await resetPassword("token", values.password);
    if (error) {
      setFormError(error);
      return;
    }
    toast("Password updated successfully");
    router.push("/login");
  };

  return (
    <Card className="p-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Set a new password</h1>
        <p className="mt-2 text-sm text-ink-600">Choose a strong password for your account.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
        {formError ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</div> : null}
        <Input label="New password" type="password" placeholder="Minimum 8 characters" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" loading={isSubmitting} fullWidth size="lg">
          Update password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
