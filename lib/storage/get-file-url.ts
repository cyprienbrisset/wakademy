import { createClient } from "@/lib/supabase/server"

/**
 * Génère une URL signée pour un fichier dans le bucket de stockage
 * @param path Chemin du fichier dans le bucket
 * @param bucket Nom du bucket (par défaut: 'content')
 * @param expiresIn Durée de validité de l'URL en secondes (par défaut: 3600)
 * @returns URL signée ou null en cas d'erreur
 */
export async function getFileUrl(path: string, bucket = "content", expiresIn = 3600): Promise<string | null> {
  try {
    console.log(`Generating signed URL for file: ${path} in bucket: ${bucket}`)
    const supabase = await createClient()

    // Vérifier si le bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return null
    }

    const bucketExists = buckets.some((b) => b.name === bucket)
    if (!bucketExists) {
      console.error(`Bucket '${bucket}' does not exist`)
      return null
    }

    // Générer l'URL signée
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

    if (error) {
      console.error("Error creating signed URL:", error)
      return null
    }

    console.log(`Signed URL generated successfully: ${data.signedUrl}`)
    return data.signedUrl
  } catch (error) {
    console.error("Error in getFileUrl:", error)
    return null
  }
}

/**
 * Vérifie si un fichier existe dans le bucket de stockage
 * @param path Chemin du fichier dans le bucket
 * @param bucket Nom du bucket (par défaut: 'content')
 * @returns true si le fichier existe, false sinon
 */
export async function fileExists(path: string, bucket = "content"): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Extraire le dossier du chemin
    const folderPath = path.split("/").slice(0, -1).join("/")

    // Lister les fichiers dans le dossier
    const { data, error } = await supabase.storage.from(bucket).list(folderPath)

    if (error) {
      console.error("Error checking if file exists:", error)
      return false
    }

    // Vérifier si le fichier existe dans la liste
    const fileName = path.split("/").pop()
    return data.some((file) => file.name === fileName)
  } catch (error) {
    console.error("Error in fileExists:", error)
    return false
  }
}
