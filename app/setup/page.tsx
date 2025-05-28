"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { SetupAdminForm } from "@/components/setup/setup-admin-form"
import { DatabaseInitializer } from "@/components/setup/database-initializer"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { checkAdminExists } from "@/lib/setup/database-actions"

export default function SetupPage() {
  const [loading, setLoading] = useState(true)
  const [adminExists, setAdminExists] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const checkAdminExistsAsync = async () => {
      try {
        // Check if we're already authenticated via localStorage
        const adminData = localStorage.getItem("wakademy_admin")
        if (adminData) {
          try {
            const admin = JSON.parse(adminData)
            if (admin.isAuthenticated) {
              // If we're already authenticated, redirect to dashboard instead of home
              router.push("/dashboard")
              return
            }
          } catch (e) {
            // Invalid JSON in localStorage, ignore and continue
            console.error("Invalid admin data in localStorage:", e)
            localStorage.removeItem("wakademy_admin")
          }
        }

        // Utiliser la nouvelle fonction checkAdminExists
        const adminCheck = await checkAdminExists()
        
        if (adminCheck.error) {
          console.warn("Erreur lors de la vérification de l'admin (non-bloquante):", adminCheck.error)
          // Ne pas bloquer le chargement de la page
          setAdminExists(false)
        } else {
          setAdminExists(adminCheck.exists)
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Setup page error:", err)
        setError("Une erreur est survenue lors du chargement de la page. Veuillez réessayer.")
        setLoading(false)
      }
    }

    checkAdminExistsAsync()
  }, [router])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setRetryCount((prev) => prev + 1)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de la page de configuration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-4 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Erreur de chargement</h1>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Problème de connexion</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image src="/wakademy-logo.png" alt="Wakademy" width={200} height={67} className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold">Configuration initiale</h1>
          <p className="text-muted-foreground mt-2">Configurez Wakademy en quelques étapes simples</p>
        </div>

        <Tabs defaultValue="database" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="database">1. Base de données</TabsTrigger>
            <TabsTrigger value="admin" disabled={!adminExists}>
              2. Compte admin {adminExists && "(Déjà configuré)"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="database" className="mt-4">
            <DatabaseInitializer />
          </TabsContent>
          <TabsContent value="admin" className="mt-4">
            {adminExists ? (
              <div className="p-4 border border-amber-200 rounded-md bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Un administrateur existe déjà</h3>
                <p className="text-amber-700 dark:text-amber-300">
                  Un compte administrateur a déjà été créé pour cette instance. Veuillez vous connecter avec les
                  identifiants existants ou contactez l'administrateur actuel.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Aller à la page de connexion
                  </button>
                </div>
              </div>
            ) : (
              <SetupAdminForm adminExists={adminExists} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
