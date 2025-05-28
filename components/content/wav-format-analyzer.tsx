"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  Volume2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  FileAudio,
  RefreshCw,
} from "lucide-react"

interface WavFormatAnalyzerProps {
  audioUrl: string
}

export default function WavFormatAnalyzer({ audioUrl }: WavFormatAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [wavInfo, setWavInfo] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)
  const [logs, setLogs] = useState<string[]>([])
  const [testResults, setTestResults] = useState<any[]>([])
  const [isAudioDetected, setIsAudioDetected] = useState(false)
  const [selectedTab, setSelectedTab] = useState("analyzer")

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Ajouter un log
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString().substr(11, 8)}] ${message}`])
  }

  // Initialiser l'analyseur audio
  useEffect(() => {
    if (!audioRef.current) return

    // Configurer les événements audio
    const audio = audioRef.current

    const events = [
      "loadstart",
      "durationchange",
      "loadedmetadata",
      "loadeddata",
      "progress",
      "canplay",
      "canplaythrough",
      "error",
      "stalled",
      "waiting",
      "playing",
      "timeupdate",
      "ended",
      "ratechange",
    ]

    const handleEvent = (event: Event) => {
      addLog(`Événement audio: ${event.type}`)

      if (event.type === "error" && audio.error) {
        addLog(`Erreur audio: ${audio.error.code} - ${getErrorMessage(audio.error.code)}`)
      }

      if (event.type === "loadedmetadata") {
        setDuration(audio.duration)
      }

      if (event.type === "timeupdate") {
        setCurrentTime(audio.currentTime)
      }

      if (event.type === "playing") {
        setIsPlaying(true)
      }

      if (event.type === "pause" || event.type === "ended") {
        setIsPlaying(false)
      }
    }

    events.forEach((event) => {
      audio.addEventListener(event, handleEvent)
    })

    // Configurer l'analyseur audio
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 2048

      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio)
      sourceNodeRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)

      addLog("Analyseur audio initialisé avec succès")
    } catch (error) {
      addLog(`Erreur d'initialisation de l'analyseur: ${(error as Error).message}`)
    }

    // Nettoyer
    return () => {
      events.forEach((event) => {
        audio.removeEventListener(event, handleEvent)
      })

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Analyser le format WAV
  const analyzeWavFormat = async () => {
    setIsAnalyzing(true)
    addLog("Début de l'analyse du fichier WAV...")

    try {
      const response = await fetch(audioUrl)
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const wavInfo = parseWavHeader(arrayBuffer)
      setWavInfo(wavInfo)

      addLog(`Analyse terminée: ${JSON.stringify(wavInfo)}`)

      // Tester la compatibilité
      testWavCompatibility(wavInfo)
    } catch (error) {
      addLog(`Erreur d'analyse: ${(error as Error).message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Parser l'en-tête WAV
  const parseWavHeader = (arrayBuffer: ArrayBuffer) => {
    const view = new DataView(arrayBuffer)

    // Vérifier la signature RIFF
    const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3))
    if (riff !== "RIFF") {
      throw new Error("Format non valide: signature RIFF manquante")
    }

    // Vérifier le format WAVE
    const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11))
    if (wave !== "WAVE") {
      throw new Error("Format non valide: signature WAVE manquante")
    }

    // Trouver le chunk fmt
    let offset = 12
    let fmtSize = 0

    while (offset < view.byteLength) {
      const chunkType = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3),
      )

      const chunkSize = view.getUint32(offset + 4, true)

      if (chunkType === "fmt ") {
        fmtSize = chunkSize
        break
      }

      offset += 8 + chunkSize
    }

    if (fmtSize === 0) {
      throw new Error("Format non valide: chunk fmt manquant")
    }

    offset += 8 // Sauter l'en-tête du chunk

    // Lire les informations du format
    const audioFormat = view.getUint16(offset, true)
    const numChannels = view.getUint16(offset + 2, true)
    const sampleRate = view.getUint32(offset + 4, true)
    const byteRate = view.getUint32(offset + 8, true)
    const blockAlign = view.getUint16(offset + 12, true)
    const bitsPerSample = view.getUint16(offset + 14, true)

    // Formats audio connus
    const formatNames: { [key: number]: string } = {
      1: "PCM (non compressé)",
      2: "Microsoft ADPCM",
      3: "IEEE float",
      6: "A-law",
      7: "μ-law",
      17: "IMA ADPCM",
      20: "G.723 ADPCM",
      49: "GSM 6.10",
      64: "G.721 ADPCM",
      80: "MPEG",
      65534: "Extensible",
    }

    return {
      fileSize: arrayBuffer.byteLength,
      audioFormat,
      formatName: formatNames[audioFormat] || `Format inconnu (${audioFormat})`,
      numChannels,
      sampleRate,
      byteRate,
      blockAlign,
      bitsPerSample,
      duration: arrayBuffer.byteLength / byteRate,
    }
  }

  // Tester la compatibilité du format WAV
  const testWavCompatibility = (wavInfo: any) => {
    const results = []

    // Test 1: Format audio
    const isPCM = wavInfo.audioFormat === 1
    results.push({
      name: "Format audio",
      result: isPCM ? "success" : "warning",
      message: isPCM
        ? "PCM non compressé (compatible avec tous les navigateurs)"
        : `Format ${wavInfo.formatName} (peut ne pas être supporté par tous les navigateurs)`,
    })

    // Test 2: Taux d'échantillonnage
    const isStandardRate = [8000, 11025, 16000, 22050, 32000, 44100, 48000, 88200, 96000].includes(wavInfo.sampleRate)
    results.push({
      name: "Taux d'échantillonnage",
      result: isStandardRate ? "success" : "warning",
      message: isStandardRate
        ? `${wavInfo.sampleRate} Hz (taux standard)`
        : `${wavInfo.sampleRate} Hz (taux non standard, peut causer des problèmes)`,
    })

    // Test 3: Bits par échantillon
    const isStandardBits = [8, 16, 24, 32].includes(wavInfo.bitsPerSample)
    results.push({
      name: "Bits par échantillon",
      result: isStandardBits ? "success" : "warning",
      message: isStandardBits
        ? `${wavInfo.bitsPerSample} bits (standard)`
        : `${wavInfo.bitsPerSample} bits (non standard, peut causer des problèmes)`,
    })

    // Test 4: Nombre de canaux
    const isStandardChannels = [1, 2].includes(wavInfo.numChannels)
    results.push({
      name: "Canaux audio",
      result: isStandardChannels ? "success" : "warning",
      message: isStandardChannels
        ? `${wavInfo.numChannels} ${wavInfo.numChannels === 1 ? "canal" : "canaux"} (standard)`
        : `${wavInfo.numChannels} canaux (non standard, peut causer des problèmes)`,
    })

    // Test 5: Taille du fichier
    const isReasonableSize = wavInfo.fileSize < 10 * 1024 * 1024 // Moins de 10 Mo
    results.push({
      name: "Taille du fichier",
      result: isReasonableSize ? "success" : "warning",
      message: isReasonableSize
        ? `${(wavInfo.fileSize / 1024 / 1024).toFixed(2)} Mo (taille raisonnable)`
        : `${(wavInfo.fileSize / 1024 / 1024).toFixed(2)} Mo (fichier volumineux, peut causer des problèmes de chargement)`,
    })

    setTestResults(results)
  }

  // Obtenir le message d'erreur pour le code d'erreur audio
  const getErrorMessage = (code: number) => {
    switch (code) {
      case 1:
        return "Le chargement a été interrompu"
      case 2:
        return "Erreur réseau"
      case 3:
        return "Erreur de décodage"
      case 4:
        return "Format non supporté"
      default:
        return "Erreur inconnue"
    }
  }

  // Détecter si l'audio est joué
  const detectAudioOutput = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const checkAudio = () => {
      analyserRef.current?.getByteFrequencyData(dataArray)

      // Calculer la moyenne des fréquences
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength

      if (average > 10) {
        setIsAudioDetected(true)
        addLog(`Son détecté! Niveau moyen: ${average.toFixed(2)}`)
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(checkAudio)
      }
    }

    animationFrameRef.current = requestAnimationFrame(checkAudio)
  }

  // Contrôles de lecture
  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (audio.paused) {
        addLog(`Tentative de lecture... État actuel: paused=${audio.paused}, readyState=${audio.readyState}`)

        // Réinitialiser le contexte audio si nécessaire
        if (audioContextRef.current?.state === "suspended") {
          await audioContextRef.current.resume()
          addLog("Contexte audio repris")
        }

        // Démarrer la détection audio
        detectAudioOutput()

        // Jouer l'audio
        await audio.play()
        addLog("Lecture démarrée avec succès")
        setIsPlaying(true)
      } else {
        audio.pause()
        addLog("Lecture mise en pause")
        setIsPlaying(false)

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    } catch (error) {
      addLog(`Erreur de lecture: ${(error as Error).message}`)
    }
  }

  // Changer le volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)

    if (audioRef.current) {
      audioRef.current.volume = newVolume
      addLog(`Volume changé à ${newVolume.toFixed(2)}`)
    }
  }

  // Tester avec un fichier MP3 de référence
  const testWithReferenceMp3 = () => {
    if (!audioRef.current) return

    const testUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    audioRef.current.src = testUrl
    addLog(`Chargement du fichier MP3 de référence: ${testUrl}`)

    // Réinitialiser les états
    setIsPlaying(false)
    setIsAudioDetected(false)
    setCurrentTime(0)
  }

  // Recharger le fichier WAV original
  const reloadOriginalWav = () => {
    if (!audioRef.current) return

    audioRef.current.src = audioUrl
    addLog(`Rechargement du fichier WAV original: ${audioUrl}`)

    // Réinitialiser les états
    setIsPlaying(false)
    setIsAudioDetected(false)
    setCurrentTime(0)
  }

  // Formater le temps
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          Analyseur de Format WAV
        </CardTitle>
        <CardDescription>
          Cet outil analyse votre fichier WAV pour identifier les problèmes de compatibilité
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Lecteur audio caché */}
        <audio ref={audioRef} src={audioUrl} className="hidden" preload="metadata" crossOrigin="anonymous" />

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="player">Lecteur</TabsTrigger>
            <TabsTrigger value="analyzer">Analyseur</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Onglet Lecteur */}
          <TabsContent value="player" className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Button onClick={togglePlay} variant="outline" size="sm" className="w-24">
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" /> Lecture
                    </>
                  )}
                </Button>

                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <Progress value={(currentTime / duration) * 100} className="h-2" />

              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={testWithReferenceMp3} variant="outline" size="sm">
                Tester avec MP3 de référence
              </Button>

              <Button onClick={reloadOriginalWav} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger WAV original
              </Button>
            </div>

            {isAudioDetected && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Son détecté!</AlertTitle>
                <AlertDescription className="text-green-700">
                  L'analyseur a détecté du son en sortie. Si vous n'entendez rien, vérifiez le volume de votre système.
                </AlertDescription>
              </Alert>
            )}

            {isPlaying && !isAudioDetected && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Aucun son détecté</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  L'audio est en cours de lecture mais aucun son n'est détecté. Cela peut indiquer un problème avec le
                  format du fichier.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Onglet Analyseur */}
          <TabsContent value="analyzer" className="space-y-4">
            <Button onClick={analyzeWavFormat} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyse en cours...
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 mr-2" /> Analyser le format WAV
                </>
              )}
            </Button>

            {wavInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Format:</div>
                  <div>{wavInfo.formatName}</div>

                  <div className="font-medium">Canaux:</div>
                  <div>{wavInfo.numChannels}</div>

                  <div className="font-medium">Taux d'échantillonnage:</div>
                  <div>{wavInfo.sampleRate} Hz</div>

                  <div className="font-medium">Bits par échantillon:</div>
                  <div>{wavInfo.bitsPerSample} bits</div>

                  <div className="font-medium">Débit binaire:</div>
                  <div>{Math.round((wavInfo.byteRate * 8) / 1000)} kbps</div>

                  <div className="font-medium">Taille du fichier:</div>
                  <div>{(wavInfo.fileSize / 1024 / 1024).toFixed(2)} Mo</div>

                  <div className="font-medium">Durée estimée:</div>
                  <div>{formatTime(wavInfo.duration)}</div>
                </div>

                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Résultats des tests de compatibilité:</h3>

                    {testResults.map((test, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                        {test.result === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        ) : test.result === "warning" ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        )}

                        <div>
                          <div className="text-sm font-medium">{test.name}</div>
                          <div className="text-xs text-gray-600">{test.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Recommandation</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    {wavInfo.audioFormat !== 1 ? (
                      <p>
                        Ce fichier WAV utilise un format compressé qui n'est pas bien supporté par les navigateurs.
                        Convertissez-le en PCM non compressé ou en MP3.
                      </p>
                    ) : ![8000, 11025, 16000, 22050, 32000, 44100, 48000].includes(wavInfo.sampleRate) ? (
                      <p>
                        Ce fichier utilise un taux d'échantillonnage non standard ({wavInfo.sampleRate} Hz).
                        Convertissez-le en 44100 Hz ou 48000 Hz pour une meilleure compatibilité.
                      </p>
                    ) : wavInfo.bitsPerSample > 16 ? (
                      <p>
                        Ce fichier utilise {wavInfo.bitsPerSample} bits par échantillon, ce qui peut poser des
                        problèmes. Convertissez-le en 16 bits pour une meilleure compatibilité.
                      </p>
                    ) : wavInfo.numChannels > 2 ? (
                      <p>
                        Ce fichier utilise {wavInfo.numChannels} canaux audio, ce qui n'est pas standard.
                        Convertissez-le en stéréo (2 canaux) ou mono (1 canal).
                      </p>
                    ) : wavInfo.fileSize > 5 * 1024 * 1024 ? (
                      <p>
                        Ce fichier WAV est volumineux ({(wavInfo.fileSize / 1024 / 1024).toFixed(2)} Mo).
                        Convertissez-le en MP3 pour réduire sa taille et améliorer la compatibilité.
                      </p>
                    ) : (
                      <p>
                        Ce fichier WAV semble utiliser un format standard, mais les navigateurs peuvent avoir des
                        problèmes avec certains fichiers WAV. Essayez de le convertir en MP3 pour une meilleure
                        compatibilité.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          {/* Onglet Logs */}
          <TabsContent value="logs">
            <div className="bg-gray-100 p-2 rounded-md h-64 overflow-y-auto text-xs font-mono">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">
                  Aucun log disponible. Utilisez les fonctionnalités ci-dessus pour générer des logs.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="py-0.5">
                    {log}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
