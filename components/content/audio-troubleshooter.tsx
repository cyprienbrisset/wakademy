"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader2, AlertCircle } from "lucide-react"

interface AudioTroubleshooterProps {
  content: any
}

export default function AudioTroubleshooter({ content }: AudioTroubleshooterProps) {
  // Audio elements for different testing approaches
  const nativeAudioRef = useRef<HTMLAudioElement>(null)
  const webAudioRef = useRef<HTMLAudioElement>(null)
  const fallbackAudioRef = useRef<HTMLAudioElement>(null)
  const testAudioRef = useRef<HTMLAudioElement>(null)

  // Audio context for Web Audio API
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [audioGain, setAudioGain] = useState<GainNode | null>(null)

  // UI states
  const [activeTab, setActiveTab] = useState("native")
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [testResults, setTestResults] = useState<{ [key: string]: boolean | null }>({
    audioElement: null,
    webAudio: null,
    fallbackAudio: null,
    testTone: null,
  })

  // Audio URLs
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [fallbackUrl] = useState("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
  const [customUrl, setCustomUrl] = useState("")

  // Options
  const [useProxy, setUseProxy] = useState(false)
  const [audioFormat, setAudioFormat] = useState("original")

  // Add log entry
  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev])
    console.log(`AudioTroubleshooter: ${message}`)
  }

  // Extract audio URL from content
  useEffect(() => {
    addLog("Initializing troubleshooter")

    // Try different URL sources
    const possibleUrls = [
      content.url,
      content.audioUrl,
      content.metadata?.publicUrl,
      content.metadata?.signedUrl,
    ].filter(Boolean)

    if (possibleUrls.length > 0) {
      setAudioUrl(possibleUrls[0])
      addLog(`Found audio URL: ${possibleUrls[0]}`)
    } else if (content.storagePath || content.file_path) {
      // Need to fetch signed URL
      const path = content.storagePath || content.file_path
      addLog(`Fetching signed URL for path: ${path}`)
      setIsLoading(true)

      fetch(`/api/storage/get-file-url?path=${encodeURIComponent(path)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            setAudioUrl(data.url)
            addLog(`Received signed URL: ${data.url}`)
          } else {
            setError("No URL in response")
            addLog("Error: No URL in response")
          }
        })
        .catch((err) => {
          setError(`Error fetching URL: ${err.message}`)
          addLog(`Error fetching URL: ${err.message}`)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setError("No audio source found")
      addLog("Error: No audio source found")
    }
  }, [content])

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioUrl) return

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(context)

      const gainNode = context.createGain()
      gainNode.gain.value = volume
      gainNode.connect(context.destination)
      setAudioGain(gainNode)

      addLog("Web Audio API initialized")
    } catch (err) {
      addLog(`Failed to initialize Web Audio API: ${(err as Error).message}`)
    }

    return () => {
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [audioUrl])

  // Load audio buffer for Web Audio API
  const loadAudioBuffer = async (): Promise<AudioBuffer | null> => {
    if (!audioContext || !audioUrl) return null

    try {
      setIsLoading(true)
      addLog("Fetching audio data for Web Audio API...")

      const response = await fetch(audioUrl)
      const arrayBuffer = await response.arrayBuffer()

      addLog("Decoding audio data...")
      const buffer = await audioContext.decodeAudioData(arrayBuffer)

      setAudioBuffer(buffer)
      addLog(
        `Audio buffer loaded: ${buffer.duration.toFixed(2)}s, ${buffer.numberOfChannels} channels, ${buffer.sampleRate}Hz`,
      )

      return buffer
    } catch (err) {
      setError(`Failed to load audio buffer: ${(err as Error).message}`)
      addLog(`Error: Failed to load audio buffer: ${(err as Error).message}`)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Play audio with Web Audio API
  const playWebAudio = async () => {
    if (!audioContext || !audioGain) {
      addLog("Web Audio API not initialized")
      return
    }

    try {
      // Resume audio context if suspended
      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }

      // Load buffer if not already loaded
      let buffer = audioBuffer
      if (!buffer) {
        buffer = await loadAudioBuffer()
        if (!buffer) return
      }

      // Stop any currently playing source
      if (audioSource) {
        audioSource.stop()
        audioSource.disconnect()
      }

      // Create and configure new source
      const source = audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(audioGain)

      // Setup event handlers
      source.onended = () => {
        setIsPlaying(false)
        addLog("Web Audio playback ended")
        setTestResults((prev) => ({ ...prev, webAudio: true }))
      }

      // Start playback
      source.start(0)
      setAudioSource(source)
      setIsPlaying(true)
      addLog("Web Audio playback started")
    } catch (err) {
      setError(`Web Audio playback failed: ${(err as Error).message}`)
      addLog(`Error: Web Audio playback failed: ${(err as Error).message}`)
      setTestResults((prev) => ({ ...prev, webAudio: false }))
    }
  }

  // Stop Web Audio playback
  const stopWebAudio = () => {
    if (audioSource) {
      audioSource.stop()
      audioSource.disconnect()
      setAudioSource(null)
      setIsPlaying(false)
      addLog("Web Audio playback stopped")
    }
  }

  // Toggle Web Audio playback
  const toggleWebAudio = () => {
    if (isPlaying) {
      stopWebAudio()
    } else {
      playWebAudio()
    }
  }

  // Play with native audio element
  const playNativeAudio = async () => {
    const audio = nativeAudioRef.current
    if (!audio) return

    try {
      addLog("Attempting to play with native audio element")
      audio.volume = volume

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        await playPromise
        setIsPlaying(true)
        addLog("Native audio playback started")
        setTestResults((prev) => ({ ...prev, audioElement: true }))
      }
    } catch (err) {
      setError(`Native audio playback failed: ${(err as Error).message}`)
      addLog(`Error: Native audio playback failed: ${(err as Error).message}`)
      setTestResults((prev) => ({ ...prev, audioElement: false }))
    }
  }

  // Play fallback audio
  const playFallbackAudio = async () => {
    const audio = fallbackAudioRef.current
    if (!audio) return

    try {
      addLog("Attempting to play fallback audio")
      audio.volume = volume

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        await playPromise
        addLog("Fallback audio playback started")
        setTestResults((prev) => ({ ...prev, fallbackAudio: true }))
      }
    } catch (err) {
      setError(`Fallback audio playback failed: ${(err as Error).message}`)
      addLog(`Error: Fallback audio playback failed: ${(err as Error).message}`)
      setTestResults((prev) => ({ ...prev, fallbackAudio: false }))
    }
  }

  // Play test tone
  const playTestTone = () => {
    if (!audioContext) {
      addLog("Audio context not initialized")
      return
    }

    try {
      // Resume audio context if suspended
      if (audioContext.state === "suspended") {
        audioContext.resume()
      }

      // Create oscillator
      const oscillator = audioContext.createOscillator()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4 note

      // Create gain node for volume control
      const gainNode = audioContext.createGain()
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime) // Lower volume for comfort

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Start and stop after 1 second
      oscillator.start()
      addLog("Test tone playing")

      setTimeout(() => {
        oscillator.stop()
        addLog("Test tone stopped")
        setTestResults((prev) => ({ ...prev, testTone: true }))
      }, 1000)
    } catch (err) {
      setError(`Test tone failed: ${(err as Error).message}`)
      addLog(`Error: Test tone failed: ${(err as Error).message}`)
      setTestResults((prev) => ({ ...prev, testTone: false }))
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setTestResults({
      audioElement: null,
      webAudio: null,
      fallbackAudio: null,
      testTone: null,
    })

    addLog("Running all audio tests...")

    // Test 1: Test tone
    try {
      playTestTone()
      // Result will be set by the playTestTone function
    } catch (err) {
      setTestResults((prev) => ({ ...prev, testTone: false }))
    }

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Test 2: Fallback audio
    try {
      await playFallbackAudio()
      // Result will be set by the playFallbackAudio function
    } catch (err) {
      setTestResults((prev) => ({ ...prev, fallbackAudio: false }))
    }

    // Wait for fallback audio to play a bit
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Stop fallback audio
    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause()
    }

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 3: Native audio
    try {
      await playNativeAudio()
      // Result will be set by the playNativeAudio function
    } catch (err) {
      setTestResults((prev) => ({ ...prev, audioElement: false }))
    }

    // Wait for native audio to play a bit
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Stop native audio
    if (nativeAudioRef.current) {
      nativeAudioRef.current.pause()
    }

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Test 4: Web Audio API
    try {
      await playWebAudio()
      // Result will be set by the playWebAudio function
    } catch (err) {
      setTestResults((prev) => ({ ...prev, webAudio: false }))
    }

    addLog("All tests completed")
  }

  // Get effective URL based on options
  const getEffectiveUrl = () => {
    if (customUrl) return customUrl
    if (!audioUrl) return null

    // Apply proxy if needed
    if (useProxy) {
      return `/api/audio-proxy?url=${encodeURIComponent(audioUrl)}`
    }

    // Apply format conversion if needed
    if (audioFormat !== "original") {
      return `/api/audio-convert?url=${encodeURIComponent(audioUrl)}&format=${audioFormat}`
    }

    return audioUrl
  }

  // Format test result
  const formatTestResult = (result: boolean | null) => {
    if (result === null) return "Non testé"
    return result ? "Succès" : "Échec"
  }

  // Get URL for audio element
  const effectiveUrl = getEffectiveUrl()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnostic Audio Avancé</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio elements (hidden) */}
        {effectiveUrl && (
          <audio
            ref={nativeAudioRef}
            src={effectiveUrl}
            preload="auto"
            crossOrigin="anonymous"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={(e) => {
              const audio = e.currentTarget
              const errorCode = audio.error?.code || 0
              const errorMessages: { [key: number]: string } = {
                1: "Le chargement a été abandonné",
                2: "Erreur réseau lors du chargement",
                3: "Erreur de décodage audio",
                4: "Format audio non supporté",
              }
              const errorMsg = errorMessages[errorCode] || `Erreur inconnue (${errorCode})`
              setError(errorMsg)
              addLog(`Erreur audio: ${errorMsg}`)
              setTestResults((prev) => ({ ...prev, audioElement: false }))
            }}
          />
        )}
        <audio
          ref={fallbackAudioRef}
          src={fallbackUrl}
          preload="auto"
          crossOrigin="anonymous"
          onError={(e) => {
            addLog(`Erreur audio de secours: ${e.currentTarget.error?.message || "Erreur inconnue"}`)
            setTestResults((prev) => ({ ...prev, fallbackAudio: false }))
          }}
        />

        {/* URL and options */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-grow">
              <Label htmlFor="custom-url">URL Audio Personnalisée</Label>
              <Input
                id="custom-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Entrez une URL audio personnalisée"
              />
            </div>
            <div>
              <Label>Format</Label>
              <Select value={audioFormat} onValueChange={setAudioFormat}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="aac">AAC</SelectItem>
                  <SelectItem value="ogg">OGG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-proxy"
              checked={useProxy}
              onCheckedChange={(checked) => setUseProxy(checked as boolean)}
            />
            <Label htmlFor="use-proxy">Utiliser un proxy pour contourner CORS</Label>
          </div>

          {audioUrl && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs break-all">URL source: {audioUrl}</AlertDescription>
            </Alert>
          )}

          {effectiveUrl && effectiveUrl !== audioUrl && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs break-all">URL effective: {effectiveUrl}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Test results */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                testResults.testTone === null ? "bg-gray-300" : testResults.testTone ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>Test de son: {formatTestResult(testResults.testTone)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                testResults.fallbackAudio === null
                  ? "bg-gray-300"
                  : testResults.fallbackAudio
                    ? "bg-green-500"
                    : "bg-red-500"
              }`}
            />
            <span>Audio de secours: {formatTestResult(testResults.fallbackAudio)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                testResults.audioElement === null
                  ? "bg-gray-300"
                  : testResults.audioElement
                    ? "bg-green-500"
                    : "bg-red-500"
              }`}
            />
            <span>Élément audio: {formatTestResult(testResults.audioElement)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                testResults.webAudio === null ? "bg-gray-300" : testResults.webAudio ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>Web Audio API: {formatTestResult(testResults.webAudio)}</span>
          </div>
        </div>

        {/* Tabs for different playback methods */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="native">Natif</TabsTrigger>
            <TabsTrigger value="webaudio">Web Audio</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Native Audio Tab */}
          <TabsContent value="native" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const audio = nativeAudioRef.current
                  if (!audio) return

                  if (isPlaying) {
                    audio.pause()
                  } else {
                    playNativeAudio()
                  }
                }}
                disabled={!effectiveUrl || isLoading}
              >
                {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isPlaying ? "Pause" : "Lecture"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const audio = nativeAudioRef.current
                  if (audio) {
                    audio.currentTime = 0
                    if (isPlaying) {
                      playNativeAudio()
                    }
                  }
                }}
                disabled={!effectiveUrl || isLoading}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Redémarrer
              </Button>

              <div className="flex items-center ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsMuted(!isMuted)
                    const audio = nativeAudioRef.current
                    if (audio) {
                      audio.muted = !isMuted
                    }
                  }}
                  disabled={!effectiveUrl || isLoading}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <Slider
                  className="w-24 ml-2"
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => {
                    setVolume(value[0])
                    const audio = nativeAudioRef.current
                    if (audio) {
                      audio.volume = value[0]
                    }
                  }}
                  disabled={!effectiveUrl || isLoading}
                />
              </div>
            </div>

            <div className="text-sm space-y-2">
              <p>Cette méthode utilise l'élément audio HTML standard pour la lecture.</p>
              <p>Si vous n'entendez pas de son:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Vérifiez que le volume n'est pas à zéro</li>
                <li>Essayez de cliquer plusieurs fois sur le bouton de lecture</li>
                <li>Vérifiez que votre navigateur prend en charge le format audio</li>
                <li>Essayez un autre navigateur</li>
              </ul>
            </div>
          </TabsContent>

          {/* Web Audio Tab */}
          <TabsContent value="webaudio" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={toggleWebAudio} disabled={!effectiveUrl || isLoading}>
                {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isPlaying ? "Arrêter" : "Lecture"}
              </Button>

              <Button variant="outline" onClick={loadAudioBuffer} disabled={!effectiveUrl || isLoading}>
                Charger Buffer
              </Button>

              <div className="flex items-center ml-auto">
                <Slider
                  className="w-24 ml-2"
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) => {
                    setVolume(value[0])
                    if (audioGain) {
                      audioGain.gain.value = value[0]
                    }
                  }}
                  disabled={!effectiveUrl || isLoading}
                />
              </div>
            </div>

            <div className="text-sm space-y-2">
              <p>Cette méthode utilise l'API Web Audio pour un contrôle plus précis de la lecture.</p>
              <p>Étapes:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Cliquez sur "Charger Buffer" pour télécharger et décoder l'audio</li>
                <li>Cliquez sur "Lecture" pour démarrer la lecture</li>
              </ol>
              <p>
                Cette méthode peut fonctionner avec des formats que l'élément audio standard ne prend pas en charge.
              </p>
            </div>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={playTestTone}>Tester le Son</Button>

              <Button onClick={playFallbackAudio}>Tester Audio de Secours</Button>

              <Button onClick={runAllTests}>Exécuter Tous les Tests</Button>
            </div>

            <div className="text-sm space-y-2">
              <p>Ces tests vous aident à déterminer si le problème vient du fichier audio ou de votre système.</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Tester le Son</strong>: Génère une tonalité simple pour vérifier que votre système audio
                  fonctionne
                </li>
                <li>
                  <strong>Tester Audio de Secours</strong>: Essaie de lire un fichier audio connu pour fonctionner
                </li>
                <li>
                  <strong>Exécuter Tous les Tests</strong>: Exécute une série de tests pour diagnostiquer le problème
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="h-64 overflow-y-auto bg-gray-100 p-2 rounded text-xs font-mono">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="border-b border-gray-200 py-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">Aucun log disponible</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recommendations based on test results */}
        {Object.values(testResults).some((result) => result !== null) && (
          <Alert
            className={Object.values(testResults).some((result) => result === true) ? "bg-green-50" : "bg-yellow-50"}
          >
            <AlertTitle>Diagnostic</AlertTitle>
            <AlertDescription>
              {testResults.testTone === false && testResults.fallbackAudio === false && (
                <p className="text-red-600">
                  Votre système audio semble ne pas fonctionner. Vérifiez que vos haut-parleurs sont allumés et que le
                  son n'est pas coupé.
                </p>
              )}

              {testResults.testTone === true &&
                testResults.fallbackAudio === true &&
                testResults.audioElement === false && (
                  <p>
                    Votre système audio fonctionne, mais il y a un problème avec le fichier audio spécifique. Il
                    pourrait être dans un format non pris en charge.
                  </p>
                )}

              {testResults.audioElement === false && testResults.webAudio === true && (
                <p>
                  L'API Web Audio peut lire le fichier mais pas l'élément audio standard. Cela suggère un problème de
                  format ou de compatibilité.
                </p>
              )}

              {testResults.testTone === true &&
                testResults.fallbackAudio === true &&
                testResults.audioElement === true && (
                  <p className="text-green-600">
                    Tous les tests audio ont réussi. Si vous n'entendez toujours pas le son, vérifiez le volume et les
                    paramètres de votre navigateur.
                  </p>
                )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
