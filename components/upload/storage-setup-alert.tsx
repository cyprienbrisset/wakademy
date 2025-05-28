"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function StorageSetupAlert() {
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // Vérifier si le bucket existe via une API
    const checkBucket = async () => {
      try {
        const response = await fetch("/api/storage/check-bucket")
        const data = await response.json()
        setShowAlert(!data.exists)
      } catch (error) {
        console.error("Error checking bucket:", error)
        setShowAlert(true) // En cas d'erreur, on affiche l'alerte par précaution
      }
    }

    checkBucket()
  }, [])

  if (!showAlert) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuration de stockage requise</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Le bucket de stockage <strong>content</strong> n'a pas été trouvé. Pour permettre le téléchargement de
          fichiers, un administrateur doit créer ce bucket dans Supabase.
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Accédez au tableau de bord Supabase</li>
          <li>Allez dans la section "Storage"</li>
          <li>Cliquez sur "New Bucket" et nommez-le "content"</li>
          <li>Cochez "Public bucket" pour permettre l'accès public aux fichiers</li>
          <li>Configurez les politiques RLS pour contrôler l'accès</li>
        </ol>
        <p className="mt-2">
          <Link href="/setup" className="text-blue-600 hover:underline">
            Aller à la page de configuration
          </Link>
        </p>
      </AlertDescription>
    </Alert>
  )
}
