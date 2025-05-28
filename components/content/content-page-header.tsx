"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Share2, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface ContentPageHeaderProps {
  content: any
}

export default function ContentPageHeader({ content }: ContentPageHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)

  // Vérifier si le contenu est dans les favoris au chargement
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem("wakademy_favorites") || "[]")
      setIsFavorite(favorites.includes(content.id))
    } catch (error) {
      console.error("Error checking favorites:", error)
    }
  }, [content.id])

  // Gérer l'ajout/suppression des favoris
  const toggleFavorite = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem("wakademy_favorites") || "[]")

      if (isFavorite) {
        // Supprimer des favoris
        const updatedFavorites = favorites.filter((id: string) => id !== content.id)
        localStorage.setItem("wakademy_favorites", JSON.stringify(updatedFavorites))
        setIsFavorite(false)

        toast({
          title: "Retiré des favoris",
          description: `"${content.title}" a été retiré de vos favoris`,
          duration: 3000,
        })
      } else {
        // Ajouter aux favoris
        const updatedFavorites = [...favorites, content.id]
        localStorage.setItem("wakademy_favorites", JSON.stringify(updatedFavorites))
        setIsFavorite(true)

        toast({
          title: "Ajouté aux favoris",
          description: `"${content.title}" a été ajouté à vos favoris`,
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error updating favorites:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos favoris",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Partager le contenu
  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: `Découvrez "${content.title}" sur Wakademy`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copier le lien dans le presse-papier
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papier",
        duration: 3000,
      })
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Retour">
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={shareContent} aria-label="Partager">
          <Share2 className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {isFavorite ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}
