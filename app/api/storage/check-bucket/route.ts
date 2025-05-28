import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    console.log("Checking bucket existence...")
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Essayer d'abord avec le client admin qui a plus de permissions
    try {
      const adminClient = createAdminClient()
      const { data: adminData, error: adminError } = await adminClient.storage.getBucket("content")

      if (!adminError && adminData) {
        console.log("Bucket vérifié avec succès via client admin")
        return NextResponse.json({ exists: true })
      }
    } catch (adminErr) {
      console.warn("Erreur avec le client admin:", adminErr)
      // Continuer avec le client standard
    }

    // Essayer de lister les buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (!listError && buckets) {
      const contentBucket = buckets.find((bucket) => bucket.name === "content")
      if (contentBucket) {
        console.log("Bucket trouvé via listBuckets")
        return NextResponse.json({ exists: true })
      }
    }

    // Essayer de lister les fichiers dans le bucket
    const { data: files, error: filesError } = await supabase.storage.from("content").list()

    if (!filesError) {
      console.log("Bucket vérifié via list files")
      return NextResponse.json({ exists: true })
    }

    // Si l'erreur indique que le bucket n'existe pas
    if (filesError && (filesError.message.includes("does not exist") || filesError.message.includes("not found"))) {
      console.log("Bucket n'existe pas")
      return NextResponse.json({ exists: false })
    }

    // Si l'erreur est liée aux permissions, le bucket existe probablement
    if (filesError && (filesError.message.includes("permission") || filesError.message.includes("not authorized"))) {
      console.log("Erreur de permission, bucket existe probablement")
      return NextResponse.json({ exists: true })
    }

    // Par défaut, considérer que le bucket n'existe pas
    console.log("Impossible de déterminer si le bucket existe, par défaut: n'existe pas")
    return NextResponse.json({ exists: false })
  } catch (err) {
    console.error("Erreur lors de la vérification du bucket:", err)
    return NextResponse.json(
      { error: "Erreur serveur lors de la vérification du bucket", exists: false },
      { status: 500 },
    )
  }
}
