import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // Récupérer les cookies de la requête (await requis pour Next.js 15)
  const cookieStore = await cookies()

  // Créer un nouveau client
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignorer les erreurs de cookies en mode développement
            console.warn("Erreur lors de la définition du cookie:", error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            console.warn("Erreur lors de la suppression du cookie:", error)
          }
        },
      },
    },
  )

  return client
}
