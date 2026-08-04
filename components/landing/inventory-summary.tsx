"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users2,
  MapPin,
  Layers,
  UtensilsCrossed,
  Loader2,
  TrendingUp,
  Wallet,
  Coins,
  Users,
} from "lucide-react"
import API from "@/lib/api1"
import { MdRiceBowl, MdSetMeal, MdKitchen, MdRestaurant } from "react-icons/md"
import type { IconType } from "react-icons"

interface KitchenBreakdown {
  kitchen_id: number
  kitchen_name: string
  total: number
}

interface CategoryBreakdown {
  category: string
  total: number
}

interface PurposeBreakdown {
  take_rice: number
  take_rice_and_dish: number
  use_kitchen: number
  take_rice_and_use_kitchen: number
}

interface MonthlyEntry {
  month: string
  total: number
}

interface StudentSummaryData {
  total_records: number
  by_kitchen: KitchenBreakdown[]
  by_category: CategoryBreakdown[]
  by_purpose: PurposeBreakdown
  monthly_summary: {
    data: MonthlyEntry[]
    total_all: number
  }
}

const PURPOSE_LABELS: Record<keyof PurposeBreakdown, string> = {
  take_rice: "Mengambil Agihan Nasi",
  take_rice_and_dish: "Mengambil Agihan Nasi & Lauk",
  use_kitchen: "Menggunakan Dapur Siswa",
  take_rice_and_use_kitchen: "Mengambil Agihan Nasi & Menggunakan Dapur",
}

const PURPOSE_ICONS: Record<keyof PurposeBreakdown, IconType> = {
  take_rice: MdRiceBowl,
  take_rice_and_dish: MdSetMeal,
  use_kitchen: MdKitchen,
  take_rice_and_use_kitchen: MdRestaurant,
}

const PURPOSE_COLORS: Record<keyof PurposeBreakdown, string> = {
  take_rice: "from-blue-500 to-cyan-400",
  take_rice_and_dish: "from-amber-500 to-orange-400",
  use_kitchen: "from-purple-500 to-pink-400",
  take_rice_and_use_kitchen: "from-teal-500 to-emerald-400",
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  B40: Wallet,
  M40: Coins,
  T20: TrendingUp,
  OTHERS: Users,
}

const CATEGORY_COLORS: Record<string, string> = {
  B40: "from-blue-500 to-cyan-400",
  M40: "from-amber-500 to-orange-400",
  T20: "from-purple-500 to-pink-400",
  OTHERS: "from-gray-500 to-gray-400",
}

const MAX_BAR_HEIGHT = 120 // px

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.split("-")
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString("ms-MY", { month: "short", year: "2-digit" })
}

