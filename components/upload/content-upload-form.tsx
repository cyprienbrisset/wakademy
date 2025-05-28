"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { FileUploadZone } from "./file-upload-zone"
import MetadataForm from "./metadata-form"
import AiOptions from "./ai-options"
import UploadHistory from "./upload-history"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Upload, AlertTriangle, LogIn } from "lucide-react"
import { uploadContent } from "@/lib/upload/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { isAuthenticated, getUser } from "@/lib/auth"
import type { ContentFile, ContentMetadata, AiProcessingOptions } from "@/lib/upload/types"

export default function ContentUploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<ContentFile | null>(null)
  const [metadata, setMetadata] = useState<ContentMetadata>({
    title: "",
    description: "",
    type: "",
    author: "",
    language: "fr",
    category: "",
    tags: [],
  })
  const [aiOptions, setAiOptions] = useState<AiProcessingOptions>({
    generateSummary: true,
    createTranscription: false,
    enableAiCategorization: false,
    extractAudio: false,
    createThumbnail: true,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Vérifier l'authentification au chargement du composant
    const authStatus = isAuthenticated()
    setIsUserAuthenticated(authStatus)

    if (authStatus) {
      setUser(getUser())
    }
  }, [])

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return
    
    const selectedFile = selectedFiles[0] // Prendre le premier fichier
    const contentFile: ContentFile = {
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      preview: null, // Pas de preview pour l'instant
    }
    
    setFile(contentFile)
    setUploadError(null)

    // Pre-fill metadata based on file
    if (contentFile.name) {
      const fileName = contentFile.name.split(".")[0]
      const formattedTitle = fileName.replace(/-|_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

      setMetadata((prev) => ({
        ...prev,
        title: formattedTitle,
        type: contentFile.type.startsWith("video")
          ? "video"
          : contentFile.type.startsWith("audio")
            ? "podcast"
            : "document",
      }))
    }
  }

  const handleSubmit = async (isDraft = false) => {
    setUploadError(null)

    // Vérifier l'authentification avant de continuer
    if (!isAuthenticated()) {
      setUploadError("Vous devez être connecté pour télécharger du contenu.")
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter avant de télécharger du contenu",
        variant: "destructive",
      })
      return
    }

    // Récupérer les informations utilisateur
    const currentUser = getUser()
    if (!currentUser || !currentUser.id) {
      setUploadError("Informations utilisateur incomplètes. Veuillez vous reconnecter.")
      return
    }

    if (!file) {
      toast({
        title: "Fichier manquant",
        description: "Veuillez sélectionner un fichier à télécharger",
        variant: "destructive",
      })
      return
    }

    if (!metadata.title) {
      toast({
        title: "Titre manquant",
        description: "Veuillez ajouter un titre pour ce contenu",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", file.file)
      formData.append("metadata", JSON.stringify(metadata))
      formData.append("aiOptions", JSON.stringify(aiOptions))
      formData.append("status", isDraft ? "draft" : "processing")

      // Ajouter les informations utilisateur
      formData.append(
        "userData",
        JSON.stringify({
          id: currentUser.id,
          email: currentUser.email || "",
          name: currentUser.name || "",
        }),
      )

      const result = await uploadContent(formData)

      if (result.success) {
        toast({
          title: "Contenu téléchargé avec succès",
          description: isDraft
            ? "Le contenu a été enregistré comme brouillon"
            : "Le contenu a été téléchargé et les traitements IA ont été lancés",
        })

        // Reset form
        setFile(null)
        setMetadata({
          title: "",
          description: "",
          type: "",
          author: "",
          language: "fr",
          category: "",
          tags: [],
        })

        // Navigate to content page or refresh history
        if (!isDraft) {
          router.push(`/content/${result.contentId}`)
        } else {
          setActiveTab("history")
        }
      } else {
        setUploadError(result.error || "Une erreur est survenue lors du téléchargement")
        throw new Error(result.error || "Une erreur est survenue")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Erreur lors du téléchargement",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {!isUserAuthenticated && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentification requise</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>Vous devez être connecté pour télécharger du contenu.</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={() => router.push("/admin")}>
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Nouveau contenu</TabsTrigger>
          <TabsTrigger value="history">Historique d'upload</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 pt-4">
          {uploadError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur lors du téléchargement</AlertTitle>
              <AlertDescription>
                {uploadError}
                {uploadError.includes("bucket") && (
                  <div className="mt-2">
                    <p className="font-semibold">Solutions possibles:</p>
                    <ul className="list-disc pl-5 text-sm mt-1">
                      <li>Vérifiez que le bucket "content" existe dans votre projet Supabase</li>
                      <li>Allez dans la page /setup pour créer automatiquement le bucket</li>
                      <li>Créez manuellement le bucket via l'interface d'administration Supabase</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <FileUploadZone 
                onFilesSelected={handleFileSelected} 
                multiple={false}
                acceptedFileTypes={[".mp4", ".mp3", ".pdf", ".docx", ".pptx"]}
                maxFileSize={100 * 1024 * 1024}
              />
            </div>

            <div className="space-y-6">
              <MetadataForm metadata={metadata} setMetadata={setMetadata} fileType={file?.type || ""} />

              <AiOptions options={aiOptions} setOptions={setAiOptions} contentType={metadata.type} />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isUploading || !file || !isUserAuthenticated}
            >
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer comme brouillon
            </Button>

            <Button onClick={() => handleSubmit(false)} disabled={isUploading || !file || !isUserAuthenticated}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Enregistrer et lancer les traitements
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <UploadHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
