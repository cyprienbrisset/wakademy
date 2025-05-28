"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Loader2,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Wrench,
  RotateCcw,
  HardDrive,
  Upload,
} from "lucide-react"
import {
  initializeDatabase,
  checkDatabaseStatus,
  repairMissingTables,
  runMigrations,
  checkStorageBucket,
  createStorageBucket,
  type DatabaseStatus,
  type RepairResult,
  type BucketStatus,
} from "@/lib/setup/database-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function DatabaseInitializer() {
  const [loading, setLoading] = useState(false)
  const [repairing, setRepairing] = useState(false)
  const [checking, setChecking] = useState(true)
  const [creatingBucket, setCreatingBucket] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<"checking" | "idle" | "initializing" | "repairing" | "success" | "error">("checking")
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null)
  const [bucketStatus, setBucketStatus] = useState<BucketStatus | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null)
  const [activeTab, setActiveTab] = useState<"status" | "repair" | "logs" | "storage">("status")
  const [retryCount, setRetryCount] = useState(0)

  // Vérifier l'état de la base de données au chargement
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setChecking(true)
    setError(null)
    setStep("checking")
    setRepairResult(null)

    try {
      // Vérifier l'état de la base de données
      const status = await checkDatabaseStatus()
      setDatabaseStatus(status)

      try {
        // Vérifier l'état du bucket de stockage
        // Nous séparons cette vérification pour éviter que les erreurs de bucket
        // n'empêchent l'affichage du statut des tables
        const bucket = await checkStorageBucket()
        setBucketStatus(bucket)
      } catch (bucketError: any) {
        console.warn("Erreur lors de la vérification du bucket (non bloquante):", bucketError)
        // Définir un statut par défaut pour le bucket en cas d'erreur
        setBucketStatus({ exists: false, name: "content" })
      }

      if (status.isInitialized) {
        setSuccess(true)
        setStep("success")
      } else {
        setStep("idle")
      }
    } catch (err: any) {
      console.error("Erreur de vérification:", err)
      setError(err.message || "Impossible de vérifier l'état de la base de données")
      setStep("error")

      // Si l'erreur est liée à trop de connexions, attendre et réessayer
      if (err.message && err.message.includes("Too many connections")) {
        if (retryCount < 3) {
          // Limiter le nombre de tentatives
          setError("Trop de connexions à la base de données. Nouvelle tentative dans 5 secondes...")
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
            checkStatus()
          }, 5000)
        } else {
          setError("Trop de connexions à la base de données. Veuillez réessayer plus tard ou rafraîchir la page.")
        }
      }
    } finally {
      setChecking(false)
    }
  }

  const handleInitializeDatabase = async () => {
    setLoading(true)
    setError(null)
    setStep("initializing")
    setRepairResult(null)

    try {
      const result = await initializeDatabase()

      if (result.success) {
        if (result.alreadyInitialized) {
          setSuccess(true)
          setStep("success")
        } else {
          // Revérifier l'état après initialisation
          await checkStatus()
        }
      } else {
        setError(result.message || "Une erreur s'est produite lors de l'initialisation de la base de données")
        setStep("error")
      }
    } catch (err: any) {
      console.error("Erreur d'initialisation:", err)
      setError(err.message || "Une erreur s'est produite lors de l'initialisation de la base de données")
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  const handleRunMigrations = async () => {
    setRepairing(true)
    setError(null)
    setStep("repairing")
    setActiveTab("repair")

    try {
      const result = await runMigrations()
      setRepairResult(result)

      if (result.success) {
        // Revérifier l'état après les migrations
        await checkStatus()
        setActiveTab("status")
        setSuccess(true)
      } else {
        setError(result.message || "Une erreur s'est produite lors de l'exécution des migrations")
        setStep("error")
      }
    } catch (err: any) {
      console.error("Erreur lors des migrations:", err)
      setError(err.message || "Une erreur s'est produite lors de l'exécution des migrations")
      setStep("error")
    } finally {
      setRepairing(false)
    }
  }

  const handleRepairMissingTables = async () => {
    setRepairing(true)
    setError(null)
    setStep("repairing")
    setActiveTab("repair")

    try {
      const result = await repairMissingTables()
      setRepairResult(result)

      if (result.success) {
        // Revérifier l'état après réparation
        await checkStatus()
        setActiveTab("status")
      } else {
        setError(result.message || "Une erreur s'est produite lors de la réparation")
        setStep("error")
      }
    } catch (err: any) {
      console.error("Erreur de réparation:", err)
      setError(err.message || "Une erreur s'est produite lors de la réparation")
      setStep("error")
    } finally {
      setRepairing(false)
    }
  }

  const handleCreateStorageBucket = async () => {
    setCreatingBucket(true)
    setError(null)

    try {
      const result = await createStorageBucket()

      if (result.success) {
        // Si le bucket existait déjà
        if (result.alreadyExists) {
          setError(null)
          setSuccess(true)
          // Forcer une mise à jour du statut pour refléter que le bucket existe
          await checkStatus()
          setActiveTab("status")
        } else {
          // Revérifier l'état après création du bucket
          await checkStatus()
          setActiveTab("status")
          // Afficher un message de succès temporaire
          setError(null)
          setSuccess(true)
        }
      } else {
        if (result.requiresManualSetup) {
          // Cas spécial pour la configuration manuelle
          setError(
            "La création automatique a échoué en raison des restrictions de sécurité. Veuillez suivre les instructions ci-dessous pour créer le bucket manuellement.",
          )
          setActiveTab("storage")
        } else {
          setError(result.message || "Une erreur s'est produite lors de la création du bucket")
        }
      }
    } catch (err: any) {
      console.error("Erreur de création du bucket:", err)

      // Vérifier si l'erreur indique que le bucket existe déjà
      if (err.message && err.message.includes("already exists")) {
        setError(null)
        setSuccess(true)
        // Forcer une mise à jour du statut pour refléter que le bucket existe
        await checkStatus()
        setActiveTab("status")
      }
      // Vérifier si l'erreur est liée à la RLS
      else if (err.message && err.message.includes("violates row-level security")) {
        setError(
          "Vous n'avez pas les permissions nécessaires pour créer automatiquement le bucket. Veuillez le créer manuellement via l'interface Supabase.",
        )
        setActiveTab("storage")
      } else {
        setError(err.message || "Une erreur s'est produite lors de la création du bucket")
      }
    } finally {
      setCreatingBucket(false)
    }
  }

  const getStatusBadge = (exists: boolean, rowCount?: number) => {
    if (exists) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          ✓ Créée {rowCount !== undefined && `(${rowCount} lignes)`}
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
        ✗ Manquante
      </Badge>
    )
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Initialisation de la base de données
          {checking && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          {step === "checking"
            ? "Vérification de l'état actuel de la base de données..."
            : "Créez ou réparez les tables nécessaires pour Wakademy"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === "checking" && (
          <div className="flex items-center justify-center p-6 text-center">
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium">Vérification en cours...</p>
                <p className="text-sm text-muted-foreground">Analyse de l'état de la base de données</p>
              </div>
            </div>
          </div>
        )}

        {step === "initializing" && (
          <div className="flex items-center justify-center p-6 text-center">
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium">Initialisation en cours...</p>
                <p className="text-sm text-muted-foreground">Création des tables, index et données initiales</p>
              </div>
            </div>
          </div>
        )}

        {step === "repairing" && (
          <div className="flex items-center justify-center p-6 text-center">
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium">Réparation en cours...</p>
                <p className="text-sm text-muted-foreground">Création des tables manquantes uniquement</p>
              </div>
            </div>
          </div>
        )}

        {(step === "success" || step === "idle" || step === "error") && databaseStatus && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">État actuel</TabsTrigger>
              <TabsTrigger value="repair" disabled={databaseStatus.isInitialized}>
                Réparation
              </TabsTrigger>
              <TabsTrigger value="storage">Stockage</TabsTrigger>
              <TabsTrigger value="logs" disabled={!repairResult?.details}>
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4 mt-4">
              {step === "success" && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-300">Base de données initialisée</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Toutes les tables ont été créées avec succès ({databaseStatus.existingTables}/
                    {databaseStatus.totalTables} tables). Vous pouvez maintenant créer votre compte administrateur.
                  </AlertDescription>
                </Alert>
              )}

              {step === "error" && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {step === "idle" && (
                <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertTitle className="text-yellow-800 dark:text-yellow-300">Base de données incomplète</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    {databaseStatus.existingTables}/{databaseStatus.totalTables} tables trouvées.
                    {databaseStatus.missingTables.length > 0 && (
                      <> Tables manquantes : {databaseStatus.missingTables.join(", ")}</>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">État des tables :</p>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="h-8">
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDetails ? "Masquer" : "Voir"} les détails
                </Button>
              </div>

              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleContent className="space-y-2">
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {databaseStatus.tablesStatus.map((table) => (
                      <div key={table.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <span className="font-mono text-sm">{table.name}</span>
                          <p className="text-xs text-muted-foreground">{table.description}</p>
                        </div>
                        {getStatusBadge(table.exists, table.rowCount)}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>

            <TabsContent value="repair" className="space-y-4 mt-4">
              {databaseStatus && !databaseStatus.isInitialized && (
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                    <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Réparation ciblée</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      Cette option va créer uniquement les {databaseStatus.missingTables.length} tables manquantes, en
                      préservant les {databaseStatus.existingTables} tables existantes.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tables à créer :</p>
                    <div className="grid gap-2 max-h-40 overflow-y-auto">
                      {databaseStatus.missingTables.map((tableName) => (
                        <div key={tableName} className="flex items-center p-2 bg-muted/50 rounded">
                          <span className="font-mono text-sm">{tableName}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Avantages de la réparation ciblée :</p>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                      <li>Préserve les données existantes</li>
                      <li>Plus rapide qu'une initialisation complète</li>
                      <li>Crée automatiquement les dépendances manquantes</li>
                      <li>Ajoute les index et triggers nécessaires</li>
                    </ul>
                  </div>
                </div>
              )}

              {repairResult && (
                <Alert
                  className={
                    repairResult.success
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900"
                      : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900"
                  }
                >
                  {repairResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  <AlertTitle
                    className={
                      repairResult.success ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
                    }
                  >
                    {repairResult.success ? "Réparation réussie" : "Échec de réparation"}
                  </AlertTitle>
                  <AlertDescription
                    className={
                      repairResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                    }
                  >
                    {repairResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="storage" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Stockage des fichiers</h3>
                </div>

                <Alert
                  className={
                    bucketStatus?.exists
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900"
                      : "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900"
                  }
                >
                  {bucketStatus?.exists ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  )}
                  <AlertTitle
                    className={
                      bucketStatus?.exists
                        ? "text-green-800 dark:text-green-300"
                        : "text-yellow-800 dark:text-yellow-300"
                    }
                  >
                    {bucketStatus?.exists ? "Bucket de stockage configuré" : "Bucket de stockage manquant"}
                  </AlertTitle>
                  <AlertDescription
                    className={
                      bucketStatus?.exists
                        ? "text-green-700 dark:text-green-400"
                        : "text-yellow-700 dark:text-yellow-400"
                    }
                  >
                    {bucketStatus?.exists
                      ? `Le bucket "${bucketStatus.name}" est prêt à recevoir des fichiers.`
                      : `Le bucket "${bucketStatus?.name || "content"}" doit être créé pour permettre l'upload de fichiers.`}
                  </AlertDescription>
                </Alert>

                {!bucketStatus?.exists && (
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">Bucket de stockage pour les contenus</h4>
                          <p className="text-sm text-muted-foreground">
                            Nécessaire pour l'upload de vidéos, podcasts et documents
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nom du bucket</span>
                          <span className="font-mono">content</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accès public</span>
                          <span>Oui (lecture seule)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Limite de taille</span>
                          <span>50 MB par fichier</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Types de fichiers</span>
                          <span>Vidéo, audio, PDF, images, texte</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleCreateStorageBucket} disabled={creatingBucket} className="w-full">
                      {creatingBucket ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Vérification et création du bucket...
                        </>
                      ) : (
                        <>
                          <HardDrive className="mr-2 h-4 w-4" />
                          Vérifier et créer le bucket de stockage
                        </>
                      )}
                    </Button>

                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                      <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertTitle className="text-blue-800 dark:text-blue-300">
                        Configuration manuelle requise
                      </AlertTitle>
                      <AlertDescription className="text-blue-700 dark:text-blue-400">
                        <div className="space-y-2">
                          <p>
                            En raison des restrictions de sécurité, vous devez créer le bucket manuellement. Suivez ces
                            étapes dans l'interface d'administration Supabase :
                          </p>
                          <ol className="list-decimal pl-4 space-y-1 text-sm">
                            <li>Allez dans Storage → Buckets</li>
                            <li>Cliquez sur "New bucket"</li>
                            <li>
                              Nom : <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">content</code>
                            </li>
                            <li>
                              Public bucket : <strong>Activé</strong>
                            </li>
                            <li>
                              File size limit : <strong>50 MB</strong>
                            </li>
                            <li>
                              Allowed MIME types :{" "}
                              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                                video/*, audio/*, application/pdf, image/*, text/*
                              </code>
                            </li>
                          </ol>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              {repairResult?.details && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Logs de réparation :</p>
                    <Badge variant="outline" className="font-mono">
                      {new Date().toLocaleString()}
                    </Badge>
                  </div>
                  <ScrollArea className="h-60 w-full rounded border p-2 font-mono text-xs">
                    {repairResult.details.split("\n").map((line, i) => (
                      <div
                        key={i}
                        className={`py-1 ${
                          line.includes("✅")
                            ? "text-green-600 dark:text-green-400"
                            : line.includes("❌")
                              ? "text-red-600 dark:text-red-400"
                              : ""
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {step === "idle" && (
          <>
            <Button onClick={handleRunMigrations} disabled={repairing} className="flex-1" variant="default">
              {repairing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrations...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Exécuter les migrations
                </>
              )}
            </Button>
            <Button onClick={handleRepairMissingTables} disabled={repairing} className="flex-1" variant="outline">
              {repairing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réparation...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Réparer les tables manquantes
                </>
              )}
            </Button>
          </>
        )}

        {step === "error" && (
          <>
            <Button onClick={handleRunMigrations} disabled={repairing} className="flex-1" variant="default">
              {repairing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrations...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Exécuter les migrations
                </>
              )}
            </Button>
            <Button onClick={handleRepairMissingTables} disabled={repairing} className="flex-1" variant="outline">
              {repairing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réparation...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Réparer les tables manquantes
                </>
              )}
            </Button>
          </>
        )}

        {step === "success" && (
          <div className="flex-1 text-center text-sm text-muted-foreground">✅ Base de données prête à l'emploi</div>
        )}

        {(step === "idle" || step === "success" || step === "error") && (
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={checking}>
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
