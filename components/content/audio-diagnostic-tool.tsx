"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Play, Volume2, AlertCircle, CheckCircle, XCircle, Loader2, Download, Upload } from "lucide-react"

interface AudioDiagnosticToolProps {
  content: any
}

interface DiagnosticResult {
  test: string
  status: "pending" | "success" | "error"
  message: string
  details?: any
}

export default function AudioDiagnosticTool({ content }: AudioDiagnosticToolProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [audioInfo, setAudioInfo] = useState<any>(null)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // URLs de test
  const testUrls = {
    original: content.url || content.audioUrl,
    mp3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    wav: "https://www.w3schools.com/html/horse.wav",
    ogg: "https://www.w3schools.com/html/horse.ogg",
  }

  // Ajouter un résultat de diagnostic
  const addResult = (test: string, status: "pending" | "success" | "error", message: string, details?: any) => {
    setResults((prev) => {
      const newResults = [...prev]
      const existingIndex = newResults.findIndex((r) => r.test === test)

      if (existingIndex >= 0) {
        newResults[existingIndex] = { test, status, message, details }
      } else {
        newResults.push({ test, status, message, details })
      }

      return newResults
    })
  }

  // Test 1: Vérifier le contexte audio
  const testAudioContext = async () => {
    addResult("AudioContext", "pending", "Vérification du contexte audio...")

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        addResult("AudioContext", "error", "AudioContext non supporté par ce navigateur")
        return false
      }

      const context = new AudioContext()

      // Vérifier l'état du contexte
      if (context.state === "suspended") {
        await context.resume()
      }

      // Créer un oscillateur de test
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      gainNode.gain.value = 0.1

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.start()
      setTimeout(() => oscillator.stop(), 100)

      addResult("AudioContext", "success", "AudioContext fonctionne correctement", {
        sampleRate: context.sampleRate,
        state: context.state,
        baseLatency: context.baseLatency,
      })

      context.close()
      return true
    } catch (error) {
      addResult("AudioContext", "error", `Erreur AudioContext: ${(error as Error).message}`)
      return false
    }
  }

  // Test 2: Vérifier les capacités audio du navigateur
  const testBrowserCapabilities = () => {
    addResult("Capacités du navigateur", "pending", "Vérification des capacités audio...")

    const audio = new Audio()
    const capabilities = {
      canPlayMP3: audio.canPlayType("audio/mpeg") !== "",
      canPlayWAV: audio.canPlayType("audio/wav") !== "",
      canPlayOGG: audio.canPlayType("audio/ogg") !== "",
      canPlayAAC: audio.canPlayType("audio/aac") !== "",
      canPlayWEBM: audio.canPlayType("audio/webm") !== "",
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    }

    const supportedFormats = Object.entries(capabilities)
      .filter(([key, value]) => key.startsWith("canPlay") && value)
      .map(([key]) => key.replace("canPlay", ""))

    addResult("Capacités du navigateur", "success", `Formats supportés: ${supportedFormats.join(", ")}`, capabilities)

    return capabilities
  }

  // Test 3: Analyser le fichier audio
  const testAudioFile = async () => {
    addResult("Analyse du fichier", "pending", "Analyse du fichier audio...")

    try {
      const audio = new Audio()
      audio.src = testUrls.original

      await new Promise((resolve, reject) => {
        audio.addEventListener("loadedmetadata", () => {
          const info = {
            duration: audio.duration,
            readyState: audio.readyState,
            networkState: audio.networkState,
            currentSrc: audio.currentSrc,
            error: audio.error,
          }

          setAudioInfo(info)

          if (audio.error) {
            addResult("Analyse du fichier", "error", `Erreur de chargement: ${audio.error.message}`, info)
            reject(audio.error)
          } else {
            addResult(
              "Analyse du fichier",
              "success",
              `Fichier chargé avec succès (${audio.duration.toFixed(2)}s)`,
              info,
            )
            resolve(info)
          }
        })

        audio.addEventListener("error", () => {
          const errorMessages: { [key: number]: string } = {
            1: "Chargement abandonné",
            2: "Erreur réseau",
            3: "Erreur de décodage",
            4: "Format non supporté",
          }

          const errorCode = audio.error?.code || 0
          const errorMsg = errorMessages[errorCode] || "Erreur inconnue"

          addResult("Analyse du fichier", "error", errorMsg, {
            code: errorCode,
            message: audio.error?.message,
          })

          reject(new Error(errorMsg))
        })

        // Timeout après 10 secondes
        setTimeout(() => {
          reject(new Error("Timeout lors du chargement"))
        }, 10000)
      })

      return true
    } catch (error) {
      addResult("Analyse du fichier", "error", `Erreur: ${(error as Error).message}`)
      return false
    }
  }

  // Test 4: Tester différents formats
  const testAudioFormats = async () => {
    addResult("Test des formats", "pending", "Test de différents formats audio...")

    const formatTests = []

    for (const [format, url] of Object.entries(testUrls)) {
      if (!url) continue

      try {
        const audio = new Audio()
        audio.src = url
        audio.volume = 0.1

        await new Promise((resolve, reject) => {
          audio.addEventListener("canplay", () => resolve(true))
          audio.addEventListener("error", () => reject(new Error(`Erreur ${format}`)))

          setTimeout(() => reject(new Error("Timeout")), 5000)
        })

        // Essayer de jouer brièvement
        await audio.play()
        setTimeout(() => audio.pause(), 100)

        formatTests.push({ format, status: "success" })
      } catch (error) {
        formatTests.push({ format, status: "error", error: (error as Error).message })
      }
    }

    const successCount = formatTests.filter((t) => t.status === "success").length

    addResult(
      "Test des formats",
      successCount > 0 ? "success" : "error",
      `${successCount}/${formatTests.length} formats fonctionnent`,
      formatTests,
    )

    return formatTests
  }

  // Test 5: Vérifier le volume système
  const testSystemVolume = async () => {
    addResult("Volume système", "pending", "Vérification du volume...")

    try {
      // Créer un contexte audio pour analyser le volume
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const context = new AudioContext()

      // Créer un oscillateur de test
      const oscillator = context.createOscillator()
      const analyser = context.createAnalyser()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(analyser)
      analyser.connect(context.destination)

      // Configurer l'analyseur
      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Démarrer l'oscillateur
      oscillator.start()
      gainNode.gain.value = 0.5

      // Analyser le volume
      let maxVolume = 0
      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        maxVolume = Math.max(maxVolume, average)
        setVolumeLevel(average)
      }

      // Vérifier pendant 1 seconde
      const interval = setInterval(checkVolume, 50)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      clearInterval(interval)
      oscillator.stop()
      context.close()

      if (maxVolume > 10) {
        addResult("Volume système", "success", "Le système audio fonctionne", { maxVolume })
      } else {
        addResult("Volume système", "error", "Aucun son détecté - vérifiez vos haut-parleurs", { maxVolume })
      }

      return maxVolume > 10
    } catch (error) {
      addResult("Volume système", "error", `Erreur: ${(error as Error).message}`)
      return false
    }
  }

  // Test 6: Essayer de jouer avec différentes méthodes
  const testPlaybackMethods = async () => {
    addResult("Méthodes de lecture", "pending", "Test de différentes méthodes de lecture...")

    const methods = []

    // Méthode 1: Audio standard
    try {
      const audio = new Audio(testUrls.original)
      audio.volume = 0.5
      await audio.play()
      setTimeout(() => audio.pause(), 500)
      methods.push({ method: "Audio standard", status: "success" })
    } catch (error) {
      methods.push({ method: "Audio standard", status: "error", error: (error as Error).message })
    }

    // Méthode 2: Avec user gesture
    try {
      await new Promise((resolve, reject) => {
        const button = document.createElement("button")
        button.style.display = "none"
        document.body.appendChild(button)

        button.addEventListener("click", async () => {
          try {
            const audio = new Audio(testUrls.original)
            audio.volume = 0.5
            await audio.play()
            setTimeout(() => audio.pause(), 500)
            resolve(true)
          } catch (error) {
            reject(error)
          }
        })

        button.click()
        document.body.removeChild(button)
      })

      methods.push({ method: "Avec interaction utilisateur", status: "success" })
    } catch (error) {
      methods.push({ method: "Avec interaction utilisateur", status: "error", error: (error as Error).message })
    }

    const successCount = methods.filter((m) => m.status === "success").length

    addResult(
      "Méthodes de lecture",
      successCount > 0 ? "success" : "error",
      `${successCount}/${methods.length} méthodes fonctionnent`,
      methods,
    )

    return methods
  }

  // Exécuter tous les tests
  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    // Exécuter les tests dans l'ordre
    await testAudioContext()
    testBrowserCapabilities()
    await testAudioFile()
    await testAudioFormats()
    await testSystemVolume()
    await testPlaybackMethods()

    setIsRunning(false)
  }

  // Télécharger le fichier pour test local
  const downloadFile = async () => {
    try {
      const response = await fetch(testUrls.original)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "test-audio.wav"
      a.click()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
    }
  }

  // Tester avec un fichier local
  const testLocalFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const audio = audioRef.current

    if (audio) {
      audio.src = url
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          addResult("Fichier local", "success", `Lecture de ${file.name} réussie`)
        })
        .catch((error) => {
          addResult("Fichier local", "error", `Erreur: ${error.message}`)
        })
    }
  }

  // Obtenir l'icône de statut
  const getStatusIcon = (status: "pending" | "success" | "error") => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Outil de Diagnostic Audio Complet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio caché pour les tests */}
        <audio ref={audioRef} className="hidden" />

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={runDiagnostics} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Lancer le diagnostic
              </>
            )}
          </Button>

          <Button variant="outline" onClick={downloadFile} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Télécharger le fichier
          </Button>

          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={testLocalFile}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Tester un fichier local
            </Button>
          </div>
        </div>

        {/* Indicateur de volume */}
        {volumeLevel > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="text-sm">Niveau de volume détecté:</span>
            </div>
            <Progress value={volumeLevel} max={255} className="h-2" />
          </div>
        )}

        {/* Résultats des tests */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Résultats du diagnostic:</h3>

            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{result.test}</div>
                  <div className="text-sm text-gray-600">{result.message}</div>

                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Voir les détails</summary>
                      <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informations sur le fichier */}
        {audioInfo && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Informations sur le fichier audio</AlertTitle>
            <AlertDescription>
              <div className="text-xs space-y-1 mt-2">
                <div>Durée: {audioInfo.duration?.toFixed(2) || "N/A"} secondes</div>
                <div>État de préparation: {audioInfo.readyState}</div>
                <div>État réseau: {audioInfo.networkState}</div>
                <div>URL: {audioInfo.currentSrc?.substring(0, 50)}...</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommandations */}
        {results.length > 0 && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Recommandations</AlertTitle>
            <AlertDescription className="text-blue-700">
              {results.some((r) => r.test === "Volume système" && r.status === "error") && (
                <p>• Vérifiez que vos haut-parleurs sont allumés et que le volume n'est pas à zéro.</p>
              )}

              {results.some((r) => r.test === "Analyse du fichier" && r.status === "error") && (
                <p>
                  • Le fichier audio semble corrompu ou dans un format non supporté. Essayez de le convertir en MP3.
                </p>
              )}

              {results.some(
                (r) =>
                  r.test === "Test des formats" &&
                  r.details?.find((d: any) => d.format === "mp3" && d.status === "success"),
              ) && (
                <p>
                  • Votre navigateur supporte le MP3. Convertissez vos fichiers WAV en MP3 pour une meilleure
                  compatibilité.
                </p>
              )}

              {results.every((r) => r.status === "success") && (
                <p className="text-green-700">
                  • Tous les tests sont passés avec succès. Si vous n'entendez toujours pas le son, vérifiez les
                  paramètres de votre système d'exploitation.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
