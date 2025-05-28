"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentCard } from "./content-card"
import { ContentListItem } from "./content-list-item"

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

interface ContentCarouselProps {
  title: string
  icon: string
  contents: Content[]
  viewMode: "grid" | "list"
}

export function ContentCarousel({ title, icon, contents, viewMode }: ContentCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  // Vérification de sécurité pour contents avec validation complète
  const safeContents = Array.isArray(contents) 
    ? contents.filter(content => {
        // Vérifier que l'objet existe et a les propriétés requises
        return content && 
               typeof content === 'object' && 
               content.id && 
               typeof content.id === 'string' &&
               content.title &&
               typeof content.title === 'string'
      }).map(content => ({
        // S'assurer que toutes les propriétés existent avec des valeurs par défaut
        id: content.id,
        title: content.title,
        description: content.description || 'Description non disponible',
        type: content.type || 'document',
        author: content.author || 'Auteur inconnu',
        duration: content.duration || '0 min',
        category: content.category || 'Non catégorisé',
        createdAt: content.createdAt || new Date().toISOString(),
        views: typeof content.views === 'number' ? content.views : 0,
        thumbnailUrl: content.thumbnailUrl || '/placeholder.svg'
      }))
    : []

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5

      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })
    }
  }

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
      setShowLeftButton(scrollLeft > 0)
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="mr-2">{icon}</span>
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${!showLeftButton ? "opacity-0 cursor-default" : ""}`}
            onClick={() => scroll("left")}
            disabled={!showLeftButton}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${!showRightButton ? "opacity-0 cursor-default" : ""}`}
            onClick={() => scroll("right")}
            disabled={!showRightButton}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => {
          if (carouselRef.current) {
            handleScroll()
          }
        }}
      >
        <div ref={carouselRef} className="flex overflow-x-auto scrollbar-hide gap-4 pb-4" onScroll={handleScroll}>
          {safeContents.length > 0 ? (
            viewMode === "grid"
              ? safeContents.map((content) => (
                  <div key={content?.id || Math.random()} className="flex-shrink-0 w-[280px]">
                    <ContentCard content={content} />
                  </div>
                ))
              : safeContents.map((content) => (
                  <div key={content?.id || Math.random()} className="flex-shrink-0 w-[400px]">
                    <ContentListItem content={content} />
                  </div>
                ))
          ) : (
            <div className="flex items-center justify-center w-full py-8 text-muted-foreground">
              Aucun contenu disponible
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
