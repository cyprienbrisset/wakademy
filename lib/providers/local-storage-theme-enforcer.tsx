"use client"

import { useEffect } from "react"

export function LocalStorageThemeEnforcer() {
  useEffect(() => {
    // Set light theme in localStorage
    localStorage.setItem("theme", "light")

    // Override any attempts to change the theme
    const originalSetItem = localStorage.setItem
    localStorage.setItem = function (key, value) {
      if (key === "theme") {
        return originalSetItem.call(this, key, "light")
      }
      return originalSetItem.call(this, key, value)
    }

    return () => {
      // Restore original functionality when component unmounts
      localStorage.setItem = originalSetItem
    }
  }, [])

  return null
}
