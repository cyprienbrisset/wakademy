"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Play, Headphones, FileText, TrendingUp, Clock, Loader2, AlertCircle } from "lucide-react"
import type { Content } from "@/lib/content/content-service"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ContentCache } from "@/lib/performance/cache"
import { preloader } from "@/lib/performance/preloader"

export function TrendingSection() {
  const [activeTab, setActiveTab] = useState("trending")
  const [trendingContent, setTrendingContent] = useState<Content[]>([])
  const [podcastContent, setPodcastContent] = useState<Content[]>([])
  const [newContent, setNewContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction optimisée pour récupérer les données avec cache
  const fetchContentWithCache = async (type: string) => {
    try {
      const data = await ContentCache.getTrendingContent(type, 10)
      return data.data || []
    } catch (error) {
      console.error(`Error fetching ${type} content:`, error)
      throw error
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Récupérer les données en parallèle avec cache
        const [trending, podcasts, newData] = await Promise.all([
          fetchContentWithCache('trending'),
          fetchContentWithCache('podcasts'),
          fetchContentWithCache('new')
        ])

        setTrendingContent(trending)
        setPodcastContent(podcasts)
        setNewContent(newData)

        // Précharger les images des contenus visibles
        const allContent = [...trending, ...podcasts, ...newData]
        const imageUrls = allContent
          .slice(0, 8) // Précharger seulement les 8 premières images
          .map(content => content.thumbnailUrl)
          .filter(url => url && !url.includes('placeholder.svg'))
        
        preloader.preloadImages(imageUrls)

      } catch (error) {
        console.error("Error fetching content data:", error)
        setError(
          error instanceof Error ? error.message : "Impossible de charger les contenus. Veuillez réessayer plus tard.",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Précharger les contenus liés quand l'utilisateur change d'onglet
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Précharger les contenus liés selon l'onglet sélectionné
    if (value === 'trending') {
      preloader.addToQueue([
        { url: '/api/library?type=trending&limit=10', config: { priority: 'medium', delay: 500 } }
      ])
    } else if (value === 'podcasts') {
      preloader.addToQueue([
        { url: '/api/library?type=podcasts&limit=10', config: { priority: 'medium', delay: 500 } }
      ])
    }
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

  const formatDuration = (duration: string | number, type: string) => {
    if (type === "document") return "Document"
    if (!duration) return "N/A"
    
    // Si c'est déjà formaté (string), le retourner tel quel
    if (typeof duration === 'string') return duration
    
    // Sinon, formater le nombre
    const minutes = Math.floor(duration / 60)
    return `${minutes} min`
  }

  const renderContentGrid = (contents: Content[]) => {
    if (loading) {
      return (
        <div className="col-span-full flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="col-span-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex flex-col items-center justify-center h-[150px]">
            <p className="text-muted-foreground text-center">
              Impossible de charger les contenus en ce moment.
              <br />
              Veuillez vérifier la structure de la base de données ou réessayer plus tard.
            </p>
          </div>
        </div>
      )
    }

    if (contents.length === 0) {
      return (
        <div className="col-span-full flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">Aucun contenu disponible</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {contents.map((content) => (
          <div key={content.id} className="group relative overflow-hidden rounded-lg">
            <div className="aspect-video relative">
              <Image
                src={content.thumbnailUrl || "/placeholder.svg?height=200&width=350&query=content"}
                alt={content.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="flex items-center gap-1 bg-black/60 text-white border-none">
                  {activeTab === "trending" ? (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      {content.views} vues
                    </>
                  ) : activeTab === "podcasts" ? (
                    <>
                      <Headphones className="h-3 w-3" />
                      Podcast
                    </>
                  ) : (
                    <>Nouveau</>
                  )}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">{content.title}</h3>
                <div className="flex items-center text-xs mt-1">
                  <Badge variant="outline" className="flex items-center gap-1 text-white border-white/30 mr-2">
                    {getContentIcon(content.type)}
                    <span className="capitalize">{content.type}</span>
                  </Badge>
                  <span>{formatDuration(content.duration, content.type)}</span>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">{content.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{content.author}</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Link 
                href={`/content/${content.id}`}
                onMouseEnter={() => {
                  // Précharger le contenu au survol
                  preloader.preloadRelatedContent(content.id, content.category)
                }}
              >
                <Button size="sm" className="bg-primary/90 hover:bg-primary">
                  {content.type === "video" ? (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Regarder
                    </>
                  ) : content.type === "podcast" ? (
                    <>
                      <Headphones className="h-4 w-4 mr-1" />
                      Écouter
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-1" />
                      Lire
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Contenus en tendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending">Tendances</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="new">Nouveautés</TabsTrigger>
          </TabsList>
          <TabsContent value="trending" className="mt-6">
            {renderContentGrid(trendingContent)}
          </TabsContent>
          <TabsContent value="podcasts" className="mt-6">
            {renderContentGrid(podcastContent)}
          </TabsContent>
          <TabsContent value="new" className="mt-6">
            {renderContentGrid(newContent)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
