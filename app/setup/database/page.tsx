import { DatabaseSetupGuide } from "@/components/setup/database-setup-guide"

export default function DatabaseSetupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Configuration de la base de données</h1>
      <p className="text-muted-foreground mb-8">
        Créez les tables nécessaires et ajoutez des données d'exemple pour Wakademy
      </p>

      <div className="max-w-3xl mx-auto">
        <DatabaseSetupGuide />
      </div>
    </div>
  )
}
