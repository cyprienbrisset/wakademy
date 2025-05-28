"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Volume2, VolumeX, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface AudioTroubleshooterButtonProps {
  audioUrl?: string
  title?: string
}

export default function AudioTroubleshooterButton({ audioUrl, title }: AudioTroubleshooterButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [testResults, setTestResults] = useState<
    { name: string; status: "success" | "error" | "warning" | "pending" }[]
  >([])
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [useMp3Test, setUseMp3Test] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handlePlayPause = () => {
    if (!audioElement) return

    if (isPlaying) {
      audioElement.pause()
      setIsPlaying(false)
      addLog("Audio pausé")
    } else {
      audioElement
        .play()
        .then(() => {
          setIsPlaying(true)
          addLog("Lecture démarrée avec succès")
        })
        .catch((error) => {
          addLog(`Erreur de lecture: ${error.message}`)
          console.error("Erreur de lecture:", error)
        })
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioElement) {
      audioElement.volume = newVolume / 100
      addLog(`Volume ajusté à ${newVolume}%`)
    }
  }

  const handleAudioRef = (element: HTMLAudioElement | null) => {
    if (element) {
      setAudioElement(element)
      element.volume = volume / 100

      // Ajouter des écouteurs d'événements
      const events = [
        "loadstart",
        "durationchange",
        "loadedmetadata",
        "loadeddata",
        "progress",
        "canplay",
        "canplaythrough",
        "error",
      ]

      events.forEach((event) => {
        element.addEventListener(event, () => {
          addLog(`Événement audio: ${event}`)
          if (event === "error") {
            addLog(`Erreur de chargement audio: ${element.error?.message || "Erreur inconnue"}`)
          }
        })
      })

      addLog("Élément audio initialisé")
    }
  }

  const runTests = async () => {
    setIsTestRunning(true)
    setTestResults([])
    addLog("Démarrage des tests de diagnostic audio...")

    // Test 1: Vérifier si l'API Audio est supportée
    setTestResults((prev) => [...prev, { name: "Support API Audio", status: "pending" }])
    if (typeof Audio !== "undefined") {
      setTestResults((prev) => {
        const newResults = [...prev]
        newResults[0] = { name: "Support API Audio", status: "success" }
        return newResults
      })
      addLog("✅ API Audio supportée")
    } else {
      setTestResults((prev) => {
        const newResults = [...prev]
        newResults[0] = { name: "Support API Audio", status: "error" }
        return newResults
      })
      addLog("❌ API Audio non supportée")
    }

    // Test 2: Vérifier si le format WAV est supporté
    setTestResults((prev) => [...prev, { name: "Support format WAV", status: "pending" }])
    const audio = new Audio()
    const canPlayWav = audio.canPlayType("audio/wav")
    if (canPlayWav) {
      setTestResults((prev) => {
        const newResults = [...prev]
        newResults[1] = { name: "Support format WAV", status: canPlayWav === "probably" ? "success" : "warning" }
        return newResults
      })
      addLog(`${canPlayWav === "probably" ? "✅" : "⚠️"} Support WAV: ${canPlayWav}`)
    } else {
      setTestResults((prev) => {
        const newResults = [...prev]
        newResults[1] = { name: "Support format WAV", status: "error" }
        return newResults
      })
      addLog("❌ Format WAV non supporté")
    }

    // Test 3: Vérifier si le fichier peut être chargé
    setTestResults((prev) => [...prev, { name: "Chargement du fichier", status: "pending" }])
    try {
      if (!audioUrl) {
        setTestResults((prev) => {
          const newResults = [...prev]
          newResults[2] = { name: "Chargement du fichier", status: "error" }
          return newResults
        })
        addLog("❌ Aucune URL de fichier fournie")
      } else {
        const response = await fetch(audioUrl, { method: "HEAD" })
        if (response.ok) {
          setTestResults((prev) => {
            const newResults = [...prev]
            newResults[2] = { name: "Chargement du fichier", status: "success" }
            return newResults
          })
          addLog(`✅ Fichier accessible: ${response.status}`)
        } else {
          setTestResults((prev) => {
            const newResults = [...prev]
            newResults[2] = { name: "Chargement du fichier", status: "error" }
            return newResults
          })
          addLog(`❌ Fichier inaccessible: ${response.status}`)
        }
      }
    } catch (error) {
      setTestResults((prev) => {
        const newResults = [...prev]
        newResults[2] = { name: "Chargement du fichier", status: "error" }
        return newResults
      })
      addLog(`❌ Erreur d'accès au fichier: ${(error as Error).message}`)
    }

    // Test 4: Vérifier si le son est activé
    setTestResults((prev) => [...prev, { name: "Sortie audio", status: "pending" }])
    if (audioElement) {
      if (!audioElement.muted) {
        setTestResults((prev) => {
          const newResults = [...prev]
          newResults[3] = { name: "Sortie audio", status: "success" }
          return newResults
        })
        addLog("✅ Son non coupé")
      } else {
        setTestResults((prev) => {
          const newResults = [...prev]
          newResults[3] = { name: "Sortie audio", status: "error" }
          return newResults
        })
        addLog("❌ Son coupé")
      }
    }

    setIsTestRunning(false)
    addLog("Tests terminés")
  }

  const useMp3TestFile = () => {
    setUseMp3Test(true)
    addLog("Utilisation du fichier MP3 de test")
  }

  const useOriginalFile = () => {
    setUseMp3Test(false)
    addLog("Retour au fichier WAV original")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="mt-4 w-full">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Problème de lecture audio ? Cliquez ici
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Diagnostic de lecture audio</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="player">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="player">Lecteur</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="player" className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">{useMp3Test ? "Fichier MP3 de test" : title}</h3>
              <audio
                ref={handleAudioRef}
                src={useMp3Test ? "/test-audio.mp3" : audioUrl}
                crossOrigin="anonymous"
                preload="auto"
                className="hidden"
              />
              <div className="flex items-center gap-4 mb-4">
                <Button onClick={handlePlayPause} variant="outline" size="icon">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex items-center gap-2 flex-1">
                  {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1" />
                  <span className="text-sm">{volume}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                {!useMp3Test ? (
                  <Button onClick={useMp3TestFile} variant="outline" size="sm">
                    Tester avec MP3 de référence
                  </Button>
                ) : (
                  <Button onClick={useOriginalFile} variant="outline" size="sm">
                    Revenir au fichier WAV
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tests" className="space-y-4">
            <Button onClick={runTests} disabled={isTestRunning}>
              {isTestRunning ? "Tests en cours..." : "Lancer les tests de diagnostic"}
            </Button>
            <div className="space-y-2">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                  {test.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {test.status === "error" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {test.status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {test.status === "pending" && <Info className="h-4 w-4 text-blue-500" />}
                  <span>{test.name}</span>
                </div>
              ))}
            </div>
            {testResults.length > 0 && (
              <div className="bg-muted p-4 rounded-md mt-4">
                <h3 className="font-medium mb-2">Recommandations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {testResults.some((t) => t.name === "Support format WAV" && t.status !== "success") && (
                    <li>Convertissez votre fichier WAV en MP3 pour une meilleure compatibilité</li>
                  )}
                  {testResults.some((t) => t.name === "Chargement du fichier" && t.status !== "success") && (
                    <li>Vérifiez que l'URL du fichier est correcte et accessible</li>
                  )}
                  {testResults.some((t) => t.name === "Sortie audio" && t.status !== "success") && (
                    <li>Vérifiez que le son n'est pas coupé sur votre système</li>
                  )}
                </ul>
              </div>
            )}
          </TabsContent>
          <TabsContent value="logs" className="h-[300px] overflow-y-auto bg-muted p-4 rounded-md">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">Aucun log disponible. Utilisez le lecteur ou lancez les tests.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono">
                  {log}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
