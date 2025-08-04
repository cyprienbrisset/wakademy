"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { login } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Utiliser l'authentification Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw new Error(`Erreur d'authentification: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error("Identifiants invalides. Veuillez réessayer.")
      }

      // Vérifier que l'utilisateur a un profil admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .eq("role", "admin")
        .single()

      if (profileError) {
        // Se déconnecter si ce n'est pas un admin
        await supabase.auth.signOut()
        throw new Error(`Erreur lors de la vérification du profil: ${profileError.message}`)
      }

      if (!profile) {
        // Se déconnecter si ce n'est pas un admin
        await supabase.auth.signOut()
        throw new Error("Accès non autorisé. Seuls les administrateurs peuvent se connecter.")
      }

      // Store user info and sync authentication state
      login({
        email: authData.user.email,
        role: profile.role,
        id: authData.user.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
      })

      // Close modal and redirect to dashboard
      onClose()
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Une erreur s'est produite lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Image src="/wakademy-logo.png" alt="Wakademy" width={150} height={50} className="h-12 w-auto" />
          </div>
          <DialogTitle className="text-center text-xl">Connexion</DialogTitle>
          <DialogDescription className="text-center">
            Connectez-vous à votre compte Wakademy pour accéder à votre contenu.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wakademy.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Button variant="link" className="p-0 h-auto text-xs" type="button">
                Mot de passe oublié ?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground">Vous n'avez pas de compte ?</span>
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => {
              onClose()
              router.push("/setup")
            }}
          >
            Créer un compte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
