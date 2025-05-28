"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Force light theme on mount
    setTheme("light")
  }, [setTheme])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-5 w-5" />
        <span className="sr-only">Basculer le thème</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme("light")} // Always set to light theme
      className="h-9 w-9"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100" />
      <span className="sr-only">Basculer le thème</span>
    </Button>
  )
}
