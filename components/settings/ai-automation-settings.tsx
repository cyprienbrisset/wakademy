"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Save, Brain, Zap, Globe, Bell, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AIAutomationSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<{
    autoCategorization: boolean;
    autoSummaries: boolean;
    keywordIndexing: boolean;
    personalizedSuggestions: boolean;
    autoTranslation: boolean;
    smartNotifications: boolean;
    translationLanguage: string;
    [key: string]: boolean | string;
  }>({
    autoCategorization: true,
    autoSummaries: true,
    keywordIndexing: true,
    personalizedSuggestions: true,
    autoTranslation: false,
    smartNotifications: true,
    translationLanguage: "en",
  })

  const handleSave = () => {
    toast({
      title: "Paramètres IA sauvegardés",
      description: "Les paramètres d'automatisation ont été mis à jour.",
    })
  }

  const aiFeatures = [
    {
      key: "autoCategorization",
      title: "Catégorisation automatique",
      description: "L'IA analyse et catégorise automatiquement les nouveaux contenus",
      icon: Brain,
      usage: 85,
    },
    {
      key: "autoSummaries",
      title: "Résumés automatiques",
      description: "Génération automatique de résumés pour vidéos, podcasts et documents",
      icon: FileText,
      usage: 72,
    },
    {
      key: "keywordIndexing",
      title: "Indexation des mots-clés",
      description: "Extraction automatique des mots-clés et concepts importants",
      icon: Zap,
      usage: 91,
    },
    {
      key: "personalizedSuggestions",
      title: "Suggestions personnalisées",
      description: "Recommandations de contenu basées sur l'historique utilisateur",
      icon: Brain,
      usage: 68,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Fonctionnalités IA principales
          </CardTitle>
          <CardDescription>Configurez les capacités d'intelligence artificielle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {aiFeatures.map((feature) => (
            <div key={feature.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <feature.icon className="h-4 w-4" />
                    <Label>{feature.title}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Switch
                  checked={settings[feature.key] as boolean}
                  onCheckedChange={(checked) => setSettings({ ...settings, [feature.key]: checked })}
                />
              </div>

              {(settings[feature.key] as boolean) && (
                <div className="ml-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilisation ce mois</span>
                    <span>{feature.usage}%</span>
                  </div>
                  <Progress value={feature.usage} className="h-2" />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Traduction automatique
          </CardTitle>
          <CardDescription>Traduisez automatiquement le contenu dans d'autres langues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer la traduction automatique</Label>
              <p className="text-sm text-muted-foreground">Traduit automatiquement les titres et descriptions</p>
            </div>
            <Switch
              checked={settings.autoTranslation}
              onCheckedChange={(checked) => setSettings({ ...settings, autoTranslation: checked })}
            />
          </div>

          {settings.autoTranslation && (
            <div className="space-y-2">
              <Label>Langue cible principale</Label>
              <Select
                value={settings.translationLanguage}
                onValueChange={(value) => setSettings({ ...settings, translationLanguage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">Anglais</SelectItem>
                  <SelectItem value="es">Espagnol</SelectItem>
                  <SelectItem value="de">Allemand</SelectItem>
                  <SelectItem value="it">Italien</SelectItem>
                  <SelectItem value="pt">Portugais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications intelligentes
          </CardTitle>
          <CardDescription>Notifications personnalisées basées sur l'IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifications smart</Label>
              <p className="text-sm text-muted-foreground">
                L'IA envoie des notifications pertinentes selon le contenu consulté
              </p>
            </div>
            <Switch
              checked={settings.smartNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, smartNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques d'utilisation IA</CardTitle>
          <CardDescription>Aperçu de l'utilisation des fonctionnalités IA ce mois</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Contenus analysés</span>
                <span className="text-sm font-medium">1,247</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Résumés générés</span>
                <span className="text-sm font-medium">892</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Tags créés</span>
                <span className="text-sm font-medium">3,456</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Suggestions envoyées</span>
                <span className="text-sm font-medium">567</span>
              </div>
              <Progress value={45} className="h-2" />
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
