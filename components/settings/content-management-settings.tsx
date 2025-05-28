"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, Trash2, FileText, Video, Music, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ContentManagementSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    maxDuration: 120,
    autoApproval: false,
    aiModeration: true,
    allowedFormats: ["mp4", "pdf", "mp3", "jpg", "png"],
  })

  const [categories, setCategories] = useState([
    { id: 1, name: "Leadership", color: "blue", count: 15 },
    { id: 2, name: "Développement", color: "green", count: 23 },
    { id: 3, name: "Marketing", color: "purple", count: 18 },
    { id: 4, name: "Finance", color: "orange", count: 12 },
  ])

  const [newCategory, setNewCategory] = useState("")

  const handleSave = () => {
    toast({
      title: "Paramètres de contenu sauvegardés",
      description: "Les paramètres de gestion du contenu ont été mis à jour.",
    })
  }

  const addCategory = () => {
    if (newCategory.trim()) {
      const category = {
        id: Date.now(),
        name: newCategory,
        color: "gray",
        count: 0,
      }
      setCategories([...categories, category])
      setNewCategory("")
      toast({
        title: "Catégorie ajoutée",
        description: `La catégorie "${newCategory}" a été créée.`,
      })
    }
  }

  const removeCategory = (id: number) => {
    setCategories(categories.filter((cat) => cat.id !== id))
    toast({
      title: "Catégorie supprimée",
      description: "La catégorie a été supprimée avec succès.",
    })
  }

  const formatIcons = {
    mp4: Video,
    pdf: FileText,
    mp3: Music,
    jpg: ImageIcon,
    png: ImageIcon,
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catégories de contenu</CardTitle>
          <CardDescription>Organisez votre contenu en catégories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nom de la nouvelle catégorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCategory()}
            />
            <Button onClick={addCategory} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </div>

          <div className="grid gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${category.color}-500`} />
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline">{category.count} contenus</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCategory(category.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formats autorisés</CardTitle>
          <CardDescription>Définissez les types de fichiers acceptés</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(formatIcons).map(([format, Icon]) => (
              <div key={format} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={format}
                  checked={settings.allowedFormats.includes(format)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings({
                        ...settings,
                        allowedFormats: [...settings.allowedFormats, format],
                      })
                    } else {
                      setSettings({
                        ...settings,
                        allowedFormats: settings.allowedFormats.filter((f) => f !== format),
                      })
                    }
                  }}
                  className="rounded"
                />
                <label htmlFor={format} className="flex items-center gap-2 cursor-pointer">
                  <Icon className="h-4 w-4" />
                  <span className="uppercase">{format}</span>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de contenu</CardTitle>
          <CardDescription>Configurez les règles de publication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max-duration">Durée maximale (minutes)</Label>
            <Input
              id="max-duration"
              type="number"
              value={settings.maxDuration}
              onChange={(e) => setSettings({ ...settings, maxDuration: Number.parseInt(e.target.value) })}
            />
            <p className="text-sm text-muted-foreground">Durée maximale autorisée pour les contenus vidéo et audio</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Approbation automatique</Label>
              <p className="text-sm text-muted-foreground">
                Publier automatiquement les nouveaux contenus sans validation manuelle
              </p>
            </div>
            <Switch
              checked={settings.autoApproval}
              onCheckedChange={(checked) => setSettings({ ...settings, autoApproval: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modération par IA</Label>
              <p className="text-sm text-muted-foreground">
                Utiliser l'IA pour détecter automatiquement le contenu inapproprié
              </p>
            </div>
            <Switch
              checked={settings.aiModeration}
              onCheckedChange={(checked) => setSettings({ ...settings, aiModeration: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags IA existants</CardTitle>
          <CardDescription>Visualisez et modifiez les tags générés automatiquement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "leadership",
              "management",
              "communication",
              "stratégie",
              "innovation",
              "digital",
              "transformation",
              "équipe",
              "productivité",
              "formation",
              "développement",
              "compétences",
              "performance",
              "motivation",
              "coaching",
            ].map((tag) => (
              <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-muted">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Ces tags sont générés automatiquement par l'IA lors de l'analyse du contenu.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder
        </Button>
      </div>
    </div>
  )
}
