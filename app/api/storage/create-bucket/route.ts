import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST() {
  try {
    const supabaseAdmin = createAdminClient()

    // Vérifier d'abord si le bucket existe déjà
    try {
      const { data: bucket, error: checkError } = await supabaseAdmin.storage.getBucket("content")

      if (!checkError && bucket) {
        return NextResponse.json({
          success: true,
          alreadyExists: true,
          message: "Le bucket de stockage existe déjà",
        })
      }
    } catch (checkErr) {
      console.warn("Erreur lors de la vérification du bucket:", checkErr)
      // Continuer avec la création
    }

    // Créer le bucket
    const { data, error } = await supabaseAdmin.storage.createBucket("content", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ["video/*", "audio/*", "application/pdf", "image/*", "text/*"],
    })

    if (error) {
      // Si le bucket existe déjà
      if (error.message && error.message.includes("already exists")) {
        return NextResponse.json({
          success: true,
          alreadyExists: true,
          message: "Le bucket de stockage existe déjà",
        })
      }

      throw new Error(`Erreur lors de la création du bucket: ${error.message}`)
    }

    // Configurer les politiques d'accès public
    try {
      // Note: Les politiques RLS doivent être configurées directement dans Supabase Dashboard
      console.log("Bucket créé. Configurez les politiques RLS dans le dashboard Supabase si nécessaire.")
    } catch (policyError) {
      console.warn("Avertissement: Impossible de configurer la politique d'accès:", policyError)
      // On continue même si la politique ne peut pas être créée
    }

    return NextResponse.json({
      success: true,
      message: "Bucket de stockage créé avec succès",
    })
  } catch (err) {
    console.error("Erreur lors de la création du bucket:", err)
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Une erreur s'est produite lors de la création du bucket",
      },
      { status: 500 },
    )
  }
}
