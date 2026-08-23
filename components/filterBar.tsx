"use client";

import { Filter } from "lucide-react";
import type { ReactNode } from "react";

interface SelectFilterConfig {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel?: string;
}

interface FilterBarProps {
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  selects?: SelectFilterConfig[];
  onClear?: () => void;
  hasActiveFilters?: boolean;
  rightSlot?: ReactNode;
}

export default function FilterBar({ search, selects = [], onClear, hasActiveFilters, rightSlot }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {search && (
          <input
            type="text"
            placeholder={search.placeholder ?? "Search..."}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        )}
        {selects.map((s, i) => (
          <select
            key={i}
            value={s.value}
            onChange={(e) => s.onChange(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">{s.allLabel ?? "Semua"}</option>
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ))}
        {hasActiveFilters && onClear && (
          <button onClick={onClear} type="button" className="text-xs font-medium text-gray-500 underline hover:text-gray-700">
            Kosongkan penapis
          </button>
        )}
      </div>
      {rightSlot}
    </div>
  );
}