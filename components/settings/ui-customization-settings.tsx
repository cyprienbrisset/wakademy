"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Save, Palette, Type, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UICustomizationSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    font: "inter",
    animations: true,
    welcomeText: "Bienvenue sur Wakademy",
    ctaText: "Découvrir nos formations",
    heroDescription: "Votre plateforme de formation et de partage de connaissances",
  })

  const handleSave = () => {
    toast({
      title: "Interface personnalisée",
      description: "Les paramètres d'interface ont été appliqués.",
    })
  }

  const colors = [
    { name: "Bleu", value: "#3b82f6" },
    { name: "Vert", value: "#10b981" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Rouge", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Rose", value: "#ec4899" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Couleurs du thème
          </CardTitle>
          <CardDescription>Personnalisez les couleurs de votre plateforme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Couleur primaire</Label>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-full h-12 rounded-lg border-2 transition-all ${
                      settings.primaryColor === color.value
                        ? "border-foreground scale-105"
                        : "border-muted hover:border-muted-foreground"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSettings({ ...settings, primaryColor: color.value })}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
              <Input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-full h-12"
              />
            </div>

            <div className="space-y-3">
              <Label>Couleur secondaire</Label>
              <div className="grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-full h-12 rounded-lg border-2 transition-all ${
                      settings.secondaryColor === color.value
                        ? "border-foreground scale-105"
                        : "border-muted hover:border-muted-foreground"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSettings({ ...settings, secondaryColor: color.value })}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
              <Input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-full h-12"
              />
            </div>
          </div>

          <div className="p-4 border rounded-lg" style={{ borderColor: settings.primaryColor }}>
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Aperçu</span>
            </div>
            <div className="space-y-2">
              <Button style={{ backgroundColor: settings.primaryColor }} className="text-white">
                Bouton principal
              </Button>
              <Button
                variant="outline"
                style={{ borderColor: settings.secondaryColor, color: settings.secondaryColor }}
              >
                Bouton secondaire
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typographie
          </CardTitle>
          <CardDescription>Choisissez la police de caractères</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Police principale</Label>
            <Select value={settings.font} onValueChange={(value) => setSettings({ ...settings, font: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter (Moderne)</SelectItem>
                <SelectItem value="sf-pro">SF Pro (Apple)</SelectItem>
                <SelectItem value="roboto">Roboto (Google)</SelectItem>
                <SelectItem value="system">Police système</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 border rounded-lg">
            <div
              className="space-y-2"
              style={{
                fontFamily:
                  settings.font === "inter"
                    ? "Inter"
                    : settings.font === "sf-pro"
                      ? "SF Pro Display"
                      : settings.font === "roboto"
                        ? "Roboto"
                        : "system-ui",
              }}
            >
              <h3 className="text-lg font-bold">Exemple de titre</h3>
              <p className="text-sm text-muted-foreground">
                Ceci est un exemple de texte avec la police sélectionnée. Vous pouvez voir comment elle s'affichera sur
                votre plateforme.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textes personnalisés</CardTitle>
          <CardDescription>Modifiez les textes d'accueil et les appels à l'action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcome-text">Texte d'accueil</Label>
            <Input
              id="welcome-text"
              value={settings.welcomeText}
              onChange={(e) => setSettings({ ...settings, welcomeText: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-description">Description hero</Label>
            <Textarea
              id="hero-description"
              rows={2}
              value={settings.heroDescription}
              onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta-text">Texte du bouton principal</Label>
            <Input
              id="cta-text"
              value={settings.ctaText}
              onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Préférences d'affichage</CardTitle>
          <CardDescription>Configurez l'expérience utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animations</Label>
              <p className="text-sm text-muted-foreground">Activer les animations et transitions</p>
            </div>
            <Switch
              checked={settings.animations}
              onCheckedChange={(checked) => setSettings({ ...settings, animations: checked })}
            />
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
