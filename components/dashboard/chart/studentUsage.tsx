"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Wallet, Coins, TrendingUp, Users, MapPin } from "lucide-react";
import { MdRiceBowl, MdSetMeal, MdKitchen, MdRestaurant } from "react-icons/md";
import type { IconType } from "react-icons";

export interface KitchenBreakdown {
  kitchen_id: number;
  kitchen_name: string;
  total: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
}

export interface PurposeBreakdown {
  take_rice: number;
  take_rice_and_dish: number;
  use_kitchen: number;
  take_rice_and_use_kitchen: number;
}

export interface MonthlyEntry {
  month: string;
  total: number;
}

export interface StudentSummaryData {
  total_records: number;
  by_kitchen: KitchenBreakdown[];
  by_category: CategoryBreakdown[];
  by_purpose: PurposeBreakdown;
  monthly_summary: {
    data: MonthlyEntry[];
    total_all: number;
  };
}

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  B40: { label: "B40", icon: Wallet, color: "#5B7B87" },
  M40: { label: "M40", icon: Coins, color: "#D9A441" },
  T20: { label: "T20", icon: TrendingUp, color: "#114B44" },
  OTHERS: { label: "Lain-lain", icon: Users, color: "#9CA3AF" },
};

const PURPOSE_META: Record<keyof PurposeBreakdown, { label: string; icon: IconType; color: string }> = {
  take_rice: { label: "Mengambil Agihan Nasi", icon: MdRiceBowl, color: "#114B44" },
  take_rice_and_dish: { label: "Mengambil Nasi & Lauk", icon: MdSetMeal, color: "#D9A441" },
  use_kitchen: { label: "Menggunakan Dapur Siswa", icon: MdKitchen, color: "#5B7B87" },
  take_rice_and_use_kitchen: { label: "Nasi & Guna Dapur", icon: MdRestaurant, color: "#C4694F" },
};

const MAX_BAR_HEIGHT = 100;

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("ms-MY", { month: "short", year: "2-digit" });
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />;
}

export default function StudentUsageSummary({
  data,
  loading,
}: {
  data: StudentSummaryData | null;
  loading: boolean;
}) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <SkeletonBlock className="h-64 lg:col-span-2" />
        <SkeletonBlock className="h-64 lg:col-span-3" />
      </div>
    );
  }

  const maxKitchenTotal = Math.max(...data.by_kitchen.map((k) => k.total), 1);
  const purposeEntries = Object.entries(data.by_purpose) as [keyof PurposeBreakdown, number][];

  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold tracking-[0.2em] text-[#5B7B87] uppercase">
        Ringkasan Pengguna Dapur
      </p>

      {/* Category + Purpose */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* By category */}
        <div className="border rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-lg text-[#16211C] mb-1">Pengguna Mengikut Kategori</h2>
          <p className="text-sm text-[#5B7B87] mb-4">B40 / M40 / T20 / Lain-lain</p>

          <div className="space-y-3">
            {data.by_category.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">Tiada rekod.</p>
            ) : (
              data.by_category.map((c) => {
                const category = c.category?.trim() || "OTHERS";
                const meta = CATEGORY_META[category] ?? CATEGORY_META.OTHERS;
                const Icon = meta.icon;
                return (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl border border-[#E5E9E7] p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="text-sm font-medium text-[#16211C]">{meta.label}</span>
                    </div>
                    <span className="text-lg font-bold text-[#16211C]">{c.total}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* By purpose */}
        <div className="border rounded-2xl bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="font-semibold text-lg text-[#16211C] mb-1">Tujuan Penggunaan</h2>
          <p className="text-sm text-[#5B7B87] mb-4">Sebab pelajar melawat dapur</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {purposeEntries.map(([key, value]) => {
              const meta = PURPOSE_META[key];
              const Icon = meta.icon;
              return (
                <div key={key} className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E9E7] p-3 text-center">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="text-xl font-bold leading-none text-[#16211C]">{value}</span>
                  <span className="text-[11px] leading-tight text-[#5B7B87]">{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* By kitchen + monthly trend */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* By kitchen */}
        <div className="border rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="flex items-center gap-1.5 font-semibold text-lg text-[#16211C] mb-1">
            <MapPin size={16} /> Mengikut Lokasi
          </h2>
          <p className="text-sm text-[#5B7B87] mb-4">Jumlah pengguna setiap dapur</p>

          <div className="space-y-4">
            {data.by_kitchen.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">Tiada rekod.</p>
            ) : (
              data.by_kitchen.map((k) => (
                <div key={k.kitchen_id}>
                  <div className="mb-1 flex items-end justify-between">
                    <span className="text-sm text-[#16211C]">{k.kitchen_name}</span>
                    <span className="text-sm font-bold text-[#16211C]">{k.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EEF2F1] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#114B44]"
                      style={{ width: `${(k.total / maxKitchenTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Monthly trend */}
        <div className="border rounded-2xl bg-white p-6 shadow-sm lg:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-semibold text-lg text-[#16211C]">Bulanan Pengguna</h2>
            <div className="text-right">
              <p className="text-xs text-[#5B7B87]">Purata / Bulan</p>
              <p className="text-sm font-bold text-[#16211C]">
                {data.monthly_summary.data.length > 0
                  ? Math.round(data.monthly_summary.total_all / data.monthly_summary.data.length).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>
          <p className="text-sm text-[#5B7B87] mb-4">Jumlah pengguna sepanjang bulan</p>

          {data.monthly_summary.data.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#9CA3AF]">Tiada data bulanan.</p>
          ) : (
            <ResponsiveContainer width="100%" height={MAX_BAR_HEIGHT + 60}>
              <BarChart data={data.monthly_summary.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E9E7" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(v) => formatMonthLabel(v as string)}
                  tick={{ fontSize: 11, fill: "#5B7B87" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#5B7B87" }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(label) => formatMonthLabel(label as string)}
                  formatter={(value) => [String(value), "Pengguna"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #E5E9E7", fontSize: 13 }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#114B44" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}