"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Content } from "@/lib/content/content-service"

interface RelatedContentProps {
  contentId: string
  category?: string
}

// Données fictives pour les tests et en cas d'erreur
const fallbackContent: Content[] = [
  {
    id: "fallback-1",
    title: "Leadership et management",
    description: "Apprenez les principes fondamentaux du leadership moderne",
    type: "video",
    url: "",
    thumbnailUrl: "/placeholder.svg?height=128&width=256&query=leadership",
    author: "Marie Dupont",
    duration: 1800,
    category: "Leadership",
    topics: ["Management", "Communication"],
    createdAt: new Date().toISOString(),
    views: 1250,
  },
  {
    id: "fallback-2",
    title: "Stratégies de négociation",
    description: "Techniques avancées pour réussir vos négociations professionnelles",
    type: "podcast",
    url: "",
    thumbnailUrl: "/placeholder.svg?height=128&width=256&query=negotiation",
    author: "Jean Martin",
    duration: 2400,
    category: "Business",
    topics: ["Négociation", "Communication"],
    createdAt: new Date().toISOString(),
    views: 980,
  },
  {
    id: "fallback-3",
    title: "Intelligence émotionnelle au travail",
    description: "Développez votre intelligence émotionnelle pour améliorer vos relations professionnelles",
    type: "document",
    url: "",
    thumbnailUrl: "/placeholder.svg?height=128&width=256&query=emotional+intelligence",
    author: "Sophie Leclerc",
    duration: 1200,
    category: "Développement personnel",
    topics: ["Soft Skills", "Communication"],
    createdAt: new Date().toISOString(),
    views: 1560,
  },
]

export default function RelatedContent({ contentId, category }: RelatedContentProps) {
  const [relatedContent, setRelatedContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchRelatedContent = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Fetching related content for ID: ${contentId}, Category: ${category || "not specified"}`)

      // Ajouter un timestamp pour éviter la mise en cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/related-content?id=${contentId}&category=${category || ""}&_=${timestamp}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`)
        // Ne pas lancer d'erreur, utiliser les données de secours
        setRelatedContent(fallbackContent)
        return
      }

      const data = await response.json()
      console.log(`Received ${data.length} related content items`)

      if (Array.isArray(data) && data.length > 0) {
        setRelatedContent(data)
      } else {
        console.log("No related content found, using fallback data")
        // Utiliser des données fictives si aucun contenu n'est trouvé
        setRelatedContent(fallbackContent)
      }
    } catch (err) {
      console.error("Error fetching related content:", err)
      // Utiliser des données fictives en cas d'erreur
      setRelatedContent(fallbackContent)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelatedContent()
  }, [contentId, category, retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Contenu similaire</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card animate-pulse h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Contenu similaire</h3>
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={handleRetry} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              <span>Réessayer</span>
            </Button>
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedContent.map((item) => (
            <RelatedContentCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    )
  }

  if (relatedContent.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Contenu similaire</h3>
        <p className="text-muted-foreground">Aucun contenu similaire trouvé.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium">Contenu similaire</h3>
        <Button variant="link" size="sm" className="flex items-center gap-1">
          <span>Voir tout</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedContent.map((item) => (
          <RelatedContentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

// Composant de carte pour le contenu similaire
function RelatedContentCard({ item }: { item: Content }) {
  return (
    <Link
      href={`/content/${item.id}`}
      className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-32">
        <Image
          src={item.thumbnailUrl || "/placeholder.svg?height=128&width=256&query=thumbnail"}
          alt={item.title}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tl-md">
          {Math.floor(item.duration / 60)} min
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-medium overflow-hidden text-ellipsis" style={{
          height: '2.4em',
          lineHeight: '1.2em'
        }}>{item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title}</h4>
        <p className="text-xs text-muted-foreground mt-1">{item.author}</p>
      </div>
    </Link>
  )
}
