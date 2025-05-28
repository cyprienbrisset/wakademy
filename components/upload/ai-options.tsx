"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { AiProcessingOptions } from "@/lib/upload/types"
import { Sparkles } from "lucide-react"

interface AiOptionsProps {
  options: AiProcessingOptions
  setOptions: (options: AiProcessingOptions) => void
  contentType: string
}

export default function AiOptions({ options, setOptions, contentType }: AiOptionsProps) {
  const handleToggle = (option: keyof AiProcessingOptions) => {
    setOptions({
      ...options,
      [option]: !options[option],
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Options IA</h3>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="generateSummary" className="flex flex-col">
            <span>Générer résumé IA</span>
            <span className="text-xs text-muted-foreground">Crée un résumé automatique du contenu</span>
          </Label>
          <Switch
            id="generateSummary"
            checked={options.generateSummary}
            onCheckedChange={() => handleToggle("generateSummary")}
          />
        </div>

        {(contentType === "video" || contentType === "podcast") && (
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="createTranscription" className="flex flex-col">
              <span>Créer transcription</span>
              <span className="text-xs text-muted-foreground">Génère une transcription textuelle de l'audio</span>
            </Label>
            <Switch
              id="createTranscription"
              checked={options.createTranscription}
              onCheckedChange={() => handleToggle("createTranscription")}
            />
          </div>
        )}

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="enableAiCategorization" className="flex flex-col">
            <span>Activer catégorisation IA</span>
            <span className="text-xs text-muted-foreground">Suggère des catégories et tags automatiquement</span>
          </Label>
          <Switch
            id="enableAiCategorization"
            checked={options.enableAiCategorization}
            onCheckedChange={() => handleToggle("enableAiCategorization")}
          />
        </div>

        {contentType === "video" && (
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="extractAudio" className="flex flex-col">
              <span>Extraire audio (podcast)</span>
              <span className="text-xs text-muted-foreground">Crée une version audio de la vidéo</span>
            </Label>
            <Switch
              id="extractAudio"
              checked={options.extractAudio}
              onCheckedChange={() => handleToggle("extractAudio")}
            />
          </div>
        )}

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="createThumbnail" className="flex flex-col">
            <span>Créer vignette automatiquement</span>
            <span className="text-xs text-muted-foreground">Génère une image de couverture pour le contenu</span>
          </Label>
          <Switch
            id="createThumbnail"
            checked={options.createThumbnail}
            onCheckedChange={() => handleToggle("createThumbnail")}
          />
        </div>
      </div>
    </div>
  )
}
