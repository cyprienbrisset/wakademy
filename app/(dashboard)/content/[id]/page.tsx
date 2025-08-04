import { notFound } from "next/navigation"
import ContentPageClient from "@/components/content/content-page-client"
import { getContentById } from "@/lib/content/content-service"

// Cette page utilise le layout dashboard qui inclut la Navbar
export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  console.log("Fetching content with ID:", id)

  try {
    const content = await getContentById(id)

    if (!content) {
      console.log("Content not found for ID:", id)
      notFound()
    }

    console.log("Content found:", content.title)
    console.log("Content type:", content.type)
    console.log("Content URL:", content.url)

    // Ajouter l'ID du contenu à l'objet content pour les lecteurs
    const contentWithId = {
      ...content,
      id: id,
    }

    return <ContentPageClient content={contentWithId} />
  } catch (error) {
    console.error("Error rendering content page:", error)
    return (
      <div className="p-8 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-semibold text-red-700 mb-4">Erreur lors du chargement du contenu</h2>
        <p className="text-red-600 mb-2">Une erreur s'est produite lors du chargement du contenu demandé.</p>
        <p className="text-sm text-red-500">ID: {id}</p>
        <p className="text-sm text-red-500 mt-4">Détails techniques: {(error as Error).message}</p>
      </div>
    )
  }
}
