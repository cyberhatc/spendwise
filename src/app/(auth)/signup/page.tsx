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

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your name"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((v) => v.password.length >= 8, { message: "Password must be at least 8 characters" });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignupValues) => {
    setFormError(null);
    const { error } = await signUp(values.email, values.password, values.fullName);
    if (error) {
      setFormError(error);
      return;
    }
    toast("Account created — welcome to SpendWise!");
    router.push("/dashboard");
  };

  return (
    <Card className="p-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-2 text-sm text-ink-600">Start your money-smart journey in minutes.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
        {formError ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</div> : null}
        <Input label="Full name" placeholder="Aarav Mehta" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Email address" type="email" placeholder="you@college.edu" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" placeholder="Minimum 8 characters" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" loading={isSubmitting} fullWidth size="lg">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Log in
        </Link>
      </p>
    </Card>
  );
}
