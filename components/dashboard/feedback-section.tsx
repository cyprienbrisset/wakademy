"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Star, ThumbsUp, Loader2 } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface Comment {
  id: string
  contentTitle: string
  contentThumbnail: string
  comment: string
  createdAt: string
  likes: number
  replies: number
}

interface Rating {
  id: string
  contentTitle: string
  contentThumbnail: string
  rating: number
  review: string
  createdAt: string
}

interface FeedbackData {
  comments: Comment[]
  ratings: Rating[]
}

export function FeedbackSection() {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeedbackData() {
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

        // Récupérer les commentaires de l'utilisateur
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(`
            id,
            comment,
            created_at,
            likes_count,
            contents (
              id,
              title,
              thumbnail_url
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5)

        if (commentsError) {
          console.error("Erreur lors de la récupération des commentaires:", commentsError)
        }

        // Récupérer les évaluations de l'utilisateur
        const { data: ratingsData, error: ratingsError } = await supabase
          .from("ratings")
          .select(`
            id,
            rating,
            review,
            created_at,
            contents (
              id,
              title,
              thumbnail_url
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5)

        if (ratingsError) {
          console.error("Erreur lors de la récupération des évaluations:", ratingsError)
        }

        // Formater les commentaires
        const formattedComments: Comment[] = commentsData?.map(item => ({
          id: String(item.id),
          contentTitle: (item.contents as any)?.title || "Contenu supprimé",
          contentThumbnail: (item.contents as any)?.thumbnail_url || "/placeholder.svg",
          comment: String(item.comment),
          createdAt: formatDate(String(item.created_at)),
          likes: Number(item.likes_count) || 0,
          replies: 0 // Pour l'instant, pas de système de réponses
        })) || []

        // Formater les évaluations
        const formattedRatings: Rating[] = ratingsData?.map(item => ({
          id: String(item.id),
          contentTitle: (item.contents as any)?.title || "Contenu supprimé",
          contentThumbnail: (item.contents as any)?.thumbnail_url || "/placeholder.svg",
          rating: Number(item.rating),
          review: String(item.review || ""),
          createdAt: formatDate(String(item.created_at))
        })) || []

        setFeedbackData({
          comments: formattedComments,
          ratings: formattedRatings
        })

      } catch (error) {
        console.error("Erreur lors du chargement des données de feedback:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbackData()
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
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

  if (!feedbackData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Impossible de charger les données</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mes commentaires */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <CardTitle>Mes commentaires</CardTitle>
          </div>
          <CardDescription>Vos commentaires sur les contenus</CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackData.comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun commentaire pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Partagez vos impressions sur les contenus que vous consultez
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackData.comments.map((comment) => (
                <div key={comment.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={comment.contentThumbnail || "/placeholder.svg"}
                        alt={comment.contentTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{comment.contentTitle}</h4>
                      <p className="text-xs text-muted-foreground">{comment.createdAt}</p>
                    </div>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{comment.likes}</span>
                    </div>
                    {comment.replies > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>
                          {comment.replies} réponse{comment.replies > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mes évaluations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle>Mes évaluations</CardTitle>
          </div>
          <CardDescription>Vos notes et avis sur les contenus</CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackData.ratings.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune évaluation pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">Notez les contenus pour aider la communauté</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackData.ratings.map((rating) => (
                <div key={rating.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={rating.contentThumbnail || "/placeholder.svg"}
                        alt={rating.contentTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rating.contentTitle}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">{renderStars(rating.rating)}</div>
                        <span className="text-xs text-muted-foreground">{rating.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  {rating.review && <p className="text-sm">{rating.review}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
