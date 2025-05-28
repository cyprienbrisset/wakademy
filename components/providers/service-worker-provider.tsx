"use client"

import { useEffect } from "react"

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Enregistrer le service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
    }
  }, [])

  return <>{children}</>
} 