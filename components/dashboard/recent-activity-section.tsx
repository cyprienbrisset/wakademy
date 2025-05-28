"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Play, Award, Clock, Loader2, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RecentActivitySectionProps {
  userData: any
  userActivity: any
}

export function RecentActivitySection({ userData, userActivity }: RecentActivitySectionProps) {
  const [recentContents, setRecentContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentContents = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!userData || !userData.id) {
          setLoading(false)
          return
        }

        const supabase = createClient()

        // Vérifier si la table contents existe
        const { data: contentsData, error: contentsError } = await supabase.from("contents").select("id").limit(1)

        if (contentsError) {
          setError("La table 'contents' n'existe pas encore. Veuillez initialiser la base de données.")
          setLoading(false)
          return
        }

        try {
          // Essayer de récupérer les données de l'historique
          const { data: historyData, error: historyError } = await supabase
            .from("user_watch_history")
            .select("content_id, completed, progress, last_watched_at")
            .eq("user_id", userData.id)
            .order("last_watched_at", { ascending: false })
            .limit(3)

          if (historyError) {
            // Si l'erreur est que la table n'existe pas
            if (historyError.message.includes("does not exist")) {
              // Essayer de créer automatiquement la table
              try {
                const createResponse = await fetch('/api/setup/create-watch-history', {
                  method: 'POST'
                })

                if (createResponse.ok) {
                  const createResult = await createResponse.json()
                  if (createResult.success) {
                    // Table créée avec succès, réessayer la requête
                    const { data: retryHistoryData, error: retryError } = await supabase
                      .from("user_watch_history")
                      .select("content_id, completed, progress, last_watched_at")
                      .eq("user_id", userData.id)
                      .order("last_watched_at", { ascending: false })
                      .limit(3)

                    if (!retryError && retryHistoryData) {
                      // Traiter les données normalement
                      const contentIds = retryHistoryData.map((item) => item.content_id)
                      const { data: contentsDetailData } = await supabase
                        .from("contents")
                        .select("id, title, type, duration")
                        .in("id", contentIds)

                      if (contentsDetailData) {
                        const formattedContents = retryHistoryData
                          .map((historyItem) => {
                            const content = contentsDetailData.find((c) => c.id === historyItem.content_id)
                            if (!content) return null

                            return {
                              id: content.id,
                              title: content.title,
                              type: content.type,
                              status: historyItem.completed ? "completed" : "in-progress",
                              progress: historyItem.progress || 0,
                              timestamp: formatDate(historyItem.last_watched_at),
                              duration: formatDuration(content.duration, content.type),
                            }
                          })
                          .filter(Boolean)

                        setRecentContents(formattedContents)
                        setLoading(false)
                        return
                      }
                    }
                  }
                }
              } catch (createError) {
                // Ignorer l'erreur de création et continuer avec le fallback
              }

              // Récupérer quelques contenus récents à afficher en attendant
              const { data: fallbackContents } = await supabase
                .from("contents")
                .select("id, title, type, duration")
                .order("created_at", { ascending: false })
                .limit(3)

              if (fallbackContents && fallbackContents.length > 0) {
                const formattedFallback = fallbackContents.map((content) => ({
                  id: content.id,
                  title: content.title,
                  type: content.type,
                  status: "not-started",
                  progress: 0,
                  timestamp: "Non consulté",
                  duration: formatDuration(content.duration, content.type),
                }))
                setRecentContents(formattedFallback)
              } else {
                setRecentContents([])
              }

              setLoading(false)
              return
            } else {
              // Autre erreur
              setError(`Erreur lors de la récupération de l'historique: ${historyError.message}`)
              setLoading(false)
              return
            }
          }

          if (!historyData || historyData.length === 0) {
            // Récupérer quelques contenus récents si l'historique est vide
            const { data: fallbackContents } = await supabase
              .from("contents")
              .select("id, title, type, duration")
              .order("created_at", { ascending: false })
              .limit(3)

            if (fallbackContents && fallbackContents.length > 0) {
              const formattedFallback = fallbackContents.map((content) => ({
                id: content.id,
                title: content.title,
                type: content.type,
                status: "not-started",
                progress: 0,
                timestamp: "Non consulté",
                duration: formatDuration(content.duration, content.type),
              }))
              setRecentContents(formattedFallback)
            } else {
              setRecentContents([])
            }

            setLoading(false)
            return
          }

          // Récupérer les détails des contenus
          const contentIds = historyData.map((item) => item.content_id)
          const { data: contentsDetailData, error: contentsDetailError } = await supabase
            .from("contents")
            .select("id, title, type, duration")
            .in("id", contentIds)

          if (contentsDetailError) {
            setError(`Erreur lors de la récupération des détails des contenus: ${contentsDetailError.message}`)
            setLoading(false)
            return
          }

          // Combiner les données
          const formattedContents = historyData
            .map((historyItem) => {
              const content = contentsDetailData.find((c) => c.id === historyItem.content_id)
              if (!content) return null

              return {
                id: content.id,
                title: content.title,
                type: content.type,
                status: historyItem.completed ? "completed" : "in-progress",
                progress: historyItem.progress || 0,
                timestamp: formatDate(historyItem.last_watched_at),
                duration: formatDuration(content.duration, content.type),
              }
            })
            .filter(Boolean)

          setRecentContents(formattedContents)
        } catch (error: any) {
          setError(`Une erreur est survenue: ${error.message}`)
        }
      } catch (error: any) {
        setError(`Une erreur est survenue: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentContents()
  }, [userData])

  // Fonction utilitaire pour formater les dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        if (diffMs < 1000 * 60 * 60) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60))
          return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`
        }
        return "Aujourd'hui"
      } else if (diffDays === 1) {
        return "Hier"
      } else if (diffDays < 7) {
        return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`
      } else if (diffDays < 30) {
        const diffWeeks = Math.floor(diffDays / 7)
        return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`
      } else {
        const diffMonths = Math.floor(diffDays / 30)
        return `Il y a ${diffMonths} mois`
      }
    } catch (error) {
      return "Date inconnue"
    }
  }

  // Fonction utilitaire pour formater la durée
  const formatDuration = (seconds: number, type: string): string => {
    if (type === "document") return "Document"
    if (!seconds || seconds === 0) return "Durée inconnue"

    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Dernière connexion</p>
              <p className="text-sm text-muted-foreground">{userActivity?.lastLogin || "Aujourd'hui, 14:30"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Dernier badge obtenu</p>
              <p className="text-sm text-muted-foreground">
                {userActivity?.lastBadge?.title || "Aucun badge"} • {userActivity?.lastBadge?.earnedAt || ""}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Derniers contenus consultés</h3>

          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentContents.length > 0 ? (
            <div className="space-y-4">
              {recentContents.map((content) => (
                <div
                  key={content.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {content.type}
                      </Badge>
                      <Badge
                        variant={
                          content.status === "completed"
                            ? "default"
                            : content.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {content.status === "completed"
                          ? "Terminé"
                          : content.status === "in-progress"
                            ? "En cours"
                            : "Non commencé"}
                      </Badge>
                    </div>

                    <h4 className="font-medium">{content.title}</h4>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{content.timestamp}</span>
                      <span>•</span>
                      <span>{content.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {content.status === "in-progress" && (
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progression</span>
                          <span>{content.progress}%</span>
                        </div>
                        <Progress value={content.progress} className="h-1.5" />
                      </div>
                    )}

                    <Button size="sm" variant={content.status === "completed" ? "outline" : "default"}>
                      <Play className="h-3.5 w-3.5 mr-1" />
                      {content.status === "completed"
                        ? "Revoir"
                        : content.status === "in-progress"
                          ? "Continuer"
                          : "Commencer"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[100px] border rounded-lg">
              <p className="text-muted-foreground">Aucun contenu consulté récemment</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
