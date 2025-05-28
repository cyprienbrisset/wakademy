"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { OfflineModeToggle } from "@/components/offline-mode-toggle"

export function GeneralSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    platformName: "Wakademy",
    language: "fr",
    timezone: "Europe/Paris",
    defaultTheme: "system",
    publicUrl: "https://wakademy.example.com",
  })

  const handleSave = () => {
    // Simulate save
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres généraux ont été mis à jour avec succès.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Nom de la plateforme</Label>
            <Input
              id="platform-name"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Langue principale</Label>
            <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-theme">Thème par défaut</Label>
            <Select
              value={settings.defaultTheme}
              onValueChange={(value) => setSettings({ ...settings, defaultTheme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="system">Automatique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="public-url">URL publique</Label>
            <Input
              id="public-url"
              value={settings.publicUrl}
              onChange={(e) => setSettings({ ...settings, publicUrl: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mode hors ligne</CardTitle>
          <CardDescription>
            Activez le mode hors ligne pour permettre l'utilisation de l'application sans connexion internet.
            Les contenus seront mis en cache localement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OfflineModeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo et favicon</CardTitle>
          <CardDescription>Personnalisez l'identité visuelle de votre plateforme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Logo principal</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cliquez pour uploader un logo</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 2MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cliquez pour uploader un favicon</p>
                <p className="text-xs text-muted-foreground mt-1">ICO, PNG 32x32px</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder
        </Button>
      </div>
    </div>
  )
}
