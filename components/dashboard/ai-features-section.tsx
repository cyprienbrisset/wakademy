"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Headphones, FileText, BookOpen, Brain, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AIContent {
  id: string
  contentTitle: string
  type: 'summary' | 'podcast' | 'notes'
  content: string
  createdAt: string
  duration?: string
  isRecent?: boolean
}

interface AIFeaturesData {
  summaries: AIContent[]
  podcasts: AIContent[]
  notes: AIContent[]
}

export function AIFeaturesSection() {
  const [aiData, setAiData] = useState<AIFeaturesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAIData() {
      try {
        setLoading(true)
        const supabase = createClient()
        
        // Récupérer l'utilisateur actuel depuis localStorage
        const adminData = localStorage.getItem("wakademy_admin")
        if (!adminData) {
          setLoading(false)
          return
        }
        
        const user = JSON.parse(adminData)
        const userId = user.id

        // Récupérer les contenus IA générés pour l'utilisateur
        const { data: aiContents, error: aiError } = await supabase
          .from("content_ai_jobs")
          .select(`
            id,
            job_type,
            result,
            created_at,
            status,
            contents (
              id,
              title,
              duration
            )
          `)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(10)

        if (aiError) {
          console.error("Erreur lors de la récupération des contenus IA:", aiError)
        }

        // Séparer les contenus par type
        const summaries: AIContent[] = []
        const podcasts: AIContent[] = []
        const notes: AIContent[] = []

        aiContents?.forEach(item => {
          const baseContent = {
            id: String(item.id),
            contentTitle: (item.contents as any)?.title || "Contenu supprimé",
            createdAt: formatDate(String(item.created_at)),
            content: String(item.result || ""),
            isRecent: isRecent(String(item.created_at))
          }

          switch (item.job_type) {
            case 'summary':
              summaries.push({
                ...baseContent,
                type: 'summary'
              })
              break
            case 'podcast':
              podcasts.push({
                ...baseContent,
                type: 'podcast',
                duration: formatDuration((item.contents as any)?.duration)
              })
              break
            case 'notes':
              notes.push({
                ...baseContent,
                type: 'notes'
              })
              break
          }
        })

        setAiData({
          summaries: summaries.slice(0, 3),
          podcasts: podcasts.slice(0, 3),
          notes: notes.slice(0, 3)
        })

      } catch (error) {
        console.error("Erreur lors du chargement des données IA:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAIData()
  }, [])

  const formatDate = (dateString: string): string => {
    if (!dateString) return ""
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`
    if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`
    }
    const diffMonths = Math.floor(diffDays / 30)
    return `Il y a ${diffMonths} mois`
  }

  const isRecent = (dateString: string): boolean => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return diffDays <= 1
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "Durée inconnue"
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!aiData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Impossible de charger les données IA</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />🧠 Bonus IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="summary">
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">
              Résumés
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="flex-1">
              Podcasts
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex-1">
              Mémos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4 space-y-4">
            {aiData.summaries.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/50 flex flex-col items-center justify-center p-6">
                <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium text-center">Aucun résumé disponible</h3>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
                  L'IA peut générer des résumés automatiques de vos contenus
                </p>
                <Button>
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Générer des résumés
                </Button>
              </div>
            ) : (
              aiData.summaries.map((summary) => (
                <div key={summary.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Résumé IA
                    </Badge>
                    {summary.isRecent && <Badge variant="secondary">Récent</Badge>}
                  </div>

                  <h3 className="font-medium">{summary.contentTitle}</h3>

                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>{truncateContent(summary.content)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">Généré {summary.createdAt}</span>
                    <Button size="sm" variant="outline">
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Voir le contenu complet
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="podcasts" className="mt-4 space-y-4">
            {aiData.podcasts.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/50 flex flex-col items-center justify-center p-6">
                <Headphones className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium text-center">Aucun podcast disponible</h3>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
                  L'IA peut convertir vos contenus en podcasts audio
                </p>
                <Button>
                  <Headphones className="h-3.5 w-3.5 mr-1" />
                  Générer des podcasts
                </Button>
              </div>
            ) : (
              aiData.podcasts.map((podcast) => (
                <div key={podcast.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Headphones className="h-3 w-3" />
                      Podcast auto-généré
                    </Badge>
                    {podcast.isRecent && <Badge variant="secondary">Nouveau</Badge>}
                  </div>

                  <h3 className="font-medium">{podcast.contentTitle} (Audio)</h3>

                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Version audio du contenu "{podcast.contentTitle}", parfaite pour l'écoute en déplacement.</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">Durée: {podcast.duration}</span>
                    <Button size="sm">
                      <Headphones className="h-3.5 w-3.5 mr-1" />
                      Écouter
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4 space-y-4">
            {aiData.notes.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/50 flex flex-col items-center justify-center p-6">
                <Brain className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-medium text-center">Aucun mémo disponible</h3>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
                  L'IA peut créer des mémos synthétiques pour tous vos contenus consultés
                </p>
                <Button>
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Générer des mémos
                </Button>
              </div>
            ) : (
              <>
                {aiData.notes.map((note) => (
                  <div key={note.id} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        Mémo IA
                      </Badge>
                      {note.isRecent && <Badge variant="secondary">Récent</Badge>}
                    </div>

                    <h3 className="font-medium">Notes: {note.contentTitle}</h3>

                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>{truncateContent(note.content)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">Généré {note.createdAt}</span>
                      <Button size="sm" variant="outline">
                        <BookOpen className="h-3.5 w-3.5 mr-1" />
                        Exporter les notes
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="rounded-lg border border-dashed bg-muted/50 flex flex-col items-center justify-center p-6">
                  <Brain className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-center">Générer plus de mémos</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
                    L'IA peut créer des mémos synthétiques pour tous vos contenus consultés
                  </p>
                  <Button>
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Générer des mémos
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
