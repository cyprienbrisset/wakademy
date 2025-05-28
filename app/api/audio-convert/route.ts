import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get("contentId")

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    // Récupérer l'URL du fichier audio à partir des paramètres de requête
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Vérifier si l'URL est une URL Supabase
    if (!url.includes("supabase.co")) {
      // Si ce n'est pas une URL Supabase, la renvoyer telle quelle
      return NextResponse.json({ url }, { status: 200 })
    }

    // Extraire le chemin du fichier à partir de l'URL
    // Format typique: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[path]?token=...
    const pathMatch = url.match(/\/storage\/v1\/object\/sign\/([^?]+)/)

    if (!pathMatch || !pathMatch[1]) {
      return NextResponse.json({ error: "Could not extract file path from URL" }, { status: 400 })
    }

    const filePath = decodeURIComponent(pathMatch[1])
    console.log("File path extracted:", filePath)

    // Récupérer le fichier depuis Supabase Storage
    const { data, error } = await supabase.storage
      .from(filePath.split("/")[0])
      .download(filePath.split("/").slice(1).join("/"))

    if (error) {
      console.error("Error downloading file from Supabase:", error)
      return NextResponse.json({ error: `Failed to download file: ${error.message}` }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "No data received from Supabase" }, { status: 500 })
    }

    // Renvoyer le fichier avec le type MIME approprié
    // Pour l'instant, nous renvoyons simplement le fichier tel quel
    // Dans une implémentation réelle, vous pourriez convertir le fichier WAV en MP3 ici

    // Déterminer le type MIME en fonction de l'extension du fichier
    let contentType = "audio/mpeg" // Par défaut, nous prétendons que c'est un MP3

    if (filePath.toLowerCase().endsWith(".wav")) {
      contentType = "audio/wav"
    } else if (filePath.toLowerCase().endsWith(".mp3")) {
      contentType = "audio/mpeg"
    } else if (filePath.toLowerCase().endsWith(".ogg")) {
      contentType = "audio/ogg"
    }

    // Créer une URL de blob pour le fichier
    const blob = new Blob([data], { type: contentType })
    const blobUrl = URL.createObjectURL(blob)

    return new Response(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filePath.split("/").pop()}"`,
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error in audio-convert API:", error)
    return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 })
  }
}
