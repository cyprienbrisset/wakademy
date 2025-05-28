"use client"

import type { Content } from "@/lib/content/content-service"

// Imports directs uniquement - pas d'imports dynamiques
import ContentPageHeaderWrapper from "@/components/content/content-page-header-wrapper"
import ContentHeader from "@/components/content/content-header"
import ContentActions from "@/components/content/content-actions"
import AISummary from "@/components/content/ai-summary"
import RelatedContent from "@/components/content/related-content"

interface ContentPageClientProps {
  content: Content & { id: string }
}

// Composant de lecteur vidéo simplifié
function SimpleVideoPlayer({ src, poster }: { src: string; poster?: string }) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video 
        controls 
        className="w-full h-full"
        poster={poster}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Votre navigateur ne supporte pas l'élément vidéo.
      </video>
    </div>
  )
}

// Composant de lecteur audio simplifié
function SimpleAudioPlayer({ src, title, artist }: { src: string; title: string; artist: string }) {
  return (
    <div className="bg-card rounded-lg p-6 border">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{artist}</p>
        </div>
      </div>
      
      <audio 
        controls 
        className="w-full"
        preload="metadata"
      >
        <source src={src} type="audio/mpeg" />
        <source src={src} type="audio/wav" />
        Votre navigateur ne supporte pas l'élément audio.
      </audio>
    </div>
  )
}

// Composant de visualiseur de documents simplifié
function SimpleDocumentViewer({ src }: { src: string }) {
  return (
    <div className="bg-card rounded-lg p-6 border text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      </div>
      
      <h3 className="font-semibold mb-2">Document</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Cliquez pour ouvrir le document
      </p>
      
      <a 
        href={src} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
        Ouvrir le document
      </a>
    </div>
  )
}

// Composant de lecteur externe simplifié
function SimpleExternalPlayer({ content }: { content: Content }) {
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
    return <SimpleAudioPlayer src={content.file_url} title={content.title} artist={content.author || "Wakademy"} />
  }

  // Lecteur vidéo direct pour les fichiers vidéo
  if (isVideoFile(content.file_url)) {
    return <SimpleVideoPlayer src={content.file_url} poster={content.thumbnailUrl} />
  }

  // Fallback pour les autres types de contenu
  return (
    <div className="bg-card rounded-lg p-6 border text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      </div>
      
      <h3 className="font-semibold mb-2">{content.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Contenu externe disponible sur TopCream
      </p>
      
      <a 
        href={content.file_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
        Accéder au contenu
      </a>
    </div>
  )
}

export default function ContentPageClient({ content }: ContentPageClientProps) {
  return (
    <div className="space-y-8">
      <ContentPageHeaderWrapper content={content} />
      
      <ContentHeader content={content} />

      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        {/* Prioriser le lecteur externe pour les contenus TopCream */}
        {content.is_topcream_content && content.file_url ? (
          <SimpleExternalPlayer content={content} />
        ) : (
          <>
            {content.type === "video" && content.url && (
              <SimpleVideoPlayer src={content.url} poster={content.thumbnailUrl} />
            )}
            {content.type === "podcast" && (
              <div className="p-4">
                {content.url && content.url.trim() !== "" ? (
                  <SimpleAudioPlayer
                    src={content.url}
                    title={content.title}
                    artist={content.author || "Wakademy"}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      <strong>Audio non disponible</strong>
                      <br />
                      L'URL du fichier audio est manquante pour ce podcast.
                    </p>
                  </div>
                )}
              </div>
            )}
            {content.type === "document" && content.url && (
              <SimpleDocumentViewer src={content.url} />
            )}
          </>
        )}
      </div>

      <ContentActions content={content} />

      <AISummary content={content} />

      <RelatedContent contentId={content.id} />
    </div>
  )
} 