export default function StudentSummary() {
  const [summary, setSummary] = useState<StudentSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/attendance/summary/student/")
        setSummary(res.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Tidak dapat memuatkan ringkasan pengguna buat masa ini.
      </p>
    )
  }

  const maxKitchenTotal = Math.max(...summary.by_kitchen.map((k) => k.total), 1)
  const maxMonthTotal = Math.max(...summary.monthly_summary.data.map((m) => m.total), 1)
  const purposeEntries = Object.entries(summary.by_purpose) as [keyof PurposeBreakdown, number][]

  return (
    <section className="relative px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center">
          <span className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-amber-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-700 uppercase dark:from-blue-900/40 dark:to-amber-800/20 dark:text-blue-300">
            Statistik Pengguna
          </span>
          <h2 className="font-['Playfair_Display'] mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Penggunaan Dapur Siswa Madani@UMS
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Terima kasih kepada semua pengguna atas kepercayaan dan sokongan kepada Dapur Siswa
            Madani@UMS. Bersama-sama kita manfaatkan kemudahan ini dengan sebaiknya demi
            kesejahteraan mahasiswa.
          </p>
        </div>

        {/* Total records */}
        <div className="flex justify-center">
          <Card className="w-full overflow-hidden border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardHeader className="gap-0 bg-gradient-to-r from-blue-500 to-cyan-400 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                Jumlah Rekod
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-6 py-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md">
                <Users2 className="h-8 w-8 text-white" fill="white" fillOpacity={0.25} />
              </div>
              <div>
                <p className="font-['Playfair_Display'] text-5xl font-bold leading-none">
                  {summary.total_records.toLocaleString()}
                </p>
                <p className="mt-2 text-xl font-bold text-green-900 dark:text-green-400">
                  PENGGUNA
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* By kitchen */}
          <Card className="w-full overflow-hidden border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardHeader className="gap-0 bg-gradient-to-r from-green-700 to-emerald-600 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                <MapPin className="h-4 w-4" /> Pengguna Mengikut Lokasi
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-7 py-6">
              {summary.by_kitchen.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Tiada rekod lagi.</p>
              )}
              {summary.by_kitchen.map((k) => (
                <div key={k.kitchen_id}>
                  <div className="mb-1 flex items-end justify-between">
                    <span className="text-sm">{k.kitchen_name}</span>
                    <span className="text-2xl font-bold leading-none">{k.total}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                      style={{ width: `${(k.total / maxKitchenTotal) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-end">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Pengguna
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* By category */}
          <Card className="w-full overflow-hidden border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardHeader className="gap-0 bg-gradient-to-r from-green-700 to-emerald-600 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                <Layers className="h-4 w-4" /> Pengguna Mengikut Kategori
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 py-6">
              {summary.by_category.map((c) => {
                const category = c.category?.trim() || "OTHERS"
                const Icon = CATEGORY_ICONS[category] || Users
                const gradient = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHERS
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex flex-1 items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground">KATEGORI</p>
                        <p className="text-sm font-semibold uppercase">{category}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-2xl font-bold leading-none">{c.total}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Pengguna
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* By purpose */}
          <Card className="border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70 md:col-span-2">
            <CardHeader className="gap-0 bg-gradient-to-r from-blue-500 to-cyan-400 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                <UtensilsCrossed className="h-4 w-4" /> Tujuan Penggunaan
              </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
              {purposeEntries.map(([key, value]) => {
                const Icon = PURPOSE_ICONS[key]
                const gradient = PURPOSE_COLORS[key]

                return (
                  <div key={key} className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{PURPOSE_LABELS[key]}</p>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Monthly summary */}
          <Card className="border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70 md:col-span-2">
            <CardHeader className="gap-0 bg-gradient-to-r from-green-700 to-emerald-600 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                <TrendingUp className="h-4 w-4" /> Bulanan Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {summary.monthly_summary.data.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Tiada data bulanan.
                </p>
              ) : (
                <>
                <div
                  className="flex items-end gap-3 overflow-x-auto pb-2 pt-6"
                  style={{ minHeight: MAX_BAR_HEIGHT + 40 }}
                >
                    {summary.monthly_summary.data.map((m) => {
                      const isHighest = m.total === maxMonthTotal && maxMonthTotal > 0
                      return (
                        <div key={m.month} className="flex shrink-0 flex-col items-center gap-1">
                          <span
                              className={`text-xs font-semibold ${
                                isHighest ? "text-blue-600" : "text-foreground"
                              }`}
                            >
                              {m.total}
                            </span>
                          <div
                            className={`w-8 rounded-t-md transition-all ${
                              isHighest
                                ? "bg-gradient-to-t from-amber-500 to-orange-400"
                                : "bg-gradient-to-t from-blue-500 to-cyan-400"
                            }`}
                            style={{
                              height: `${Math.max(
                                (m.total / maxMonthTotal) * MAX_BAR_HEIGHT,
                                4
                              )}px`,
                            }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {formatMonthLabel(m.month)}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-8 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Jumlah
                      </p>
                      <p className="text-xl font-bold">
                        {summary.monthly_summary.total_all.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Purata / Bulan
                      </p>
                      <p className="text-xl font-bold">
                        {Math.round(
                          summary.monthly_summary.total_all /
                            summary.monthly_summary.data.length
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}