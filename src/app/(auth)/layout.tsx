"use client";

import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-lavender px-4 py-12">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary-200/40 blur-3xl" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
