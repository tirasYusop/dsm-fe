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
  CalendarDays,
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

// Cycled gradients for lists that don't have a fixed color mapping (kitchens, months)
const ROTATING_COLORS = [
  "from-blue-500 to-cyan-400",
  "from-amber-500 to-orange-400",
  "from-purple-500 to-pink-400",
  "from-teal-500 to-emerald-400",
  "from-rose-500 to-red-400",
  "from-indigo-500 to-violet-400",
]

function formatMonthLabel(monthStr: string) {
  const [year, month] = monthStr.split("-")
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString("ms-MY", { month: "long", year: "numeric" })
}

function StatRow({
  icon: Icon,
  gradient,
  eyebrow,
  label,
  value,
  valueCaption = "Pengguna",
}: {
  icon: React.ElementType
  gradient: string
  eyebrow: string
  label: string
  value: number
  valueCaption?: string
}) {
  return (
    <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-gray-100 bg-white/60 p-3 dark:border-gray-800 dark:bg-gray-900/40">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      <div className="flex flex-1 items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-left text-xs font-bold text-muted-foreground">{eyebrow}</p>
          <p className="text-sm text-left font-semibold uppercase">{label}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-2xl font-bold leading-none">{value.toLocaleString()}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {valueCaption}
          </p>
        </div>
      </div>
    </div>
  )
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

  const purposeEntries = Object.entries(summary.by_purpose) as [keyof PurposeBreakdown, number][]

  return (
    <section className="relative px-6 py-16">
      <div className="w-full space-y-10">
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

        {/* Total records — left as-is */}
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

        <div className="flex flex-wrap gap-6">
          {/* By kitchen — now uses the same icon-row pattern as category */}
          <Card className="min-w-[280px] flex-1 overflow-hidden border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardHeader className="gap-0 bg-gradient-to-r from-green-700 to-emerald-600 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                <MapPin className="h-4 w-4" /> Pengguna Mengikut Lokasi
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 py-6">
              {summary.by_kitchen.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Tiada rekod lagi.</p>
              )}
              {summary.by_kitchen.map((k, i) => (
                <StatRow
                  key={k.kitchen_id}
                  icon={MapPin}
                  gradient={ROTATING_COLORS[i % ROTATING_COLORS.length]}
                  eyebrow="LOKASI"
                  label={k.kitchen_name}
                  value={k.total}
                />
              ))}
            </CardContent>
          </Card>

          {/* By category — unchanged, this is the reference pattern */}
          <Card className="min-w-[280px] flex-1 overflow-hidden border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardHeader className="gap-0 bg-gradient-to-r from-green-700 to-emerald-600 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                <Layers className="h-4 w-4" /> Pengguna Mengikut Kategori
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 py-6">
              {summary.by_category.map((c) => {
                const category = c.category?.trim() || "OTHERS"
                const Icon = CATEGORY_ICONS[category] || Users
                const gradient = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHERS
                return (
                  <StatRow
                    key={category}
                    icon={Icon}
                    gradient={gradient}
                    eyebrow="KATEGORI"
                    label={category}
                    value={c.total}
                  />
                )
              })}
            </CardContent>
          </Card>

          {/* By purpose — same icon-row pattern instead of the 4-up grid */}
          <Card className="min-w-[280px] flex-1 border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardHeader className="gap-0 bg-gradient-to-r from-blue-500 to-cyan-400 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                <UtensilsCrossed className="h-4 w-4" /> Tujuan Penggunaan
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 py-6">
              {purposeEntries.map(([key, value]) => (
                <StatRow
                  key={key}
                  icon={PURPOSE_ICONS[key]}
                  gradient={PURPOSE_COLORS[key]}
                  eyebrow="TUJUAN"
                  label={PURPOSE_LABELS[key]}
                  value={value}
                />
              ))}
            </CardContent>
          </Card>

          {/* Monthly summary — same icon-row pattern instead of the bar chart */}
          <Card className="min-w-[280px] flex-1 border-0 bg-white/70 p-0 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
            <CardHeader className="gap-0 bg-gradient-to-r from-green-700 to-emerald-600 py-4">
              <CardTitle className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-white">
                <TrendingUp className="h-4 w-4" /> Bulanan Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              {summary.monthly_summary.data.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Tiada data bulanan.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    {summary.monthly_summary.data.map((m, i) => (
                      <StatRow
                        key={m.month}
                        icon={CalendarDays}
                        gradient={ROTATING_COLORS[i % ROTATING_COLORS.length]}
                        eyebrow="BULAN"
                        label={formatMonthLabel(m.month)}
                        value={m.total}
                      />
                    ))}
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