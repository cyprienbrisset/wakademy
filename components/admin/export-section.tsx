"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, FileSpreadsheet, FileJson, Share2, RefreshCw, Webhook, Database, MessageSquare } from "lucide-react"

export function ExportSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📥 Export & intégrations</CardTitle>
          <CardDescription>Exportez vos données ou intégrez-les avec d'autres services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export de données</TabsTrigger>
              <TabsTrigger value="integrations">Intégrations</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <FileSpreadsheet className="h-5 w-5 mr-2" />
                      Statistiques par contenu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Exportez les statistiques détaillées pour chaque contenu de la plateforme.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en CSV
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <FileSpreadsheet className="h-5 w-5 mr-2" />
                      Statistiques par utilisateur
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Exportez les données d'utilisation et de progression pour chaque utilisateur.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en CSV
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <FileSpreadsheet className="h-5 w-5 mr-2" />
                      Historique d'engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Exportez l'historique complet des interactions et de l'engagement.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en CSV
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter en Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <FileJson className="h-5 w-5 mr-2" />
                    Export de données brutes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exportez les données brutes de la plateforme pour une analyse personnalisée.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Données utilisateurs (JSON)
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Données contenus (JSON)
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Données analytiques (JSON)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Exports automatiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configurez des exports automatiques réguliers vers votre espace de stockage.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Rapport hebdomadaire</span>
                      </div>
                      <Badge variant="outline">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Rapport mensuel</span>
                      </div>
                      <Badge variant="outline">Actif</Badge>
                    </div>
                    <Button variant="outline" className="w-full justify-start mt-2">
                      <Share2 className="h-4 w-4 mr-2" />
                      Configurer un nouvel export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Webhook className="h-5 w-5 mr-2" />
                      API & Webhooks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Intégrez Wakademy avec vos systèmes via notre API REST et webhooks.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>API REST</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Actif
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Webhook className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Webhooks</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Actif
                        </Badge>
                      </div>
                      <Button variant="outline" className="w-full justify-start mt-2">
                        <Share2 className="h-4 w-4 mr-2" />
                        Gérer les clés API
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Intégrations tierces
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connectez Wakademy avec vos outils de travail préférés.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src="/slack-logo.png" alt="Slack" className="h-4 w-4 mr-2" />
                          <span>Slack</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Connecté
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src="/microsoft-teams-logo.png" alt="Teams" className="h-4 w-4 mr-2" />
                          <span>Microsoft Teams</span>
                        </div>
                        <Badge variant="outline" className="bg-gray-100 text-gray-500">
                          Non connecté
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img src="/notion-logo.png" alt="Notion" className="h-4 w-4 mr-2" />
                          <span>Notion</span>
                        </div>
                        <Badge variant="outline" className="bg-gray-100 text-gray-500">
                          Non connecté
                        </Badge>
                      </div>
                      <Button variant="outline" className="w-full justify-start mt-2">
                        <Share2 className="h-4 w-4 mr-2" />
                        Ajouter une intégration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Intégrations LMS / ERP / CRM
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connectez Wakademy avec vos systèmes d'entreprise existants.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <img src="/moodle-logo.png" alt="Moodle" className="h-5 w-5 mr-2" />
                          <span className="font-medium">Moodle</span>
                        </div>
                        <Badge variant="outline" className="bg-gray-100 text-gray-500">
                          Non connecté
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Synchronisez les contenus et les progressions avec votre LMS Moodle.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Connecter
                      </Button>
                    </div>

                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <img src="/salesforce-logo.png" alt="Salesforce" className="h-5 w-5 mr-2" />
                          <span className="font-medium">Salesforce</span>
                        </div>
                        <Badge variant="outline" className="bg-gray-100 text-gray-500">
                          Non connecté
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Intégrez les données utilisateurs avec votre CRM Salesforce.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Connecter
                      </Button>
                    </div>

                    <div className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <img src="/sap-logo.png" alt="SAP" className="h-5 w-5 mr-2" />
                          <span className="font-medium">SAP</span>
                        </div>
                        <Badge variant="outline" className="bg-gray-100 text-gray-500">
                          Non connecté
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Connectez vos données RH et formation avec votre système SAP.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Connecter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
