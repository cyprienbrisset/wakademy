"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { ContentMetadata } from "@/lib/upload/types"

interface MetadataFormProps {
  metadata: ContentMetadata
  setMetadata: (metadata: ContentMetadata) => void
  fileType: string
}

const CATEGORIES = [
  "Business",
  "Marketing",
  "Finance",
  "Leadership",
  "Développement personnel",
  "Technologie",
  "Design",
  "Productivité",
  "Communication",
  "Ventes",
]

const LANGUAGES = [
  { code: "fr", name: "Français" },
  { code: "en", name: "Anglais" },
  { code: "es", name: "Espagnol" },
  { code: "de", name: "Allemand" },
  { code: "it", name: "Italien" },
]

export default function MetadataForm({ metadata, setMetadata, fileType }: MetadataFormProps) {
  const [tagInput, setTagInput] = useState("")

  const getContentType = () => {
    if (fileType.startsWith("video/")) return "video"
    if (fileType.startsWith("audio/")) return "podcast"
    return "document"
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!metadata.tags.includes(tagInput.trim())) {
        setMetadata({
          ...metadata,
          tags: [...metadata.tags, tagInput.trim()],
        })
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter((t) => t !== tag),
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Métadonnées</h3>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            placeholder="Titre du contenu"
            value={metadata.title}
            onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Description du contenu"
            value={metadata.description || ""}
            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={metadata.type || getContentType()}
              onValueChange={(value) => setMetadata({ ...metadata, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="podcast">Podcast</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="language">Langue</Label>
            <Select value={metadata.language} onValueChange={(value) => setMetadata({ ...metadata, language: value })}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="author">Auteur</Label>
            <Input
              id="author"
              placeholder="Nom de l'auteur"
              value={metadata.author || ""}
              onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select
              value={metadata.category || ""}
              onValueChange={(value) => setMetadata({ ...metadata, category: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {metadata.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
              </Badge>
            ))}
          </div>
          <Input
            id="tags"
            placeholder="Ajouter des tags (Entrée pour valider)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
        </div>
      </div>
    </div>
  )
}
