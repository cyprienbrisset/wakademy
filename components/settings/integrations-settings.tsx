"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Slack, Mail, Webhook, Cloud, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function IntegrationsSettings() {
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState({
    slack: {
      enabled: false,
      webhookUrl: "",
      channel: "#general",
    },
    email: {
      enabled: false,
      provider: "disabled",
      smtpHost: "",
      smtpPort: "587",
      username: "",
      password: "",
    },
    webhook: {
      enabled: false,
      url: "",
      events: ["content.created", "user.registered"],
    },
    storage: {
      provider: "local",
      s3Bucket: "",
      s3Region: "eu-west-1",
      s3AccessKey: "",
      s3SecretKey: "",
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    },
  })

  const handleSave = () => {
    toast({
      title: "Intégrations sauvegardées",
      description: "Les paramètres d'intégration ont été mis à jour.",
    })
  }

  const testIntegration = (type: string) => {
    toast({
      title: "Test en cours...",
      description: `Test de l'intégration ${type} en cours.`,
    })

    // Simulate test
    setTimeout(() => {
      toast({
        title: "Test réussi",
        description: `L'intégration ${type} fonctionne correctement.`,
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Slack className="h-5 w-5" />
            Intégration Slack
          </CardTitle>
          <CardDescription>Recevez des notifications sur Slack</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer Slack</Label>
              <p className="text-sm text-muted-foreground">Notifications automatiques pour les nouveaux contenus</p>
            </div>
            <Switch
              checked={integrations.slack.enabled}
              onCheckedChange={(checked) =>
                setIntegrations({
                  ...integrations,
                  slack: { ...integrations.slack, enabled: checked },
                })
              }
            />
          </div>

          {integrations.slack.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slack-webhook">URL du webhook Slack</Label>
                <Input
                  id="slack-webhook"
                  placeholder="https://hooks.slack.com/services/..."
                  value={integrations.slack.webhookUrl}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      slack: { ...integrations.slack, webhookUrl: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slack-channel">Canal par défaut</Label>
                <Input
                  id="slack-channel"
                  placeholder="#general"
                  value={integrations.slack.channel}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      slack: { ...integrations.slack, channel: e.target.value },
                    })
                  }
                />
              </div>

              <Button variant="outline" onClick={() => testIntegration("Slack")} className="w-full">
                Tester la connexion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuration Email
          </CardTitle>
          <CardDescription>Paramètres pour l'envoi d'emails automatiques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer les emails</Label>
              <p className="text-sm text-muted-foreground">Notifications par email pour les utilisateurs</p>
            </div>
            <Switch
              checked={integrations.email.enabled}
              onCheckedChange={(checked) =>
                setIntegrations({
                  ...integrations,
                  email: { ...integrations.email, enabled: checked },
                })
              }
            />
          </div>

          {integrations.email.enabled && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Serveur SMTP</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.gmail.com"
                    value={integrations.email.smtpHost}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        email: { ...integrations.email, smtpHost: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Port</Label>
                  <Input
                    id="smtp-port"
                    placeholder="587"
                    value={integrations.email.smtpPort}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        email: { ...integrations.email, smtpPort: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">Nom d'utilisateur</Label>
                  <Input
                    id="smtp-username"
                    type="email"
                    value={integrations.email.username}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        email: { ...integrations.email, username: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Mot de passe</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={integrations.email.password}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        email: { ...integrations.email, password: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <Button variant="outline" onClick={() => testIntegration("Email")} className="w-full">
                Tester la configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook personnalisé
          </CardTitle>
          <CardDescription>Recevez des notifications HTTP pour les événements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer webhook</Label>
              <p className="text-sm text-muted-foreground">Notifications HTTP pour les événements système</p>
            </div>
            <Switch
              checked={integrations.webhook.enabled}
              onCheckedChange={(checked) =>
                setIntegrations({
                  ...integrations,
                  webhook: { ...integrations.webhook, enabled: checked },
                })
              }
            />
          </div>

          {integrations.webhook.enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL du webhook</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://votre-api.com/webhook"
                  value={integrations.webhook.url}
                  onChange={(e) =>
                    setIntegrations({
                      ...integrations,
                      webhook: { ...integrations.webhook, url: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Événements à surveiller</Label>
                <div className="flex flex-wrap gap-2">
                  {["content.created", "content.updated", "user.registered", "user.login"].map((event) => (
                    <Badge
                      key={event}
                      variant={integrations.webhook.events.includes(event) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const events = integrations.webhook.events.includes(event)
                          ? integrations.webhook.events.filter((e) => e !== event)
                          : [...integrations.webhook.events, event]
                        setIntegrations({
                          ...integrations,
                          webhook: { ...integrations.webhook, events },
                        })
                      }}
                    >
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Stockage externe
          </CardTitle>
          <CardDescription>Configuration du stockage des fichiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Fournisseur de stockage</Label>
            <div className="flex gap-2">
              <Button
                variant={integrations.storage.provider === "local" ? "default" : "outline"}
                onClick={() =>
                  setIntegrations({
                    ...integrations,
                    storage: { ...integrations.storage, provider: "local" },
                  })
                }
              >
                Local
              </Button>
              <Button
                variant={integrations.storage.provider === "s3" ? "default" : "outline"}
                onClick={() =>
                  setIntegrations({
                    ...integrations,
                    storage: { ...integrations.storage, provider: "s3" },
                  })
                }
              >
                Amazon S3
              </Button>
            </div>
          </div>

          {integrations.storage.provider === "s3" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="s3-bucket">Nom du bucket</Label>
                  <Input
                    id="s3-bucket"
                    placeholder="mon-bucket-wakademy"
                    value={integrations.storage.s3Bucket}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        storage: { ...integrations.storage, s3Bucket: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3-region">Région</Label>
                  <Input
                    id="s3-region"
                    placeholder="eu-west-1"
                    value={integrations.storage.s3Region}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        storage: { ...integrations.storage, s3Region: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="s3-access-key">Clé d'accès</Label>
                  <Input
                    id="s3-access-key"
                    value={integrations.storage.s3AccessKey}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        storage: { ...integrations.storage, s3AccessKey: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3-secret-key">Clé secrète</Label>
                  <Input
                    id="s3-secret-key"
                    type="password"
                    value={integrations.storage.s3SecretKey}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        storage: { ...integrations.storage, s3SecretKey: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuration Supabase
          </CardTitle>
          <CardDescription>Paramètres de connexion à la base de données</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supabase-url">URL Supabase</Label>
            <Input id="supabase-url" value={integrations.supabase.url} readOnly className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supabase-anon-key">Clé anonyme</Label>
            <Input
              id="supabase-anon-key"
              value={integrations.supabase.anonKey}
              readOnly
              className="bg-muted font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default">Connecté</Badge>
            <span className="text-sm text-muted-foreground">
              Configuration automatique via les variables d'environnement
            </span>
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
