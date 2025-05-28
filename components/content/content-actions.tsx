"use client"

import { useState } from "react"
import { Bookmark, CheckCircle, MessageSquare, ThumbsUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Content } from "@/lib/content/content-service"

interface ContentActionsProps {
  content: Content
}

export default function ContentActions({ content }: ContentActionsProps) {
  const [isFavorite, setIsFavorite] = useState(content.isFavorite || false)
  const [isCompleted, setIsCompleted] = useState(content.isCompleted || false)
  const [likes, setLikes] = useState(0)

  const handleToggleFavorite = async () => {
    try {
      // Ici, vous pourriez appeler une API pour enregistrer le favori
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleMarkAsCompleted = async () => {
    try {
      // Ici, vous pourriez appeler une API pour marquer comme terminé
      setIsCompleted(!isCompleted)
    } catch (error) {
      console.error("Error marking as completed:", error)
    }
  }

  const handleLike = () => {
    setLikes(likes + 1)
  }

  const handleDownload = () => {
    // Logique pour télécharger le contenu
    window.open(content.url, "_blank")
  }

  return (
    <div className="flex flex-wrap gap-2 justify-between items-center p-4 bg-card rounded-lg shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-1"
          onClick={handleToggleFavorite}
        >
          <Bookmark className="h-4 w-4" />
          <span>{isFavorite ? "Favori" : "Ajouter aux favoris"}</span>
        </Button>

        <Button
          variant={isCompleted ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-1"
          onClick={handleMarkAsCompleted}
        >
          <CheckCircle className="h-4 w-4" />
          <span>{isCompleted ? "Terminé" : "Marquer comme terminé"}</span>
        </Button>

        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleLike}>
          <ThumbsUp className="h-4 w-4" />
          <span>{likes > 0 ? `${likes} J'aime` : "J'aime"}</span>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>Commenter</span>
        </Button>

        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          <span>Télécharger</span>
        </Button>
      </div>
    </div>
  )
}
