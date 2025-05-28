"use client"

import { useState } from "react"
import { Share2, Clock, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import TopCreamBadge from "@/components/content/topcream-badge"
import type { Content } from "@/lib/content/content-service"

interface ContentHeaderProps {
  content: Content
}

export default function ContentHeader({ content }: ContentHeaderProps) {
  const [copied, setCopied] = useState(false)

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) {
      return "0 min"
    }

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
  }

  const formatDate = (dateString: string | null | undefined) => {
    // Vérifier si la date est valide
    if (!dateString) {
      return "Date inconnue"
    }

    try {
      const date = new Date(dateString)

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn("Date invalide:", dateString)
        return "Date inconnue"
      }

      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error)
      return "Date inconnue"
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  // Ajouter des logs pour déboguer
  console.log("Content dans ContentHeader:", content)
  console.log("Date brute:", content.createdAt)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{content.title || "Sans titre"}</h1>
        <TopCreamBadge content={content} />
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(content.duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(content.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-4 w-4" />
          <span>{content.author || "Auteur inconnu"}</span>
        </div>
      </div>

      <p className="text-muted-foreground">{content.description || "Aucune description disponible"}</p>

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {content.topics && Array.isArray(content.topics) && content.topics.length > 0 ? (
            content.topics.map((topic, i) => (
              <span key={i} className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
                {topic}
              </span>
            ))
          ) : (
            <span className="px-2.5 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
              Non catégorisé
            </span>
          )}
        </div>

        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          <span>{copied ? "Copié!" : "Partager"}</span>
        </Button>
      </div>
    </div>
  )
}
