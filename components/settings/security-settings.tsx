"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Eye, AlertTriangle, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SecuritySettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    publicAccess: false,
    maintenanceMode: false,
    apiKey: "wk_live_1234567890abcdef",
    ipRestriction: "",
    twoFactorAuth: false,
  })

  const handleSave = () => {
    toast({
      title: "Paramètres de sécurité sauvegardés",
      description: "Les paramètres de sécurité ont été mis à jour.",
    })
  }

  const generateNewApiKey = () => {
    const newKey = `wk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setSettings({ ...settings, apiKey: newKey })
    toast({
      title: "Nouvelle clé API générée",
      description: "Une nouvelle clé API a été créée. Assurez-vous de la sauvegarder.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contrôle d'accès</CardTitle>
          <CardDescription>Gérez qui peut accéder à votre plateforme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Accès public</Label>
              <p className="text-sm text-muted-foreground">Permettre l'accès sans authentification (mode vitrine)</p>
            </div>
            <Switch
              checked={settings.publicAccess}
              onCheckedChange={(checked) => setSettings({ ...settings, publicAccess: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">Désactiver temporairement l'accès à la plateforme</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>

          {settings.maintenanceMode && (
            <div className="p-4 border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Mode maintenance activé
                </span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Les utilisateurs verront une page de maintenance au lieu du contenu normal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clé API</CardTitle>
          <CardDescription>Gérez l'accès programmatique à votre instance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Clé API actuelle</Label>
            <div className="flex gap-2">
              <Input value={settings.apiKey} readOnly className="font-mono" />
              <Button variant="outline" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Utilisez cette clé pour accéder à l'API Wakademy</p>
            <Button onClick={generateNewApiKey} variant="outline" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Générer nouvelle clé
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Restriction d'accès</CardTitle>
          <CardDescription>Limitez l'accès par adresse IP (optionnel)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip-restriction">Adresses IP autorisées</Label>
            <Input
              id="ip-restriction"
              placeholder="192.168.1.1, 10.0.0.0/8"
              value={settings.ipRestriction}
              onChange={(e) => setSettings({ ...settings, ipRestriction: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Séparez les adresses par des virgules. Laissez vide pour autoriser toutes les IP.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs de connexion récents</CardTitle>
          <CardDescription>Activité de connexion des 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2024-01-15 14:30", ip: "192.168.1.100", status: "success" },
              { date: "2024-01-15 09:15", ip: "192.168.1.100", status: "success" },
              { date: "2024-01-14 16:45", ip: "10.0.0.50", status: "failed" },
              { date: "2024-01-14 11:20", ip: "192.168.1.100", status: "success" },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={log.status === "success" ? "default" : "destructive"}>
                    {log.status === "success" ? "Succès" : "Échec"}
                  </Badge>
                  <span className="text-sm font-mono">{log.ip}</span>
                </div>
                <span className="text-sm text-muted-foreground">{log.date}</span>
              </div>
            ))}
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
