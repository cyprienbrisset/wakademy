"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { ContentSummary, UploadResult } from "./types"

// Fonction pour vérifier si le bucket existe
async function checkBucketExists() {
  try {
    console.log("🔍 Vérification de l'existence du bucket...")
    
    // Utiliser le client admin pour vérifier l'existence du bucket
    const adminClient = createAdminClient()
    
    const { data, error } = await adminClient.storage.getBucket("content")
    
    if (error) {
      console.error("Erreur lors de la vérification du bucket:", error)
      return false
    }
    
    console.log("✅ Bucket trouvé:", data)
    return true
  } catch (error) {
    console.error("Erreur lors de la vérification du bucket:", error)
    return false
  }
}

// Fonction pour tester l'accès au bucket
async function testBucketAccess() {
  try {
    console.log("🧪 Test d'accès au bucket...")
    
    const supabase = await createClient()
    
    // Essayer de lister les fichiers dans le bucket (même si vide)
    const { data, error } = await supabase.storage.from("content").list("", {
      limit: 1,
    })
    
    if (error) {
      console.error("Erreur d'accès au bucket:", error)
      return false
    }
    
    console.log("✅ Accès au bucket réussi")
    return true
  } catch (error) {
    console.error("Erreur lors du test d'accès:", error)
    return false
  }
}

