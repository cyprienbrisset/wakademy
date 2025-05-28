"use client"

import { useTheme } from "next-themes"
import { useEffect, type ReactNode } from "react"

interface ThemeForceProviderProps {
  children: ReactNode
}

export function ThemeForceProvider({ children }: ThemeForceProviderProps) {
  const { setTheme } = useTheme()

  // Force light theme whenever this component mounts or re-renders
  useEffect(() => {
    setTheme("light")

    // Add a listener to catch any attempts to change the theme
    const observer = new MutationObserver(() => {
      // Force light theme if HTML element has dark class
      document.documentElement.classList.remove("dark")
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [setTheme])

  // Apply light theme class directly to ensure it's set before hydration
  if (typeof window !== "undefined") {
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")
  }

  return <>{children}</>
}
