"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineModeToggle() {
  const [isOffline, setIsOffline] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Vérifier si les Service Workers sont supportés
    setIsSupported("serviceWorker" in navigator)

    // Écouter les changements de statut réseau
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // État initial
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const toggleOfflineMode = async () => {
    if (!isSupported) return

    try {
      if (isOffline) {
        // Désactiver le mode hors ligne
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.unregister()
        }
        setIsOffline(false)
      } else {
        // Activer le mode hors ligne
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })

        if (registration) {
          setIsOffline(true)
        }
      }
    } catch (error) {
      // Erreur silencieuse lors du basculement du mode hors ligne
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isOffline ? "default" : "outline"}
        size="sm"
        onClick={toggleOfflineMode}
        className="flex items-center gap-2"
      >
        {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
        {isOffline ? "Mode hors ligne" : "Mode en ligne"}
      </Button>

      {isOffline && (
        <Badge variant="secondary" className="text-xs">
          Contenu mis en cache
        </Badge>
      )}
    </div>
  )
} 