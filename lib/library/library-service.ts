"use server"

import { createClient } from "@/lib/supabase/server"

export interface LibraryContent {
  id: string
  title: string
  type: string
  duration: string
  thumbnail: string
  tags: string[]
  description: string
  category: string
  author: string
  created_at: string
  views: number
  is_featured: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  color: string
}

// Récupérer tous les contenus publiés
export async function getAllContents(): Promise<LibraryContent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contents")
      .select("id, title, description, type, duration, thumbnail, author, created_at, views, category")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching contents:", error)
      return []
    }

    return (data || []).map((content) => ({
      id: content.id,
      title: content.title || "Sans titre",
      type: content.type || "document",
      duration: formatDuration(content.duration),
      thumbnail: content.thumbnail || `/placeholder.svg?height=200&width=350&query=${encodeURIComponent(content.title || "content")}`,
      tags: [], // Pas de tags pour l'instant
      description: content.description || "Aucune description disponible",
      category: content.category || "Non catégorisé",
      author: content.author || "Auteur inconnu",
      created_at: content.created_at,
      views: content.views || 0,
      is_featured: false, // Pas de colonne is_featured pour l'instant
    }))
  } catch (error) {
    console.error("Failed to fetch contents:", error)
    return []
  }
}

// Récupérer les contenus tendances (les plus vus)
export async function getTrendingContents(limit = 10): Promise<LibraryContent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contents")
      .select("id, title, description, type, duration, thumbnail, author, created_at, views, category")
      .order("views", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching trending contents:", error)
      return []
    }

    return (data || []).map((content) => ({
      id: content.id,
      title: content.title || "Sans titre",
      type: content.type || "document",
      duration: formatDuration(content.duration),
      thumbnail: content.thumbnail || `/placeholder.svg?height=200&width=350&query=${encodeURIComponent(content.title || "content")}`,
      tags: [], // Pas de tags pour l'instant
      description: content.description || "Aucune description disponible",
      category: content.category || "Non catégorisé",
      author: content.author || "Auteur inconnu",
      created_at: content.created_at,
      views: content.views || 0,
      is_featured: false, // Pas de colonne is_featured pour l'instant
    }))
  } catch (error) {
    console.error("Failed to fetch trending contents:", error)
    return []
  }
}

// Récupérer les nouveaux contenus
export async function getNewContents(limit = 10): Promise<LibraryContent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contents")
      .select("id, title, description, type, duration, thumbnail, author, created_at, views, category")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching new contents:", error)
      return []
    }

    return (data || []).map((content) => ({
      id: content.id,
      title: content.title || "Sans titre",
      type: content.type || "document",
      duration: formatDuration(content.duration),
      thumbnail: content.thumbnail || `/placeholder.svg?height=200&width=350&query=${encodeURIComponent(content.title || "content")}`,
      tags: [], // Pas de tags pour l'instant
      description: content.description || "Aucune description disponible",
      category: content.category || "Non catégorisé",
      author: content.author || "Auteur inconnu",
      created_at: content.created_at,
      views: content.views || 0,
      is_featured: false, // Pas de colonne is_featured pour l'instant
    }))
  } catch (error) {
    console.error("Failed to fetch new contents:", error)
    return []
  }
}

// Récupérer les contenus recommandés (pour l'instant, les plus récents)
export async function getRecommendedContents(limit = 10): Promise<LibraryContent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contents")
      .select("id, title, description, type, duration, thumbnail, author, created_at, views, category")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recommended contents:", error)
      return []
    }

    return (data || []).map((content) => ({
      id: content.id,
      title: content.title || "Sans titre",
      type: content.type || "document",
      duration: formatDuration(content.duration),
      thumbnail: content.thumbnail || `/placeholder.svg?height=200&width=350&query=${encodeURIComponent(content.title || "content")}`,
      tags: [], // Pas de tags pour l'instant
      description: content.description || "Aucune description disponible",
      category: content.category || "Non catégorisé",
      author: content.author || "Auteur inconnu",
      created_at: content.created_at,
      views: content.views || 0,
      is_featured: false, // Pas de colonne is_featured pour l'instant
    }))
  } catch (error) {
    console.error("Failed to fetch recommended contents:", error)
    return []
  }
}

// Récupérer les contenus par type
export async function getContentsByType(type: string, limit = 10): Promise<LibraryContent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contents")
      .select("id, title, description, type, duration, thumbnail, author, created_at, views, category")
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error(`Error fetching ${type} contents:`, error)
      return []
    }

    return (data || []).map((content) => ({
      id: content.id,
      title: content.title || "Sans titre",
      type: content.type || "document",
      duration: formatDuration(content.duration),
      thumbnail: content.thumbnail || `/placeholder.svg?height=200&width=350&query=${encodeURIComponent(content.title || "content")}`,
      tags: [], // Pas de tags pour l'instant
      description: content.description || "Aucune description disponible",
      category: content.category || "Non catégorisé",
      author: content.author || "Auteur inconnu",
      created_at: content.created_at,
      views: content.views || 0,
      is_featured: false, // Pas de colonne is_featured pour l'instant
    }))
  } catch (error) {
    console.error(`Failed to fetch ${type} contents:`, error)
    return []
  }
}

// Récupérer les catégories (pour l'instant, extraire des contenus existants)
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contents")
      .select("category")
      .not("category", "is", null)

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    // Extraire les catégories uniques
    const uniqueCategories = [...new Set(data?.map(item => item.category).filter(Boolean))]
    
    return uniqueCategories.map((name, index) => ({
      id: `cat-${index}`,
      name: name || "Non catégorisé",
      slug: (name || "non-categorise").toLowerCase().replace(/\s+/g, "-"),
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Couleurs générées
      icon: "📁"
    }))
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}

// Récupérer les tags (pour l'instant, retourner un tableau vide)
export async function getTags(): Promise<Tag[]> {
  // Pour l'instant, pas de système de tags
  return []
}

function formatDuration(duration: number | null): string {
  if (!duration || duration === 0) return "0 min"

  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
} 