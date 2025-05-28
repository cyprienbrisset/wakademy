"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, AlertCircle, CheckCircle } from "lucide-react"

interface AudioDebugProps {
  audioUrl: string
}

export function AudioDebug({ audioUrl }: AudioDebugProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testResults, setTestResults] = useState<{ success: boolean; message: string } | null>(null)
  const [customUrl, setCustomUrl] = useState(audioUrl)

  const testAudio = async (url: string) => {
    try {
      setTestResults(null)

      // Vérifier si l'URL est valide
      if (!url) {
        setTestResults({ success: false, message: "L'URL est vide" })
        return
      }

      // Créer un élément audio pour tester
      const audio = new Audio(url)

      // Définir un délai maximum pour le chargement
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error("Délai d'attente dépassé")), 10000)
      })

      // Attendre que l'audio soit chargé ou qu'une erreur se produise
      const loadPromise = new Promise<void>((resolve, reject) => {
        audio.oncanplaythrough = () => resolve()
        audio.onerror = (e) => reject(new Error(`Erreur de chargement: ${audio.error?.message || "Inconnue"}`))
      })

      // Utiliser Promise.race pour limiter le temps d'attente
      await Promise.race([loadPromise, timeoutPromise])

      setTestResults({
        success: true,
        message: `Audio chargé avec succès. Durée: ${audio.duration ? audio.duration.toFixed(2) + "s" : "Inconnue"}`,
      })
    } catch (error) {
      setTestResults({
        success: false,
        message: `Échec du chargement: ${(error as Error).message}`,
      })
    }
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <InfoIcon className="h-4 w-4 mr-2" />
        Déboguer l'audio
      </Button>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Débogage Audio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">URL audio actuelle:</p>
            <code className="block p-2 bg-muted rounded-md text-xs overflow-x-auto">{audioUrl || "Non définie"}</code>
          </div>

          <div className="flex gap-2">
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="URL audio à tester"
              className="flex-1"
            />
            <Button onClick={() => testAudio(customUrl)}>Tester</Button>
          </div>

          {testResults && (
            <Alert variant={testResults.success ? "default" : "destructive"}>
              {testResults.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{testResults.success ? "Succès" : "Échec"}</AlertTitle>
              <AlertDescription>{testResults.message}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm space-y-2">
            <p className="font-medium">Conseils de débogage:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vérifiez que l'URL pointe vers un fichier audio valide (MP3, WAV, etc.)</li>
              <li>Assurez-vous que le fichier est accessible publiquement</li>
              <li>Vérifiez les en-têtes CORS du serveur</li>
              <li>Essayez d'ouvrir l'URL directement dans un nouvel onglet</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Fermer
        </Button>
      </CardFooter>
    </Card>
  )
}
