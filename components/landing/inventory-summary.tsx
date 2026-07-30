"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Wallet, AlertTriangle, Warehouse, Loader2, Receipt } from "lucide-react"
import axios from "axios"

interface LandingSummary {
  total_items: number
  total_management_stock: number
  total_management_value: number
  total_amount_received: number
  alerts_count: number
  kitchens_covered: number
}

function formatCurrency(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
  }).format(value)
}

const publicAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
})

export default function InventorySummary() {
  const [summary, setSummary] = useState<LandingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await publicAPI.get("/landing/inventory-summary/")
        setSummary(res.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const cards = summary
    ? [
        {
          label: "Jumlah Item",
          value: summary.total_items.toLocaleString(),
          sub: "jenis bahan direkodkan",
          icon: Package,
          gradient: "from-blue-500 to-cyan-400",
        },
        {
          label: "Stok Keseluruhan",
          value: summary.total_management_stock.toLocaleString(),
          sub: "unit di pusat",
          icon: Warehouse,
          gradient: "from-amber-500 to-orange-400",
        },
        {
          label: "Anggaran Nilai",
          value: formatCurrency(summary.total_management_value),
          sub: "nilai stok semasa",
          icon: Wallet,
          gradient: "from-purple-500 to-pink-400",
        },
        {
          label: "Jumlah Perbelanjaan",
          value: formatCurrency(summary.total_amount_received),
          sub: "amaun direkodkan masuk",
          icon: Receipt,
          gradient: "from-teal-500 to-emerald-400",
        },
        {
          label: "Amaran Stok",
          value: summary.alerts_count.toLocaleString(),
          sub: "item stok rendah/habis",
          icon: AlertTriangle,
          gradient: "from-red-500 to-rose-400",
        },
      ]
    : []

  return (
    <section className="relative px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center" data-aos="fade-up">
          <span className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-amber-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-700 uppercase dark:from-blue-900/40 dark:to-amber-800/20 dark:text-blue-300">
            Status Semasa
          </span>
          <h2 className="font-['Playfair_Display'] mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ringkasan Inventori
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Gambaran keseluruhan stok bahan dan perbelanjaan di seluruh dapur, dikemaskini secara masa nyata.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-muted-foreground">
            Tidak dapat memuatkan ringkasan inventori buat masa ini.
          </p>
        )}

        {!loading && !error && summary && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {cards.map((card, i) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="group relative" data-aos="fade-up" data-aos-delay={i * 100}>
                    <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-0 blur-lg transition-all duration-500 group-hover:opacity-20`} />
                    <Card className="relative h-full border-0 bg-white/70 shadow-md shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900/70">
                      <div className={`h-1.5 w-full rounded-t-xl bg-gradient-to-r ${card.gradient}`} />
                      <CardHeader className="pb-2">
                        <div className={`mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-sm`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {card.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-['Playfair_Display'] text-2xl font-bold">{card.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>

            {summary.kitchens_covered > 0 && (
              <p className="mt-8 text-center text-xs text-muted-foreground" data-aos="fade-up">
                Merangkumi {summary.kitchens_covered} dapur aktif
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}