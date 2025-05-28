"use server"

import { createClient } from "@/lib/supabase/server"

export type ContentProgress = {
  id: string
  user_id: string
  content_id: string
  current_position: number
  duration: number
  percentage: number
  is_completed: boolean
  last_watched_at: string
  created_at: string
  updated_at: string
}

export type SaveProgressParams = {
  content_id: string
  current_position: number
  duration: number
  is_completed?: boolean
}

/**
 * Récupère la progression d'un utilisateur pour un contenu spécifique
 */
export async function getContentProgress(contentId: string): Promise<ContentProgress | null> {
  try {
    const supabase = await createClient()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log("Utilisateur non connecté, impossible de récupérer la progression")
      return null
    }

    const { data, error } = await supabase
      .from("content_progress")
      .select("*")
      .eq("content_id", contentId)
      .eq("user_id", session.user.id)
      .single()

    if (error) {
      // Si l'erreur est "No rows found", ce n'est pas une erreur critique
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Erreur lors de la récupération de la progression:", error)
      return null
    }

    return data as ContentProgress
  } catch (error) {
    console.error("Exception lors de la récupération de la progression:", error)
    return null
  }
}

/**
 * Sauvegarde la progression d'un utilisateur pour un contenu
 */
export async function saveContentProgress(params: SaveProgressParams): Promise<ContentProgress | null> {
  try {
    const { content_id, current_position, duration, is_completed = false } = params
    const supabase = await createClient()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log("Utilisateur non connecté, impossible de sauvegarder la progression")
      return null
    }

    // Calculer le pourcentage de progression
    const percentage = duration > 0 ? Math.min(100, (current_position / duration) * 100) : 0

    // Déterminer si le contenu est terminé (si non spécifié explicitement)
    const completed = is_completed || percentage >= 95

    const progressData = {
      user_id: session.user.id,
      content_id,
      current_position,
      duration,
      percentage,
      is_completed: completed,
      last_watched_at: new Date().toISOString(),
    }

    // Vérifier si une entrée existe déjà
    const { data: existingProgress } = await supabase
      .from("content_progress")
      .select("id")
      .eq("content_id", content_id)
      .eq("user_id", session.user.id)
      .single()

    let result

    if (existingProgress) {
      // Mettre à jour l'entrée existante
      const { data, error } = await supabase
        .from("content_progress")
        .update(progressData)
        .eq("id", existingProgress.id)
        .select()
        .single()

      if (error) {
        console.error("Erreur lors de la mise à jour de la progression:", error)
        return null
      }

      result = data
    } else {
      // Créer une nouvelle entrée
      const { data, error } = await supabase.from("content_progress").insert(progressData).select().single()

      if (error) {
        console.error("Erreur lors de la création de la progression:", error)
        return null
      }

      result = data
    }

    // Mettre à jour également l'historique de visionnage si la table existe
    try {
      await updateWatchHistory(content_id, session.user.id, current_position, completed)
    } catch (historyError) {
      console.warn("Erreur lors de la mise à jour de l'historique (non bloquant):", historyError)
    }

    return result as ContentProgress
  } catch (error) {
    console.error("Exception lors de la sauvegarde de la progression:", error)
    return null
  }
}

/**
 * Récupère les contenus en cours pour un utilisateur
 */
export async function getContinueWatchingContent(limit = 10): Promise<any[]> {
  try {
    const supabase = await createClient()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log("Utilisateur non connecté, impossible de récupérer les contenus en cours")
      return []
    }

    const { data, error } = await supabase
      .from("content_progress")
      .select(`
        *,
        content:content_id (
          id,
          title,
          description,
          type,
          thumbnail_path,
          duration,
          file_path,
          category_id,
          status
        )
      `)
      .eq("user_id", session.user.id)
      .eq("is_completed", false)
      .order("last_watched_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Erreur lors de la récupération des contenus en cours:", error)
      return []
    }

    // Filtrer les contenus nuls ou supprimés
    return data.filter((item) => item.content !== null).filter((item) => item.content.status === "published")
  } catch (error) {
    console.error("Exception lors de la récupération des contenus en cours:", error)
    return []
  }
}

/**
 * Marque un contenu comme terminé
 */
export async function markContentAsCompleted(contentId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return false
    }

    const { error } = await supabase.from("content_progress").upsert(
      {
        user_id: session.user.id,
        content_id: contentId,
        is_completed: true,
        percentage: 100,
        last_watched_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,content_id",
      },
    )

    if (error) {
      console.error("Erreur lors du marquage du contenu comme terminé:", error)
      return false
    }

    // Mettre à jour également l'historique de visionnage
    try {
      await updateWatchHistory(contentId, session.user.id, 0, true)
    } catch (historyError) {
      console.warn("Erreur lors de la mise à jour de l'historique (non bloquant):", historyError)
    }

    return true
  } catch (error) {
    console.error("Exception lors du marquage du contenu comme terminé:", error)
    return false
  }
}

/**
 * Supprime la progression d'un contenu
 */
export async function resetContentProgress(contentId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Vérifier si l'utilisateur est connecté
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return false
    }

    const { error } = await supabase
      .from("content_progress")
      .delete()
      .eq("content_id", contentId)
      .eq("user_id", session.user.id)

    if (error) {
      console.error("Erreur lors de la suppression de la progression:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Exception lors de la suppression de la progression:", error)
    return false
  }
}

/**
 * Fonction auxiliaire pour mettre à jour l'historique de visionnage
 * Cette fonction est utilisée pour maintenir la compatibilité avec la table user_history
 */
async function updateWatchHistory(
  contentId: string,
  userId: string,
  progress: number,
  completed: boolean,
): Promise<void> {
  const supabase = await createClient()

  // Vérifier si la table user_history existe
  const { error: checkError } = await supabase
    .from("user_history")
    .select("id", { count: "exact", head: true })
    .limit(1)

  if (checkError) {
    // La table n'existe probablement pas, on ignore silencieusement
    return
  }

  // Mettre à jour l'historique
  const { error } = await supabase.from("user_history").upsert(
    {
      user_id: userId,
      content_id: contentId,
      progress: Math.round(progress),
      completed,
      last_watched_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,content_id",
    },
  )

  if (error) {
    console.warn("Erreur lors de la mise à jour de l'historique:", error)
  }
}
