"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock, Play, BookOpen, Video, Headphones, Loader2 } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export function FavoritesSection() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [watchLater, setWatchLater] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavoritesData = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Récupérer l'utilisateur actuel (simulation)
        const userId = "current-user-id" // À remplacer par l'ID de l'utilisateur connecté

        // Récupérer les favoris
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("user_favorites")
          .select(`
            created_at,
            contents (
              id,
              title,
              type,
              duration,
              thumbnail_url,
              category
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(3)

        if (favoritesError) {
          // Erreur silencieuse - la table peut ne pas exister encore
        }

        // Récupérer les contenus "à voir plus tard"
        const { data: watchLaterData, error: watchLaterError } = await supabase
          .from("user_watch_later")
          .select(`
            created_at,
            contents (
              id,
              title,
              type,
              duration,
              thumbnail_url,
              category
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(2)

        if (watchLaterError) {
          // Erreur silencieuse - la table peut ne pas exister encore
        }

        // Formater les données des favoris
        const formattedFavorites =
          favoritesData?.map((item) => ({
            id: (item.contents as any).id,
            title: (item.contents as any).title,
            type: (item.contents as any).type,
            duration: formatDuration((item.contents as any).duration, (item.contents as any).type),
            thumbnail: (item.contents as any).thumbnail_url,
            category: (item.contents as any).category,
            addedAt: formatDate(item.created_at),
            progress: 0, // À récupérer depuis user_watch_history si nécessaire
          })) || []

        // Formater les données "à voir plus tard"
        const formattedWatchLater =
          watchLaterData?.map((item) => ({
            id: (item.contents as any).id,
            title: (item.contents as any).title,
            type: (item.contents as any).type,
            duration: formatDuration((item.contents as any).duration, (item.contents as any).type),
            thumbnail: (item.contents as any).thumbnail_url,
            category: (item.contents as any).category,
            addedAt: formatDate(item.created_at),
          })) || []

        setFavorites(formattedFavorites)
        setWatchLater(formattedWatchLater)
      } catch (error) {
        console.error("Error fetching favorites data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavoritesData()
  }, [])

  const formatDuration = (seconds: number, type: string): string => {
    if (type === "document") return "Document"
    if (!seconds) return "Durée inconnue"

    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}min`
    }
    return `${minutes} min`
  }

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "podcast":
        return <Headphones className="h-4 w-4" />
      case "document":
        return <BookOpen className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Contenus favoris */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <CardTitle>Mes favoris</CardTitle>
          </div>
          <CardDescription>Contenus que vous avez sauvegardés</CardDescription>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun contenu favori pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des contenus à vos favoris pour les retrouver facilement
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((content) => (
                <div key={content.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={content.thumbnail || "/placeholder.svg"}
                      alt={content.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">{content.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getTypeIcon(content.type)}
                      <span>{content.duration}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {content.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Ajouté {content.addedAt}</p>
                    {content.progress > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1">
                          <div className="bg-primary h-1 rounded-full" style={{ width: `${content.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{content.progress}%</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    {content.progress > 0 ? "Continuer" : "Commencer"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* À voir plus tard */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <CardTitle>À voir plus tard</CardTitle>
          </div>
          <CardDescription>Contenus que vous souhaitez consulter prochainement</CardDescription>
        </CardHeader>
        <CardContent>
          {watchLater.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun contenu en attente</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des contenus à votre liste "À voir plus tard"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {watchLater.map((content) => (
                <div key={content.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={content.thumbnail || "/placeholder.svg"}
                      alt={content.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">{content.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getTypeIcon(content.type)}
                      <span>{content.duration}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {content.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Ajouté {content.addedAt}</p>
                  </div>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Regarder
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
