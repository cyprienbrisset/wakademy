"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type ContentType = "video" | "podcast" | "document"

export interface Content {
  id: string
  title: string
  description: string
  type: ContentType
  url: string
  audioUrl?: string
  videoUrl?: string
  documentUrl?: string
  storagePath?: string
  thumbnailUrl: string
  author: string
  duration: number
  category: string
  topics: string[]
  createdAt: string
  views: number
  isFavorite?: boolean
  isCompleted?: boolean
  chapters?: { title: string; startTime: number }[]
  transcription?: string
  aiSummary?: {
    summary: string
    keyPoints: string[]
  }
  external_id?: string
  rating?: number
  curator?: string
  is_topcream_content?: boolean
  file_url?: string
}

export async function getContentById(id: string): Promise<Content | null> {
  try {
    const supabase = await createClient()

    // Récupérer le contenu avec toutes les colonnes nécessaires
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching content:", error)
      return null
    }

    if (!data) {
      return null
    }

    // Vérifier si nous avons une URL dans les métadonnées ou file_url (MongoDB)
    let audioUrl = ""
    let videoUrl = ""
    let documentUrl = ""
    let thumbnailUrl = ""

    // Prioriser file_url pour les contenus TopCream MongoDB
    if (data.file_url) {
      if (data.type === "podcast") {
        audioUrl = data.file_url
      } else if (data.type === "video") {
        videoUrl = data.file_url
      } else if (data.type === "document") {
        documentUrl = data.file_url
      }
    }

    // Si pas de file_url, utiliser les métadonnées
    if (!audioUrl && !videoUrl && !documentUrl && data.metadata) {
      // Essayer d'abord d'utiliser l'URL publique des métadonnées
      if (data.metadata.publicUrl) {
        if (data.type === "podcast") {
          audioUrl = data.metadata.publicUrl
        } else if (data.type === "video") {
          videoUrl = data.metadata.publicUrl
        } else if (data.type === "document") {
          documentUrl = data.metadata.publicUrl
        }
      }

      // Utiliser l'URL signée si disponible (plus fiable)
      if (data.metadata.signedUrl) {
        if (data.type === "podcast") {
          audioUrl = data.metadata.signedUrl
        } else if (data.type === "video") {
          videoUrl = data.metadata.signedUrl
        } else if (data.type === "document") {
          documentUrl = data.metadata.signedUrl
        }
      }

      // Récupérer l'URL de la miniature
      if (data.metadata.thumbnail_url) {
        thumbnailUrl = data.metadata.thumbnail_url
      }
    }

    // Utiliser thumbnail de la base ou générer depuis file_url
    if (!thumbnailUrl) {
      if (data.thumbnail) {
        thumbnailUrl = data.thumbnail
      } else if (data.file_url && data.type === "video") {
        // Pour les vidéos, essayer d'extraire une miniature
        thumbnailUrl = data.file_url.replace(/\.(mp4|avi|mov)$/i, '_thumbnail.jpg')
      }
    }

    // Si nous n'avons pas d'URL mais que nous avons un chemin de fichier, essayer de générer une URL
    if (!audioUrl && !videoUrl && !documentUrl && data.file_path) {
      try {
        // Essayer d'abord avec le client admin
        try {
          const adminClient = createAdminClient()
          const { data: urlData } = adminClient.storage.from("content").getPublicUrl(data.file_path)

          if (data.type === "podcast") {
            audioUrl = urlData.publicUrl
          } else if (data.type === "video") {
            videoUrl = urlData.publicUrl
          } else if (data.type === "document") {
            documentUrl = urlData.publicUrl
          }

          // Essayer également d'obtenir une URL signée
          const { data: signedData, error: signedError } = await adminClient.storage
            .from("content")
            .createSignedUrl(data.file_path, 3600 * 24) // 1 jour

          if (!signedError && signedData) {
            if (data.type === "podcast") {
              audioUrl = signedData.signedUrl
            } else if (data.type === "video") {
              videoUrl = signedData.signedUrl
            } else if (data.type === "document") {
              documentUrl = signedData.signedUrl
            }
          }
        } catch (adminError) {
          console.warn("Erreur lors de la génération d'URL avec le client admin:", adminError)
        }

        // Si nous n'avons toujours pas d'URL, essayer avec le client standard
        if (!audioUrl && !videoUrl && !documentUrl) {
          const { data: urlData } = supabase.storage.from("content").getPublicUrl(data.file_path)

          if (data.type === "podcast") {
            audioUrl = urlData.publicUrl
          } else if (data.type === "video") {
            videoUrl = urlData.publicUrl
          } else if (data.type === "document") {
            documentUrl = urlData.publicUrl
          }
        }
      } catch (urlError) {
        console.error("Erreur lors de la génération d'URL:", urlError)
      }
    }

    // Si nous n'avons toujours pas d'URL, construire une URL de base
    if (!audioUrl && !videoUrl && !documentUrl && data.file_path) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      if (supabaseUrl) {
        const baseUrl = `${supabaseUrl}/storage/v1/object/public/content/${data.file_path}`

        if (data.type === "podcast") {
          audioUrl = baseUrl
        } else if (data.type === "video") {
          videoUrl = baseUrl
        } else if (data.type === "document") {
          documentUrl = baseUrl
        }
      }
    }

    // Générer une URL de miniature par défaut si nécessaire
    if (!thumbnailUrl && data.title) {
      thumbnailUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(data.title)}`
    }

    // S'assurer que la date est valide
    let createdAt = new Date().toISOString() // Date par défaut
    if (data.created_at) {
      try {
        // Vérifier si la date est valide
        const testDate = new Date(data.created_at)
        if (!isNaN(testDate.getTime())) {
          createdAt = data.created_at
        } else {
          console.warn("Date de création invalide:", data.created_at)
        }
      } catch (dateError) {
        console.warn("Erreur lors du traitement de la date:", dateError)
      }
    }

    // Mettre à jour les métadonnées avec les URLs générées
    if ((audioUrl || videoUrl || documentUrl) && data.metadata) {
      try {
        const updatedMetadata = {
          ...data.metadata,
          publicUrl: audioUrl || videoUrl || documentUrl,
        }

        // Mettre à jour les métadonnées dans la base de données
        const { error: updateError } = await supabase
          .from("contents")
          .update({ metadata: updatedMetadata })
          .eq("id", id)

        if (updateError) {
          console.warn("Erreur lors de la mise à jour des métadonnées:", updateError)
        } else {
          // Mettre à jour les données locales
          data.metadata = updatedMetadata
        }
      } catch (updateError) {
        console.warn("Erreur lors de la mise à jour des métadonnées:", updateError)
      }
    }

    // Ajouter les URLs au résultat
    return {
      id: data.id,
      title: data.title || "Sans titre",
      description: data.description || "Aucune description disponible",
      type: (data.type as ContentType) || "document",
      url: audioUrl || videoUrl || documentUrl || "",
      audioUrl,
      videoUrl,
      documentUrl,
      storagePath: data.file_path,
      thumbnailUrl: thumbnailUrl || `/placeholder.svg?height=400&width=600&query=content`,
      author: data.author || data.curator || "Auteur inconnu",
      duration: data.duration || 0,
      category: data.category || data.categories?.name || "Non catégorisé",
      topics: Array.isArray(data.topics) ? data.topics : [],
      createdAt,
      views: data.view_count || data.views || 0,
      external_id: data.external_id,
      rating: data.rating,
      curator: data.curator,
      is_topcream_content: data.is_topcream_content || false,
      file_url: data.file_url,
    }
  } catch (error) {
    console.error("Error in getContentById:", error)
    return null
  }
}

// Autres fonctions du service...
