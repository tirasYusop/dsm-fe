"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    AOS?: {
      init: (options?: Record<string, unknown>) => void
      refresh: () => void
    }
  }
}

export default function AOSInit() {
  useEffect(() => {
    function init() {
      window.AOS?.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: "ease-out-cubic",
      })
    }

    if (window.AOS) {
      init()
    } else {
      // AOS script might not be loaded yet — retry
      const timeout = setTimeout(() => {
        if (window.AOS) init()
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [])

  return null
}
