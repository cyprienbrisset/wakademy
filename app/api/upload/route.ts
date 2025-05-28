import { NextRequest, NextResponse } from "next/server"
import { uploadContent } from "@/lib/upload/actions"

export async function POST(request: NextRequest) {
  try {
    console.log("=== API Upload Debug ===")
    
    // Récupérer le FormData de la requête
    const formData = await request.formData()
    
    console.log("FormData reçu:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
      } else {
        console.log(`  ${key}: ${typeof value === 'string' ? value.substring(0, 100) : value}`)
      }
    }

    // Appeler la fonction uploadContent
    const result = await uploadContent(formData)
    
    console.log("Résultat de l'upload:", result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        contentId: result.contentId,
        message: "Contenu téléchargé avec succès"
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Une erreur est survenue lors du téléchargement"
      }, { status: 400 })
    }

  } catch (error) {
    console.error("Erreur dans l'API upload:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Une erreur inconnue s'est produite"
    }, { status: 500 })
  }
} 