"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Headphones, FileText, Heart, BookmarkPlus, Share2 } from "lucide-react"

interface Content {
  id: string
  title: string
  description: string
  type: string
  author: string
  duration: string
  category: string
  createdAt: string
  views: number
  thumbnailUrl: string
}

interface ContentListItemProps {
  content: Content
}

export function ContentListItem({ content }: ContentListItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Vérification de sécurité robuste pour tous les cas d'usage
  if (!content || typeof content !== 'object' || !content.id) {
    return null
  }

  // Normalisation des données pour gérer les différents formats d'API
  const safeContent = {
    id: String(content.id || ''),
    title: String(content.title || 'Titre non disponible'),
    description: String(content.description || 'Description non disponible'),
    type: String(content.type || 'document'),
    author: String(content.author || 'Auteur inconnu'),
    duration: String(content.duration || '0 min'),
    category: String(content.category || 'Non catégorisé'),
    // Gérer les deux formats possibles de date
    createdAt: String(content.createdAt || (content as any).created_at || new Date().toISOString()),
    views: typeof content.views === 'number' ? content.views : 0,
    // Gérer les deux formats possibles de thumbnail
    thumbnailUrl: String(content.thumbnailUrl || (content as any).thumbnail || '/placeholder.svg')
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />
      case "podcast":
        return <Headphones className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  const getActionButton = (type: string) => {
    switch (type) {
      case "video":
        return (
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Regarder
          </Button>
        )
      case "podcast":
        return (
          <Button size="sm">
            <Headphones className="h-4 w-4 mr-2" />
            Écouter
          </Button>
        )
      case "document":
        return (
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Lire
          </Button>
        )
      default:
        return (
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Voir
          </Button>
        )
    }
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

  const shareContent = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Share functionality would go here
  }

  // Formater la durée en minutes/heures
  const formatDuration = (durationStr: string) => {
    // L'API retourne déjà la durée formatée
    return durationStr || "Document"
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg border-muted-foreground/10 bg-card/50 hover:bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative aspect-video sm:w-48 rounded-md overflow-hidden">
            <Image 
              src={safeContent.thumbnailUrl} 
              alt={safeContent.title} 
              fill 
              className="object-cover" 
            />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getContentIcon(safeContent.type)}
                  <span className="capitalize">{safeContent.type}</span>
                </Badge>
                <span className="text-xs text-muted-foreground">{formatDuration(safeContent.duration)}</span>
              </div>

              <h3 className="font-medium">{safeContent.title}</h3>

              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {safeContent.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {safeContent.views} vues
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-2 overflow-hidden text-ellipsis" style={{
                height: '2.4em',
                lineHeight: '1.2em'
              }}>{safeContent.description && safeContent.description.length > 80 ? safeContent.description.substring(0, 80) + '...' : safeContent.description}</p>
              <p className="text-xs text-muted-foreground mt-1">Par {safeContent.author}</p>
            </div>

            <div className="flex items-center gap-2 mt-4">
              {getActionButton(safeContent.type)}

              <Button
                size="icon"
                variant="secondary"
                className={`h-8 w-8 ${isFavorite ? "text-red-500" : "text-muted-foreground"}`}
                onClick={toggleFavorite}
              >
                <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                className={`h-8 w-8 ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
                onClick={toggleBookmark}
              >
                <BookmarkPlus className="h-4 w-4" />
              </Button>

              <Button size="icon" variant="secondary" className="h-8 w-8" onClick={shareContent}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
