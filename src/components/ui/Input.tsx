"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-800">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-500/60",
          "transition-colors duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100",
          "disabled:bg-mist disabled:cursor-not-allowed",
          error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-line",
          props.type === "file" ? "p-2" : "p-0",
          className
        )}
        {...props}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