// Fonction pour vérifier si un bucket existe avec un nom donné
async function bucketExists(bucket: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage.getBucket(bucket)
    
    if (error) {
      console.error(`Bucket ${bucket} n'existe pas:`, error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error(`Erreur lors de la vérification du bucket ${bucket}:`, error)
    return false
  }
}

export async function uploadContent(formData: FormData): Promise<UploadResult> {
  try {
    const supabase = await createClient()
    let adminClient = null

    // Get file from form data
    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file provided")
    }

    // Parse metadata and AI options
    const metadata = JSON.parse(formData.get("metadata") as string)
    const aiOptions = JSON.parse(formData.get("aiOptions") as string)
    const status = formData.get("status") as string
    const userData = formData.get("userData") ? JSON.parse(formData.get("userData") as string) : null

    // Vérifier que l'utilisateur est authentifié
    if (!userData || !userData.id) {
      throw new Error("Utilisateur non authentifié. Veuillez vous connecter avant de télécharger du contenu.")
    }

    // Vérifier que le bucket existe avec plusieurs méthodes
    const bucketExists = await checkBucketExists()
    const bucketAccessible = await testBucketAccess()

    if (!bucketExists && !bucketAccessible) {
      console.error("Le bucket 'content' n'existe pas ou n'est pas accessible")

      // Tenter de créer le bucket avec le client admin
      try {
        adminClient = createAdminClient()
        const { error: createError } = await adminClient.storage.createBucket("content", {
          public: true,
          fileSizeLimit: 52428800, // 50MB,
          allowedMimeTypes: [
            "video/*",
            "audio/*",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/*",
            "text/*",
          ],
        })

        if (createError && !createError.message.includes("already exists")) {
          throw new Error(`Impossible de créer le bucket: ${createError.message}`)
        }

        console.log("Bucket créé ou déjà existant")
      } catch (createError) {
        console.error("Erreur lors de la création du bucket:", createError)
        throw new Error(
          "Le bucket de stockage 'content' n'existe pas et n'a pas pu être créé automatiquement. Veuillez le créer via l'interface d'administration de Supabase.",
        )
      }
    }

    // Generate file path
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${metadata.title.toLowerCase().replace(/\s+/g, "-")}.${fileExt}`
    const filePath = `uploads/${new Date().toISOString().split("T")[0]}/${fileName}`

    // Upload file to Supabase Storage
    // Essayer d'abord avec le client standard
    let uploadData, uploadError

    try {
      const result = await supabase.storage.from("content").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      uploadData = result.data
      uploadError = result.error
    } catch (error) {
      console.error("Erreur lors de l'upload avec le client standard:", error)
      uploadError = error
    }

    // Si l'upload échoue avec le client standard, essayer avec le client admin
    if (uploadError) {
      console.warn("Tentative d'upload avec le client admin suite à une erreur:", uploadError)

      try {
        if (!adminClient) {
          adminClient = createAdminClient()
        }

        const adminResult = await adminClient.storage.from("content").upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        uploadData = adminResult.data
        uploadError = adminResult.error
      } catch (adminError) {
        console.error("Erreur lors de l'upload avec le client admin:", adminError)
        uploadError = adminError
      }
    }

    // Gérer les erreurs d'upload
    if (uploadError) {
      const error = uploadError as any
      if (error?.message?.includes("The resource already exists")) {
        throw new Error(`Un fichier avec le même nom existe déjà. Veuillez renommer votre fichier et réessayer.`)
      } else if (error?.message?.includes("violates row-level security policy")) {
        throw new Error(
          `Erreur de permission: Vous n'avez pas les droits nécessaires pour télécharger des fichiers. Veuillez contacter l'administrateur.`,
        )
      } else {
        throw new Error(`Échec du téléchargement: ${error?.message || "Erreur inconnue"}`)
      }
    }

    // Get public URL for the uploaded file
    let publicUrl = ""
    let signedUrl = ""

    // Essayer d'obtenir l'URL publique avec le client admin d'abord (plus fiable)
    try {
      if (!adminClient) {
        adminClient = createAdminClient()
      }

      // Obtenir l'URL publique
      const { data: publicUrlData } = adminClient.storage.from("content").getPublicUrl(filePath)
      publicUrl = publicUrlData.publicUrl

      // Obtenir également une URL signée (plus fiable pour l'accès)
      const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
        .from("content")
        .createSignedUrl(filePath, 3600 * 24 * 7) // 7 jours

      if (!signedUrlError && signedUrlData) {
        signedUrl = signedUrlData.signedUrl
      }

      console.log("URLs générées avec le client admin:", { publicUrl, signedUrl })
    } catch (error) {
      console.warn("Erreur lors de la génération des URLs avec le client admin:", error)
    }

    // Si l'URL publique n'a pas été obtenue avec le client admin, essayer avec le client standard
    if (!publicUrl) {
      try {
        const { data: publicUrlData } = supabase.storage.from("content").getPublicUrl(filePath)
        publicUrl = publicUrlData.publicUrl

        // Essayer d'obtenir une URL signée
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("content")
          .createSignedUrl(filePath, 3600 * 24) // 1 jour

        if (!signedUrlError && signedUrlData) {
          signedUrl = signedUrlData.signedUrl
        }

        console.log("URLs générées avec le client standard:", { publicUrl, signedUrl })
      } catch (error) {
        console.error("Erreur lors de la génération des URLs avec le client standard:", error)
      }
    }

    // Si nous n'avons toujours pas d'URL, construire une URL de base
    if (!publicUrl) {
      // Construire une URL de base (peut ne pas fonctionner selon la configuration)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      if (supabaseUrl) {
        publicUrl = `${supabaseUrl}/storage/v1/object/public/content/${filePath}`
        console.log("URL construite manuellement:", publicUrl)
      } else {
        console.error("Impossible de construire l'URL: URL Supabase non disponible")
      }
    }

    // Insert content record in database using the correct column names
    const { data: contentData, error: contentError } = await supabase
      .from("contents")
      .insert({
        title: metadata.title,
        description: metadata.description || "",
        type: metadata.type,
        author: metadata.author || userData.email || "Unknown",
        duration: metadata.duration || 0,
        category: metadata.category || "Général",
        thumbnail: metadata.thumbnailUrl || null,
        views: 0,
        // Stocker les métadonnées étendues dans un champ JSON si disponible
        // Sinon, on utilise seulement les colonnes de base
      })
      .select("id")
      .single()

    if (contentError) {
      console.error("Content creation error:", contentError)
      throw new Error(`Échec de la création de l'enregistrement: ${contentError.message}`)
    }

    // Create AI processing jobs if needed
    const aiJobs = []

    if (aiOptions.generateSummary) {
      aiJobs.push({
        content_id: contentData.id,
        job_type: "summary",
        status: "pending",
        metadata: {},
      })
    }

    if (aiOptions.createTranscription && (metadata.type === "video" || metadata.type === "podcast")) {
      aiJobs.push({
        content_id: contentData.id,
        job_type: "transcription",
        status: "pending",
        metadata: {},
      })
    }

    if (aiOptions.enableAiCategorization) {
      aiJobs.push({
        content_id: contentData.id,
        job_type: "categorization",
        status: "pending",
        metadata: {},
      })
    }

    if (aiOptions.extractAudio && metadata.type === "video") {
      aiJobs.push({
        content_id: contentData.id,
        job_type: "audio_extraction",
        status: "pending",
        metadata: {},
      })
    }

    if (aiOptions.createThumbnail) {
      aiJobs.push({
        content_id: contentData.id,
        job_type: "thumbnail_generation",
        status: "pending",
        metadata: {},
      })
    }

    // Insert AI jobs if any
    if (aiJobs.length > 0) {
      const { error: aiJobsError } = await supabase.from("content_ai_jobs").insert(aiJobs)

      if (aiJobsError) {
        console.error("AI jobs creation failed:", aiJobsError)
        // We don't throw here to avoid failing the whole upload
      }
    }

    revalidatePath("/upload")
    revalidatePath("/library")

    return {
      success: true,
      contentId: contentData.id,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Une erreur inconnue s'est produite",
    }
  }
}

export async function getRecentUploads(): Promise<ContentSummary[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contents")
      .select(`
        id, 
        title, 
        type, 
        status, 
        created_at, 
        updated_at,
        view_count,
        like_count,
        author,
        file_size,
        file_path,
        metadata
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching recent uploads:", error)
      return []
    }

    // Transformer les données pour s'assurer que l'URL est disponible
    return (data || []).map((item) => {
      // Essayer de récupérer l'URL des métadonnées
      let url = ""
      if (item.metadata && item.metadata.publicUrl) {
        url = item.metadata.publicUrl
      }

      // Si pas d'URL et qu'on a un chemin de fichier, construire une URL de base
      if (!url && item.file_path) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
        if (supabaseUrl) {
          url = `${supabaseUrl}/storage/v1/object/public/content/${item.file_path}`
        }
      }

      return {
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        views: item.view_count || 0,
        likes: item.like_count || 0,
        author: item.author,
        size: item.file_size,
        url: url,
        file_path: item.file_path,
        metadata: item.metadata,
      }
    }) as ContentSummary[]
  } catch (error) {
    console.error("Failed to fetch recent uploads:", error)
    return []
  }
}

export async function deleteContent(id: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Get file path before deleting the content
    const { data: content, error: fetchError } = await supabase
      .from("contents")
      .select("file_path")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching content for deletion:", fetchError)
      throw fetchError
    }

    // Delete AI jobs first (foreign key constraint)
    const { error: aiJobsDeleteError } = await supabase.from("content_ai_jobs").delete().eq("content_id", id)

    if (aiJobsDeleteError) {
      console.error("Error deleting AI jobs:", aiJobsDeleteError)
    }

    // Delete content record
    const { error: deleteError } = await supabase.from("contents").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting content:", deleteError)
      throw deleteError
    }

    // Delete file from storage
    if (content?.file_path) {
      const { error: storageError } = await supabase.storage.from("content").remove([content.file_path])

      if (storageError) {
        console.error("Failed to delete file from storage:", storageError)
        // We don't throw here to avoid failing the whole deletion
      }
    }

    revalidatePath("/upload")
    revalidatePath("/library")

    return true
  } catch (error) {
    console.error("Failed to delete content:", error)
    return false
  }
}

export async function getCategories() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}
