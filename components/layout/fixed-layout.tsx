"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"

export function FixedLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 min-h-screen overflow-y-auto">
        <div className="container mx-auto p-4 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
