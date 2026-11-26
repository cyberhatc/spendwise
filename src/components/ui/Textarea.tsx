"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-ink-800">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={cn(
          "w-full rounded-xl border bg-white p-3 text-sm text-ink-900 placeholder:text-ink-500/60",
          "transition-colors duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100",
          "disabled:bg-mist disabled:cursor-not-allowed",
          error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-line",
          className
        )}
        {...props}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}
