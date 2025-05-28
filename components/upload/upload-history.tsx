"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2, Clock, CheckCircle, AlertCircle, Video, FileText, Headphones } from "lucide-react"
import { getRecentUploads, deleteContent } from "@/lib/upload/actions"
import type { ContentSummary } from "@/lib/upload/types"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UploadHistory() {
  const router = useRouter()
  const [uploads, setUploads] = useState<ContentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const data = await getRecentUploads()
        setUploads(data)
      } catch (error) {
        console.error("Failed to fetch uploads:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des uploads",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUploads()
  }, [])

  const handleView = (id: string) => {
    router.push(`/content/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/content/${id}/edit`)
  }

  const handleDeleteClick = (id: string) => {
    setContentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return

    try {
      await deleteContent(contentToDelete)
      setUploads(uploads.filter((upload) => upload.id !== contentToDelete))
      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès",
      })
    } catch (error) {
      console.error("Failed to delete content:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le contenu",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setContentToDelete(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "processing":
        return "En traitement"
      case "published":
        return "Publié"
      case "error":
        return "Erreur"
      case "draft":
        return "Brouillon"
      default:
        return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "podcast":
        return <Headphones className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (uploads.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Aucun contenu téléchargé récemment</p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uploads.map((upload) => (
            <TableRow key={upload.id}>
              <TableCell className="font-medium">{upload.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {getTypeIcon(upload.type)}
                  <span className="capitalize">{upload.type}</span>
                </div>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(upload.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {getStatusIcon(upload.status)}
                  <span>{getStatusText(upload.status)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleView(upload.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(upload.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(upload.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le contenu sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
