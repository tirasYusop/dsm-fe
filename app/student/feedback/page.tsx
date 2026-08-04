"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import { Star, Loader2, CheckCircle2 } from "lucide-react"
import API from "@/lib/api1"

interface FeedbackFormProps {
  kitchenId?: number
  kitchenName?: string
}

export default function FeedbackForm({ kitchenId, kitchenName }: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Sila pilih penilaian bintang.")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      await API.post("/feedback/", {
        kitchen: kitchenId || null,
        rating,
        comment,
      })
      setSubmitted(true)
    } catch {
      setError("Gagal menghantar maklum balas. Sila cuba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
          <p className="font-semibold">Terima kasih atas maklum balas anda!</p>
          <p className="text-sm text-muted-foreground">
            Pandangan anda membantu kami menambah baik Dapur Siswa.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 sm:p-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Maklum Balas Dapur Siswa Madani@UMS</h1>
          <p className="text-sm text-gray-500 mt-3">
            Kongsikan pengalaman, cadangan, atau aduan anda untuk membantu kami meningkatkan kualiti perkhidmatan Dapur Siswa Madani@UMS.
          </p>
        </div>

        <Card className="max-w-2xl jutify-center border-0 bg-white/70 shadow-md backdrop-blur-xl dark:bg-gray-900/70">
        <CardHeader>
            <CardTitle className="text-lg font-semibold">
            Maklum Balas {kitchenName ? `- ${kitchenName}` : "Dapur Siswa"}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1"
                >
                <Star
                    className={`h-8 w-8 transition-colors ${
                    star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-none text-gray-300"
                    }`}
                />
                </button>
            ))}
            </div>

            <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Kongsikan pengalaman anda (pilihan)..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800/50"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hantar Maklum Balas"}
            </Button>
        </CardContent>
        </Card>

    </div>

  )
}