"use client"

import { useCallback } from "react"
import AudioPlayer from "./audio-player"
import { saveContentProgress } from "@/lib/content/progress-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AudioPlayerWrapperProps {
  src: string
  title: string
  artist: string
  coverArt?: string
  contentId: string
}

export default function AudioPlayerWrapper({
  src,
  title,
  artist,
  coverArt,
  contentId,
}: AudioPlayerWrapperProps) {
  const invalidSrc = !src || src.trim() === ""

  // Fonction côté client pour sauvegarder la progression
  const handleProgress = useCallback(
    async (time: number, duration: number) => {
      try {
        await saveContentProgress({
          content_id: contentId,
          current_position: time,
          duration: duration,
          is_completed: time >= duration * 0.95,
        })
      } catch (error) {
        console.error("Error saving progress:", error)
      }
    },
    [contentId]
  )

  // Fonction côté client pour marquer comme terminé
  const handleComplete = useCallback(async () => {
    try {
      await saveContentProgress({
        content_id: contentId,
        current_position: 0,
        duration: 0,
        is_completed: true,
      })
    } catch (error) {
      console.error("Error marking as completed:", error)
    }
  }, [contentId])

  // Vérifier si l'URL est valide
  if (invalidSrc) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Audio non disponible</strong>
          <br />
          L'URL du fichier audio est manquante ou invalide pour ce contenu.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <AudioPlayer
      src={src}
      title={title}
      artist={artist}
      coverArt={coverArt}
      contentId={contentId}
      onProgress={handleProgress}
      onComplete={handleComplete}
    />
  )
}
