"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, Check, Copy, Play, AlertTriangle, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function DatabaseSetupGuide() {
  const [activeTab, setActiveTab] = useState("schema")
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleExecuteSchema = async () => {
    setExecuting(true)
    setResult(null)

    try {
      const supabase = createClient()

      // Récupérer le contenu du script SQL
      const response = await fetch("/api/database/get-schema")
      if (!response.ok) {
        throw new Error("Impossible de récupérer le script SQL")
      }

      const { sql } = await response.json()

      // Exécuter le script SQL
      const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Les tables ont été créées avec succès",
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: `Erreur: ${error.message || "Une erreur s'est produite"}`,
      })
    } finally {
      setExecuting(false)
    }
  }

  const handleExecuteSeed = async () => {
    setExecuting(true)
    setResult(null)

    try {
      const supabase = createClient()

      // Récupérer le contenu du script SQL
      const response = await fetch("/api/database/get-seed")
      if (!response.ok) {
        throw new Error("Impossible de récupérer le script SQL")
      }

      const { sql } = await response.json()

      // Exécuter le script SQL
      const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Les données d'exemple ont été insérées avec succès",
      })
    } catch (error: any) {
      setResult({
        success: false,
        message: `Erreur: ${error.message || "Une erreur s'est produite"}`,
      })
    } finally {
      setExecuting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Configuration de la base de données
        </CardTitle>
        <CardDescription>Créez les tables nécessaires et ajoutez des données d'exemple pour Wakademy</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schema">1. Créer les tables</TabsTrigger>
            <TabsTrigger value="seed">2. Ajouter des données</TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Schéma de la base de données</h3>
                <Badge variant="outline">16 tables</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Ce script va créer toutes les tables nécessaires pour Wakademy, avec les relations, index et triggers
                appropriés.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tables principales :</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>users</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>contents</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>categories</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>tags</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>user_watch_history</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>user_favorites</span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Ce script va créer ou remplacer toutes les tables nécessaires. Les données existantes seront préservées
                si les tables existent déjà.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => copyToClipboard("-- Voir le script SQL complet dans lib/setup/create-all-tables.sql")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le script
              </Button>
              <Button variant="outline" onClick={() => window.open("/api/database/view-schema", "_blank")}>
                <FileText className="h-4 w-4 mr-2" />
                Voir le script
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="seed" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Données d'exemple</h3>
                <Badge variant="outline">5 contenus</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Ce script va ajouter des données d'exemple pour vous permettre de tester l'application.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Données incluses :</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Utilisateurs (5)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Contenus (5)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Historique de visionnage</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Favoris</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Évaluations</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span>Badges</span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Assurez-vous d'avoir d'abord créé les tables avant d'exécuter ce script. Les données existantes ne
                seront pas écrasées.
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => copyToClipboard("-- Voir le script SQL complet dans lib/setup/seed-sample-data.sql")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le script
              </Button>
              <Button variant="outline" onClick={() => window.open("/api/database/view-seed", "_blank")}>
                <FileText className="h-4 w-4 mr-2" />
                Voir le script
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
            {result.success ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Succès" : "Erreur"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={activeTab === "schema" ? handleExecuteSchema : handleExecuteSeed}
          disabled={executing}
          className="w-full"
        >
          {executing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exécution en cours...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Exécuter le script {activeTab === "schema" ? "de création des tables" : "d'insertion des données"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
