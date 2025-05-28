import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Content, ContentType } from "@/lib/content/content-service"

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get("id")
    const category = searchParams.get("category") || ""

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    console.log(`API: Fetching related content for ID: ${contentId}, Category: ${category}`)

    // Implémentation directe au lieu d'utiliser getRelatedContent
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Vérifier d'abord si la table contents existe
      const { error: tableCheckError } = await supabase.from("contents").select("id").limit(1)

      if (tableCheckError) {
        console.log("Table 'contents' does not exist, returning fallback data")
        return NextResponse.json(fallbackContent)
      }

      // Récupérer les contenus similaires
      const query = supabase.from("contents").select("*").neq("id", contentId).limit(6)

      // Ajouter le filtre de catégorie si disponible
      if (category) {
        query.eq("category", category)
      }

      const { data, error } = await query

      if (error) {
        console.error("Database error:", error)
        return NextResponse.json(fallbackContent)
      }

      if (!data || data.length === 0) {
        console.log("No related content found, returning fallback data")
        return NextResponse.json(fallbackContent)
      }

      // Formater les données
      const formattedContent = data.map((content) => {
        // Générer une URL de miniature par défaut basée sur le titre
        const defaultThumbnail = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(
          content.title || "content thumbnail",
        )}`

        return {
          id: content.id,
          title: content.title || "Sans titre",
          description: content.description || "Aucune description disponible",
          type: (content.type as ContentType) || "document",
          url: content.url || "",
          thumbnailUrl: content.thumbnail || defaultThumbnail,
          author: content.author || "Auteur inconnu",
          duration: content.duration || 0,
          category: content.category || "Non catégorisé",
          topics: [],
          createdAt: content.created_at || new Date().toISOString(),
          views: content.views || 0,
        }
      })

      console.log(`API: Returning ${formattedContent.length} related content items`)
      return NextResponse.json(formattedContent)
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(fallbackContent)
    }
  } catch (error) {
    console.error("API error:", error)
    // Retourner les données fictives au lieu d'une erreur
    return NextResponse.json(fallbackContent)
  }
}
