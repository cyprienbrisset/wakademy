import ContentUploadForm from "@/components/upload/content-upload-form"
import StorageBucketManager from "@/components/upload/storage-bucket-manager"
import TestUserCreator from "@/components/upload/test-user-creator"

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Uploader du contenu</h1>
        <p className="text-muted-foreground">
          Téléchargez des vidéos, podcasts ou documents pour les partager avec votre organisation
        </p>
      </div>

      <TestUserCreator />

      <StorageBucketManager />

      <ContentUploadForm />
    </div>
  )
}
