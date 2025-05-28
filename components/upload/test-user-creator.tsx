"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { isAuthenticated, getUser } from "@/lib/auth"

export default function TestUserCreator() {
  const [isCreating, setIsCreating] = useState(false)
  const isLoggedIn = isAuthenticated()
  const user = getUser()

  if (isLoggedIn && user) {
    return null
  }

  const createTestUser = () => {
    setIsCreating(true)

    try {
      // Créer un utilisateur de test dans localStorage
      const testUser = {
        id: "test-user-" + Date.now(),
        email: "test@example.com",
        name: "Utilisateur Test",
        isAuthenticated: true,
        role: "admin",
      }

      localStorage.setItem("wakademy_admin", JSON.stringify(testUser))

      // Recharger la page pour appliquer les changements
      window.location.reload()
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur de test:", error)
      setIsCreating(false)
    }
  }

  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Mode développement</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          Vous n'êtes pas connecté. Pour tester les fonctionnalités d'upload, vous pouvez créer un utilisateur de test.
        </p>
        <Button variant="outline" size="sm" className="w-fit" onClick={createTestUser} disabled={isCreating}>
          {isCreating ? "Création..." : "Créer un utilisateur de test"}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
