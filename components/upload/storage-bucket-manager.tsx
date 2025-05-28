"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function StorageBucketManager() {
  const [status, setStatus] = useState<"checking" | "exists" | "missing" | "creating" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    checkBucket()
  }, [])

  const checkBucket = async () => {
    try {
      setStatus("checking")
      setErrorMessage(null)

      // Utiliser directement l'API Supabase pour vérifier le bucket
      const response = await fetch("/api/storage/check-bucket", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la vérification du bucket")
      }

      const data = await response.json()

      console.log("Résultat de la vérification du bucket:", data)

      if (data.exists) {
        setStatus("exists")
      } else {
        setStatus("missing")
      }
    } catch (err) {
      console.error("Erreur lors de la vérification du bucket:", err)
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Erreur inconnue")
    }
  }

  const createBucket = async () => {
    try {
      setStatus("creating")
      setErrorMessage(null)
      setSuccessMessage(null)

      const response = await fetch("/api/storage/create-bucket", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la création du bucket")
      }

      const data = await response.json()

      if (data.success) {
        setStatus("exists")
        setSuccessMessage("Bucket de stockage créé avec succès")
      } else if (data.alreadyExists) {
        setStatus("exists")
        setSuccessMessage("Le bucket de stockage existe déjà")
      } else {
        throw new Error(data.message || "Erreur lors de la création du bucket")
      }
    } catch (err) {
      console.error("Erreur lors de la création du bucket:", err)
      setStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Erreur inconnue")
    }
  }

  // Si le bucket existe et qu'il n'y a pas de message de succès, ne rien afficher
  if (status === "exists" && !successMessage) {
    return null
  }

  // Afficher un message de succès temporaire
  if (status === "exists" && successMessage) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Stockage configuré</AlertTitle>
        <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
      </Alert>
    )
  }

  if (status === "checking") {
    return (
      <Alert className="bg-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Vérification du stockage</AlertTitle>
        <AlertDescription>Vérification de l'existence du bucket de stockage...</AlertDescription>
      </Alert>
    )
  }

  if (status === "creating") {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertTitle className="text-blue-800">Création en cours</AlertTitle>
        <AlertDescription className="text-blue-700">Création du bucket de stockage "content"...</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuration du stockage requise</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>
          Le bucket de stockage "content" n'existe pas ou n'est pas accessible. Vous devez créer ce bucket pour pouvoir
          télécharger des fichiers.
        </p>

        {errorMessage && <p className="text-sm font-medium">Erreur: {errorMessage}</p>}

        <div className="flex flex-wrap gap-3">
          <Button onClick={createBucket} disabled={(status as string) === "creating"} size="sm">
            {(status as string) === "creating" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le bucket automatiquement
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/setup">Aller à la page de configuration</Link>
          </Button>

          <Button variant="ghost" size="sm" onClick={checkBucket} disabled={(status as string) === "checking"}>
            Vérifier à nouveau
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
