"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { VideoPlayer } from "./video-player"
import { PodcastPlayer } from "./podcast-player"
import { DocumentViewer } from "./document-viewer"
import { Button } from "@/components/ui/button"

interface Content {
  id: string
  title: string
  thumbnail: string
  type: "video" | "podcast" | "document"
}

interface ContentModalProps {
  content: Content
  onClose: () => void
}

export function ContentModal({ content, onClose }: ContentModalProps) {
  const [isLoading, setIsLoading] = useState(true)

  // This would fetch the full content details from the API
  const contentDetails = {
    ...content,
    description: "Description du contenu qui serait chargée depuis l'API.",
    url:
      content.type === "video"
        ? "https://example.com/video.mp4"
        : content.type === "podcast"
          ? "https://example.com/podcast.mp3"
          : "https://example.com/document.pdf",
    duration: content.type === "document" ? "15 pages" : "45 minutes",
    author: "Nom de l'auteur",
    publishedAt: "2023-05-15",
    summary:
      "Résumé généré par IA qui serait chargé depuis l'API. Ce résumé donne un aperçu concis du contenu pour aider l'utilisateur à décider s'il souhaite le consulter en entier.",
  }

  const renderContentPlayer = () => {
    switch (content.type) {
      case "video":
        return <VideoPlayer url={contentDetails.url} onLoadComplete={() => setIsLoading(false)} />
      case "podcast":
        return <PodcastPlayer url={contentDetails.url} onLoadComplete={() => setIsLoading(false)} />
      case "document":
        return <DocumentViewer url={contentDetails.url} onLoadComplete={() => setIsLoading(false)} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-card rounded-lg shadow-lg">
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>

        <div className="p-6">
          <div className="mb-6">{renderContentPlayer()}</div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{contentDetails.title}</h2>

            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>{contentDetails.author}</span>
              <span>•</span>
              <span>{contentDetails.duration}</span>
              <span>•</span>
              <span>{new Date(contentDetails.publishedAt).toLocaleDateString("fr-FR")}</span>
            </div>

            <p className="text-muted-foreground">{contentDetails.description}</p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Résumé IA</h3>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm">{contentDetails.summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
