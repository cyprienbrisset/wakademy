"use client"

import { useState, useEffect } from "react"
import { SearchBar } from "@/components/library/search-bar"
import { FilterPanel } from "@/components/library/filter-panel"
import { SortDropdown } from "@/components/library/sort-dropdown"
import { ViewToggle } from "@/components/library/view-toggle"
import { ContentCarousel } from "@/components/library/content-carousel"
import { ContentGrid } from "@/components/library/content-grid"

export interface LibraryContent {
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

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("title")
  const [loading, setLoading] = useState(true)
  
  // États pour les contenus
  const [allContents, setAllContents] = useState<LibraryContent[]>([])
  const [trendingContents, setTrendingContents] = useState<LibraryContent[]>([])
  const [newContents, setNewContents] = useState<LibraryContent[]>([])
  const [recommendedContents, setRecommendedContents] = useState<LibraryContent[]>([])

  // Fonction pour récupérer les données via l'API
  const fetchLibraryData = async (type: string, limit: number = 20): Promise<LibraryContent[]> => {
    try {
      const response = await fetch(`/api/library?type=${type}&limit=${limit}`)
      const result = await response.json()
      
      if (result.error) {
        console.error(`Error fetching ${type} content:`, result.error)
        return []
      }
      
      // Transformer les données de l'API pour correspondre à l'interface LibraryContent
      const transformedData = (result.data || []).map((item: any) => ({
        id: item.id || '',
        title: item.title || 'Titre non disponible',
        description: item.description || 'Description non disponible',
        type: item.type || 'document',
        author: item.author || 'Auteur inconnu',
        duration: typeof item.duration === 'number' 
          ? `${Math.floor(item.duration / 60)}min` 
          : item.duration || '0 min',
        category: item.category || 'Non catégorisé',
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        views: typeof item.views === 'number' ? item.views : 0,
        thumbnailUrl: item.thumbnail || item.thumbnailUrl || '/placeholder.svg'
      }))
      
      return transformedData
    } catch (error) {
      console.error(`Failed to fetch ${type} content:`, error)
      return []
    }
  }

  // Charger les données au montage du composant
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        console.log("Loading library data...")
        
        // Charger tous les contenus en parallèle
        const [all, trending, newContent, recommended] = await Promise.all([
          fetchLibraryData("all", 50),
          fetchLibraryData("trending", 10),
          fetchLibraryData("new", 10),
          fetchLibraryData("new", 10) // Pour l'instant, recommandés = nouveaux
        ])

        console.log("Library data loaded:", {
          all: all.length,
          trending: trending.length,
          new: newContent.length,
          recommended: recommended.length
        })

        setAllContents(all)
        setTrendingContents(trending)
        setNewContents(newContent)
        setRecommendedContents(recommended)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtrer et trier les contenus
  const filteredContent = allContents
    .filter((item) => {
      // Filtrage par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      // Tri des contenus
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "views":
          return b.views - a.views
        case "author":
          return a.author.localeCompare(b.author)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <h1 className="text-3xl font-bold">Bibliothèque</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des contenus...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <h1 className="text-3xl font-bold">Bibliothèque</h1>
        <SearchBar onSearch={setSearchQuery} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <FilterPanel
          onFilterChange={(filters) => {
            // Logique de filtrage basée sur les filtres sélectionnés
            console.log("Filtres appliqués:", filters)
          }}
        />
        <div className="flex gap-2 items-center">
          <SortDropdown onSortChange={setSortBy} />
          <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Carrousels de contenus */}
      <div className="space-y-10">
        {trendingContents.length > 0 && (
          <ContentCarousel 
            title="Tendances" 
            icon="🔥" 
            contents={trendingContents} 
            viewMode={viewMode} 
          />
        )}
        
        {newContents.length > 0 && (
          <ContentCarousel 
            title="Nouveautés" 
            icon="✨" 
            contents={newContents} 
            viewMode={viewMode} 
          />
        )}
        
        {recommendedContents.length > 0 && (
          <ContentCarousel 
            title="Recommandés pour vous" 
            icon="👤" 
            contents={recommendedContents} 
            viewMode={viewMode} 
          />
        )}
      </div>

      {/* Grille de tous les contenus */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Tous les contenus ({filteredContent.length})
        </h2>
        {filteredContent.length > 0 ? (
          <ContentGrid contents={filteredContent} viewMode={viewMode} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "Aucun contenu trouvé pour cette recherche." : "Aucun contenu disponible."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
