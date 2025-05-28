"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Info, CheckCircle } from "lucide-react"
import { createAdminUser } from "@/lib/setup/database-actions"

interface SetupAdminFormProps {
  adminExists?: boolean
}

export function SetupAdminForm({ adminExists = false }: SetupAdminFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<"form" | "creating" | "success">("form")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStep("creating")

    try {
      // Utiliser la nouvelle fonction createAdminUser
      const result = await createAdminUser({
        email,
        firstName,
        lastName,
        password, // Optionnel pour l'instant
      })

      if (result.success) {
        // Récupérer l'ID utilisateur depuis les détails du résultat
        const userIdMatch = result.details?.match(/ID: ([a-f0-9-]+)/)
        const userId = userIdMatch ? userIdMatch[1] : null

        // Stocker les informations admin dans localStorage pour la gestion de session
        localStorage.setItem(
          "wakademy_admin",
          JSON.stringify({
            email,
            role: "admin",
            id: userId,
            firstName,
            lastName,
            isAuthenticated: true,
          }),
        )

        setStep("success")
        setSuccess(true)

        // Rediriger vers le tableau de bord après un délai
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } else {
        throw new Error(result.message)
      }
    } catch (err: any) {
      console.error("Erreur setup:", err)
      setError(err.message || "Une erreur s'est produite lors de la configuration")
      setStep("form")
    } finally {
      setLoading(false)
    }
  }

  if (step === "creating") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <h3 className="text-lg font-semibold">Configuration en cours...</h3>
          <p className="text-sm text-muted-foreground">
            Création de votre compte administrateur et initialisation de la base de données
          </p>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
          <h3 className="text-xl font-semibold text-green-800">Configuration réussie !</h3>
          <div className="space-y-2">
            <p className="text-sm text-green-700">Votre compte administrateur a été créé avec succès.</p>
            <p className="text-sm text-muted-foreground">
              Redirection vers le tableau de bord dans quelques secondes...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Avertissement si un admin existe déjà */}
      {adminExists && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Un administrateur existe déjà</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Un compte administrateur a déjà été créé. Vous pouvez créer un compte supplémentaire ou{" "}
            <a href="/login" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-100">
              vous connecter
            </a>
            .
          </AlertDescription>
        </Alert>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erreur de configuration</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulaire de création du compte admin */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Configuration initiale</h2>
          <p className="text-muted-foreground">Créez votre compte administrateur pour commencer à utiliser Wakademy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email administrateur</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wakademy.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe sécurisé"
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">Le mot de passe doit contenir au moins 6 caractères</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !email || !password || !firstName || !lastName}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer le compte administrateur"
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            En créant ce compte, vous acceptez d'être l'administrateur principal de cette instance Wakademy.
          </p>
        </div>
      </div>
    </div>
  )
}
