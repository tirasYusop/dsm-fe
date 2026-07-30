"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface Poster {
  id: string
  src: string
  title: string
  description?: string
  date?: string
}

interface PosterCarouselProps {
  posters: Poster[]
  intervalMs?: number
}

export default function PosterCarousel({ posters, intervalMs = 5000 }: PosterCarouselProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<Poster | null>(null)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % posters.length)
  }, [posters.length])

  const prev = () => setIndex((i) => (i - 1 + posters.length) % posters.length)

  useEffect(() => {
    if (paused || posters.length <= 1) return
    const timer = setInterval(next, intervalMs)
    return () => clearInterval(timer)
  }, [paused, next, intervalMs, posters.length])

  if (!posters.length) return null

  return (
    <section className="relative px-3 py-6 sm:px-6 sm:py-10">
      <div className="absolute -inset-[2px] rounded-2xl bg-blue-400/10 blur-lg" />

      <div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg shadow-blue-500/20 dark:bg-blue-900"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {posters.map((poster) => (
            <button
              key={poster.id}
              onClick={() => setSelected(poster)}
              className="relative aspect-[4/5] w-full shrink-0 cursor-pointer focus:outline-none sm:aspect-[16/9] lg:aspect-[16/7]"
              aria-label={`Lihat poster: ${poster.title}`}
            >
              <Image
                src={poster.src}
                alt={poster.title}
                fill
                className="object-contain"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-left text-white sm:bottom-4 sm:left-4">
                <p className="text-sm font-semibold sm:text-lg">{poster.title}</p>
                {poster.date && <p className="text-[10px] opacity-80 sm:text-xs">{poster.date}</p>}
              </div>
            </button>
          ))}
        </div>

        {posters.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1.5 shadow hover:bg-white sm:left-3 sm:p-2"
              aria-label="Poster sebelumnya"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1.5 shadow hover:bg-white sm:right-3 sm:p-2"
              aria-label="Poster seterusnya"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-3 sm:gap-2">
              {posters.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all sm:h-2 ${
                    i === index ? "w-5 bg-white sm:w-6" : "w-1.5 bg-white/50 sm:w-2"
                  }`}
                  aria-label={`Ke poster ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Review / detail modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          className="h-screen w-screen max-w-none max-h-none rounded-none border-0 p-0"
          showCloseButton={false}
        >
          {selected && (
            <div className="relative flex h-full w-full flex-col bg-black/95">
              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-20 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 sm:right-4 sm:top-4"
                aria-label="Tutup"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Image area — takes remaining space, scales to fit */}
              <div className="relative flex flex-1 items-center justify-center overflow-hidden p-3 sm:p-8">
                <Image
                  src={selected.src}
                  alt={selected.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              {/* Info bar pinned at bottom */}
              <div className="shrink-0 bg-black/60 px-4 py-3 text-white backdrop-blur-sm sm:px-6 sm:py-4">
                <DialogTitle className="text-base font-semibold sm:text-lg">{selected.title}</DialogTitle>
                {selected.date && <p className="text-xs text-white/70">{selected.date}</p>}
                {selected.description && (
                  <p className="mt-1 text-sm text-white/80">{selected.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}