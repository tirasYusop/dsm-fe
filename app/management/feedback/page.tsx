"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Loader2, MessageSquare, Filter } from "lucide-react"
import API from "@/lib/api1"

interface FeedbackItem {
  id: number
  student_name: string
  kitchen: number | null
  kitchen_name: string | null
  rating: number
  comment: string
  created_at: string
}

interface Kitchen {
  id: number
  name: string
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-none text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function FeedbackManagementPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [kitchens, setKitchens] = useState<Kitchen[]>([])
  const [selectedKitchen, setSelectedKitchen] = useState<string>("")
  const [selectedRating, setSelectedRating] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchKitchens() {
      try {
        const res = await API.get("/kitchens/")
        setKitchens(res.data)
      } catch {
      }
    }
    fetchKitchens()
  }, [])

  useEffect(() => {
    async function fetchFeedback() {
      setLoading(true)
      try {
        const params: Record<string, string> = {}
        if (selectedKitchen) params.kitchen = selectedKitchen
        const res = await API.get("/feedback/", { params })
        setFeedback(res.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
  }, [selectedKitchen])

  const filteredFeedback = selectedRating
    ? feedback.filter((f) => f.rating === Number(selectedRating))
    : feedback

  const averageRating =
    feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2)
      : "0.00"

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold">Maklum Balas Pengguna</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semua maklum balas yang diterima daripada pelajar mengenai Dapur Siswa.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 text-white">
              <Star className="h-6 w-6" fill="white" fillOpacity={0.3} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Penilaian Purata
              </p>
              <p className="text-2xl font-bold">{averageRating}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Jumlah Maklum Balas
              </p>
              <p className="text-2xl font-bold">{feedback.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-700 to-emerald-600 text-white">
              <Star className="h-6 w-6" fill="white" fillOpacity={0.3} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Penilaian 5 Bintang
              </p>
              <p className="text-2xl font-bold">
                {feedback.filter((f) => f.rating === 5).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <select
            value={selectedKitchen}
            onChange={(e) => setSelectedKitchen(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white/50 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800/50"
          >
            <option value="">Semua Dapur</option>
            {kitchens.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>

          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white/50 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800/50"
          >
            <option value="">Semua Penilaian</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Bintang
              </option>
            ))}
          </select>

          {(selectedKitchen || selectedRating) && (
            <button
              onClick={() => {
                setSelectedKitchen("")
                setSelectedRating("")
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Kosongkan penapis
            </button>
          )}
        </CardContent>
      </Card>

      {/* Feedback list */}
      <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Senarai Maklum Balas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-muted-foreground">
              Tidak dapat memuatkan maklum balas.
            </p>
          ) : filteredFeedback.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Tiada maklum balas ditemui.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{f.student_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.kitchen_name || "Umum"} · {formatDate(f.created_at)}
                      </p>
                    </div>
                    <StarRow rating={f.rating} />
                  </div>
                  {f.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{f.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}