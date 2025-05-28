import { type NextRequest, NextResponse } from "next/server"
import { getFileUrl } from "@/lib/storage/get-file-url"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    const path = searchParams.get("path")
    const bucket = searchParams.get("bucket") || "content"

    if (!path) {
      return NextResponse.json({ error: "Le paramètre 'path' est requis" }, { status: 400 })
    }

    // Essayer d'abord avec le client standard
    let signedUrl = await getFileUrl(path, bucket)

    // Si ça échoue, essayer avec le client admin
    if (!signedUrl) {
      console.log("Trying with admin client...")
      const supabase = createAdminClient()

      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)

      if (error) {
        console.error("Admin client error:", error)
        return NextResponse.json({ error: `Impossible de générer l'URL signée: ${error.message}` }, { status: 500 })
      }

      signedUrl = data.signedUrl
    }

    if (!signedUrl) {
      return NextResponse.json({ error: "Impossible de générer l'URL signée" }, { status: 500 })
    }

    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error("Error in GET /api/storage/get-file-url:", error)
    return NextResponse.json({ error: `Une erreur s'est produite: ${(error as Error).message}` }, { status: 500 })
  }
}
