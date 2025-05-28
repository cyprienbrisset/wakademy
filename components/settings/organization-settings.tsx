"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Upload, Trash2, Plus, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function OrganizationSettings() {
  const { toast } = useToast()
  const [organization, setOrganization] = useState({
    name: "Wakademy Corp",
    type: "enterprise",
    description: "Plateforme de formation et de partage de connaissances pour les entreprises modernes.",
    website: "https://wakademy.com",
  })

  const [groups, setGroups] = useState([
    { id: 1, name: "Direction", members: 5, color: "blue" },
    { id: 2, name: "Développement", members: 12, color: "green" },
    { id: 3, name: "Marketing", members: 8, color: "purple" },
    { id: 4, name: "Support", members: 6, color: "orange" },
  ])

  const handleSave = () => {
    toast({
      title: "Organisation mise à jour",
      description: "Les informations de l'organisation ont été sauvegardées.",
    })
  }

  const addGroup = () => {
    const newGroup = {
      id: Date.now(),
      name: "Nouveau groupe",
      members: 0,
      color: "gray",
    }
    setGroups([...groups, newGroup])
  }

  const removeGroup = (id: number) => {
    setGroups(groups.filter((group) => group.id !== id))
    toast({
      title: "Groupe supprimé",
      description: "Le groupe a été supprimé avec succès.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'organisation</CardTitle>
          <CardDescription>Configurez les détails de votre organisation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Nom de l'organisation</Label>
              <Input
                id="org-name"
                value={organization.name}
                onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-type">Type d'organisation</Label>
              <Select
                value={organization.type}
                onValueChange={(value) => setOrganization({ ...organization, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enterprise">Entreprise</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                  <SelectItem value="school">École</SelectItem>
                  <SelectItem value="government">Gouvernement</SelectItem>
                  <SelectItem value="nonprofit">Organisation à but non lucratif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-website">Site web</Label>
            <Input
              id="org-website"
              type="url"
              value={organization.website}
              onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description</Label>
            <Textarea
              id="org-description"
              rows={3}
              value={organization.description}
              onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo de l'organisation</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cliquez pour uploader le logo</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Groupes de collaborateurs</CardTitle>
          <CardDescription>Organisez vos utilisateurs en groupes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Créez des groupes pour organiser vos collaborateurs et gérer les permissions.
            </p>
            <Button onClick={addGroup} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un groupe
            </Button>
          </div>

          <div className="grid gap-3">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full bg-${group.color}-500`} />
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.members} membres</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{group.members}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGroup(group.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zone de danger
          </CardTitle>
          <CardDescription>Actions irréversibles pour votre instance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Supprimer l'instance</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Cette action supprimera définitivement votre instance Wakademy, tous les contenus, utilisateurs et
                paramètres. Cette action est irréversible.
              </p>
              <Button variant="destructive" size="sm">
                Supprimer l'instance
              </Button>
            </div>
          </div>
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
