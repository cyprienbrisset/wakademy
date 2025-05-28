"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Key, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUser } from "@/lib/auth"

export function AdminAccountSettings() {
  const { toast } = useToast()
  const user = getUser()
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "Admin",
    lastName: user?.lastName || "Wakademy",
    email: user?.email || "admin@wakademy.com",
    role: user?.role || "admin",
  })

  const handleSave = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    })
  }

  const handlePasswordChange = () => {
    toast({
      title: "Mot de passe mis à jour",
      description: "Votre mot de passe a été modifié avec succès.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Gérez vos informations de profil administrateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">Prénom</Label>
              <Input
                id="first-name"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Nom</Label>
              <Input
                id="last-name"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Rôle</Label>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Super Admin
              </Badge>
              <span className="text-sm text-muted-foreground">Accès complet à tous les paramètres</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sécurité du compte</CardTitle>
          <CardDescription>Modifiez votre mot de passe et gérez la sécurité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <Input id="current-password" type="password" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handlePasswordChange} variant="outline" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Mettre à jour le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
