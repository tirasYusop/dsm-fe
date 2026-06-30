"use client";

import { ReactNode } from "react";

type BaseFormProps = {
  title: string;
  subtitle?: string;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  loading?: boolean;
  submitText?: string;
};

export default function BaseForm({
  title,
  subtitle,
  onSubmit,
  children,
  loading,
  submitText = "Submit",
}: BaseFormProps) {
  return (
    <div className="w-full max-w-lg border rounded-lg bg-white p-6">
      <h1 className="text-2xl font-bold mb-1">{title}</h1>

      {subtitle && (
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {children}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Loading..." : submitText}
        </button>
      </form>
    </div>
  );
}