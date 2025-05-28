"use client"

import { useState } from "react"
import { Play, ExternalLink, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Content } from "@/lib/content/content-service"

interface ExternalMediaPlayerProps {
  content: Content
}

export default function ExternalMediaPlayer({ content }: ExternalMediaPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Vérifier si c'est un contenu externe (TopCream)
  if (!content.is_topcream_content || !content.file_url) {
    return null
  }

  const isEmbeddable = (url: string) => {
    return url.includes('dailymotion.com/embed') || 
           url.includes('youtube.com/embed') || 
           url.includes('vimeo.com/player')
  }

  const isAudioFile = (url: string) => {
    return url.includes('.mp3') || 
           url.includes('.wav') || 
           url.includes('.m4a') ||
           content.type === 'podcast'
  }

  const isVideoFile = (url: string) => {
    return url.includes('.mp4') || 
           url.includes('.webm') || 
           url.includes('.mov') ||
           content.type === 'video'
  }

  const handleExternalLink = () => {
    window.open(content.file_url, '_blank', 'noopener,noreferrer')
  }

  // Lecteur intégré pour les plateformes supportées
  if (isEmbeddable(content.file_url)) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={content.file_url}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={content.title}
        />
      </div>
    )
  }

  // Lecteur audio direct pour les fichiers audio
  if (isAudioFile(content.file_url)) {
    return (
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Volume2 className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{content.title}</h3>
            <p className="text-sm text-muted-foreground">{content.author}</p>
          </div>
        </div>
        
        <audio 
          controls 
          className="w-full"
          preload="metadata"
        >
          <source src={content.file_url} type="audio/mpeg" />
          Votre navigateur ne supporte pas l'élément audio.
        </audio>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Source: TopCream
          </span>
          <Button variant="outline" size="sm" onClick={handleExternalLink}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir dans un nouvel onglet
          </Button>
        </div>
      </div>
    )
  }

  // Lecteur vidéo direct pour les fichiers vidéo
  if (isVideoFile(content.file_url)) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video 
          controls 
          className="w-full h-full"
          poster={content.thumbnailUrl}
          preload="metadata"
        >
          <source src={content.file_url} type="video/mp4" />
          Votre navigateur ne supporte pas l'élément vidéo.
        </video>
        
        <div className="absolute bottom-4 right-4">
          <Button variant="secondary" size="sm" onClick={handleExternalLink}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Lien direct
          </Button>
        </div>
      </div>
    )
  }

  // Fallback pour les autres types de contenu
  return (
    <div className="bg-card rounded-lg p-6 border text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Play className="h-8 w-8 text-white" />
      </div>
      
      <h3 className="font-semibold mb-2">{content.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Contenu externe disponible sur TopCream
      </p>
      
      <Button onClick={handleExternalLink} className="w-full">
        <ExternalLink className="h-4 w-4 mr-2" />
        Accéder au contenu
      </Button>
    </div>
  )
} 