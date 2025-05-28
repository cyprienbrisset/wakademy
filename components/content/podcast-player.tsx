"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw, Loader2, Info, Check } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { saveContentProgress, getContentProgress } from "@/lib/content/progress-service"
import { useToast } from "@/hooks/use-toast"

interface PodcastPlayerProps {
  content: any // Accepter l'objet content complet
}

// URL audio de secours pour tester le lecteur
const FALLBACK_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

// Intervalle de sauvegarde de la progression en secondes
const SAVE_INTERVAL = 10

export default function PodcastPlayer({ content }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [useFallback, setUseFallback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [lastSavedPosition, setLastSavedPosition] = useState(0)
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  // Extraire les propriétés de l'objet content
  const { id: contentId, url, storagePath, file_path, metadata, thumbnailUrl, title, author } = content

  // Vérifier si l'utilisateur est authentifié
  useEffect(() => {
    // Vérification simple côté client
    const checkAuth = () => {
      try {
        const hasAuth = typeof window !== "undefined" && localStorage.getItem("wakademy_admin") !== null
        setIsAuthenticated(hasAuth)
        return hasAuth
      } catch (e) {
        console.error("Erreur lors de la vérification de l'authentification:", e)
        return false
      }
    }

    checkAuth()
  }, [])

  // Afficher les informations de débogage initiales
  useEffect(() => {
    setDebugInfo({
      contentObject: {
        contentId,
        url,
        storagePath,
        file_path,
        metadata: metadata
          ? {
              publicUrl: metadata.publicUrl,
              signedUrl: metadata.signedUrl,
              storagePath: metadata.storagePath,
            }
          : null,
      },
      isAuthenticated,
    })
  }, [contentId, url, storagePath, file_path, metadata, isAuthenticated])

  // Récupérer la progression de l'utilisateur
  useEffect(() => {
    async function loadProgress() {
      if (!contentId || hasLoadedProgress || !isAuthenticated) return

      try {
        const progress = await getContentProgress(contentId)

        if (progress) {
          setDebugInfo((prev) => ({ ...prev, loadedProgress: progress }))

          // Ne pas définir currentTime directement ici, car l'audio n'est peut-être pas encore chargé
          // On le fera après le chargement de l'audio
          setLastSavedPosition(progress.current_position || 0)
          setIsCompleted(progress.is_completed || false)

          if (progress.duration && progress.duration > 0) {
            setDuration(progress.duration)
          }
        }

        setHasLoadedProgress(true)
      } catch (error) {
        console.error("Erreur lors du chargement de la progression:", error)
        setHasLoadedProgress(true)
      }
    }

    loadProgress()
  }, [contentId, hasLoadedProgress, isAuthenticated])

  // Récupérer l'URL signée si nécessaire
  useEffect(() => {
    async function fetchSignedUrl() {
      // Si on utilise l'URL de secours, ne pas chercher d'URL signée
      if (useFallback) {
        setAudioUrl(FALLBACK_AUDIO_URL)
        setDebugInfo((prev) => ({ ...prev, audioSource: "fallback", fallbackUrl: FALLBACK_AUDIO_URL }))
        return
      }

      // Essayer d'utiliser l'URL directe si disponible
      if (url && url.trim() !== "") {
        setAudioUrl(url)
        setDebugInfo((prev) => ({ ...prev, audioSource: "direct", directUrl: url }))
        return
      }

      // Essayer d'utiliser l'URL publique des métadonnées
      if (metadata && metadata.publicUrl && metadata.publicUrl.trim() !== "") {
        setAudioUrl(metadata.publicUrl)
        setDebugInfo((prev) => ({ ...prev, audioSource: "metadata", metadataUrl: metadata.publicUrl }))
        return
      }

      // Essayer d'utiliser l'URL signée des métadonnées
      if (metadata && metadata.signedUrl && metadata.signedUrl.trim() !== "") {
        setAudioUrl(metadata.signedUrl)
        setDebugInfo((prev) => ({ ...prev, audioSource: "signedMetadata", signedMetadataUrl: metadata.signedUrl }))
        return
      }

      // Déterminer le chemin de stockage à utiliser
      const effectiveStoragePath = storagePath || file_path || (metadata && metadata.storagePath)

      if (!effectiveStoragePath) {
        setError("Impossible de déterminer le chemin du fichier audio")
        setDebugInfo((prev) => ({ ...prev, error: "Pas de chemin de stockage disponible" }))
        return
      }

      try {
        setIsLoadingUrl(true)
        setError(null)
        setDebugInfo((prev) => ({ ...prev, fetchingSignedUrl: true, storagePath: effectiveStoragePath }))

        // Ajouter un timestamp pour éviter la mise en cache
        const timestamp = new Date().getTime()
        const response = await fetch(
          `/api/storage/get-file-url?path=${encodeURIComponent(effectiveStoragePath)}&t=${timestamp}`,
        )

        setDebugInfo((prev) => ({
          ...prev,
          signedUrlResponse: {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
          },
        }))

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Signed URL received:", data.url)
        setAudioUrl(data.url)
        setDebugInfo((prev) => ({ ...prev, signedUrl: data.url }))
      } catch (error) {
        console.error("Error fetching signed URL:", error)
        setError(`Impossible d'accéder au fichier audio: ${(error as Error).message}`)
        setDebugInfo((prev) => ({ ...prev, signedUrlError: (error as Error).message }))
      } finally {
        setIsLoadingUrl(false)
        setDebugInfo((prev) => ({ ...prev, fetchingSignedUrl: false }))
      }
    }

    fetchSignedUrl()
  }, [url, storagePath, file_path, metadata, useFallback])

  // Configurer l'audio une fois l'URL disponible
  useEffect(() => {
    if (!audioUrl) return

    const audio = audioRef.current
    if (!audio) return

    setDebugInfo((prev) => ({ ...prev, audioElement: { src: audioUrl } }))

    const updateTime = () => {
      setCurrentTime(audio.currentTime)

      // Vérifier si l'audio est presque terminé (95% ou plus)
      if (isAuthenticated && audio.duration > 0 && audio.currentTime >= audio.duration * 0.95 && !isCompleted) {
        setIsCompleted(true)
        markAsCompleted()
      }
    }

    const updateDuration = () => {
      setDuration(audio.duration)
      setIsLoading(false)
      setDebugInfo((prev) => ({ ...prev, audioDuration: audio.duration }))

      // Appliquer la position sauvegardée une fois que la durée est connue
      if (isAuthenticated && lastSavedPosition > 0 && lastSavedPosition < audio.duration) {
        audio.currentTime = lastSavedPosition
        setCurrentTime(lastSavedPosition)
        toast({
          title: "Lecture reprise",
          description: `Reprise à ${formatTime(lastSavedPosition)}`,
          duration: 3000,
        })
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setDebugInfo((prev) => ({ ...prev, audioState: "playing" }))
    }

    const handlePause = () => {
      setIsPlaying(false)
      setDebugInfo((prev) => ({ ...prev, audioState: "paused" }))

      // Sauvegarder la progression lors de la pause
      if (isAuthenticated && contentId && audio.currentTime > 0) {
        saveProgress()
      }
    }

    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e)
      setError("Erreur lors du chargement de l'audio. Veuillez réessayer.")
      setIsLoading(false)
      setDebugInfo((prev) => ({
        ...prev,
        audioError: {
          message: e.message,
          type: e.type,
          target: e.target ? (e.target as HTMLAudioElement).error?.code : null,
        },
      }))
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setError(null)
      setDebugInfo((prev) => ({ ...prev, audioCanPlay: true }))
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (isAuthenticated) {
        setIsCompleted(true)
        markAsCompleted()
      }
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("durationchange", updateDuration)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("error", handleError as EventListener)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)

    // Précharger l'audio
    audio.load()
    setDebugInfo((prev) => ({ ...prev, audioLoading: true }))

    // Configurer l'intervalle de sauvegarde de la progression
    let saveInterval: NodeJS.Timeout | null = null

    if (isAuthenticated) {
      saveInterval = setInterval(() => {
        if (isPlaying && contentId && audio.currentTime > 0) {
          saveProgress()
        }
      }, SAVE_INTERVAL * 1000)
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("durationchange", updateDuration)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("error", handleError as EventListener)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)

      if (saveInterval) {
        clearInterval(saveInterval)
      }

      // Sauvegarder la progression lors du démontage du composant
      if (isAuthenticated && contentId && audio.currentTime > 0) {
        saveProgress()
      }
    }
  }, [audioUrl, contentId, isPlaying, lastSavedPosition, isCompleted, isAuthenticated])

  // Fonction pour sauvegarder la progression
  const saveProgress = async () => {
    if (!contentId || !audioRef.current || !isAuthenticated) return

    const currentPosition = audioRef.current.currentTime
    const audioDuration = audioRef.current.duration

    // Ne pas sauvegarder si la position n'a pas changé significativement (moins de 1 seconde)
    if (Math.abs(currentPosition - lastSavedPosition) < 1) return

    try {
      const result = await saveContentProgress({
        content_id: contentId,
        current_position: currentPosition,
        duration: audioDuration,
        is_completed: isCompleted,
      })

      if (result) {
        setLastSavedPosition(currentPosition)
        setDebugInfo((prev) => ({
          ...prev,
          savedProgress: {
            position: currentPosition,
            duration: audioDuration,
            completed: isCompleted,
            timestamp: new Date().toISOString(),
          },
        }))
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la progression:", error)
    }
  }

  // Fonction pour marquer le contenu comme terminé
  const markAsCompleted = async () => {
    if (!contentId || !isAuthenticated) return

    try {
      const result = await saveContentProgress({
        content_id: contentId,
        current_position: audioRef.current?.currentTime || 0,
        duration: audioRef.current?.duration || 0,
        is_completed: true,
      })

      if (result) {
        setIsCompleted(true)
        setDebugInfo((prev) => ({
          ...prev,
          markedAsCompleted: {
            timestamp: new Date().toISOString(),
          },
        }))

        toast({
          title: "Contenu terminé",
          description: "Ce contenu a été marqué comme terminé",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Erreur lors du marquage du contenu comme terminé:", error)
    }
  }

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) {
      console.error("No audio element found")
      return
    }

    console.log("Toggle play clicked", {
      isPlaying,
      paused: audio.paused,
      readyState: audio.readyState,
      src: audio.src,
    })

    if (isPlaying) {
      // If playing, just pause
      audio.pause()
      setIsPlaying(false)
    } else {
      // If not playing, try to play
      try {
        // Ensure audio is loaded
        if (audio.readyState === 0) {
          console.log("Audio not loaded, loading now...")
          audio.load()

          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            const canPlayHandler = () => {
              audio.removeEventListener("canplay", canPlayHandler)
              audio.removeEventListener("error", errorHandler)
              resolve(true)
            }
            const errorHandler = () => {
              audio.removeEventListener("canplay", canPlayHandler)
              audio.removeEventListener("error", errorHandler)
              reject(new Error("Failed to load audio"))
            }

            audio.addEventListener("canplay", canPlayHandler)
            audio.addEventListener("error", errorHandler)

            // Timeout after 5 seconds
            setTimeout(() => {
              audio.removeEventListener("canplay", canPlayHandler)
              audio.removeEventListener("error", errorHandler)
              reject(new Error("Audio load timeout"))
            }, 5000)
          })
        }

        // Reset error state before playing
        setError(null)

        // Attempt to play
        console.log("Attempting to play audio...")
        const playPromise = audio.play()

        if (playPromise !== undefined) {
          await playPromise
          console.log("Play successful")
          setIsPlaying(true)
          setDebugInfo((prev) => ({ ...prev, playAttempt: "success" }))
        }
      } catch (error: any) {
        console.error("Playback failed:", error)

        // Handle specific errors
        if (error.name === "NotAllowedError") {
          setError("Cliquez à nouveau pour démarrer la lecture (politique d'autoplay du navigateur)")

          // Try to play again on next user interaction
          const playOnClick = async () => {
            try {
              await audio.play()
              setIsPlaying(true)
              setError(null)
              document.removeEventListener("click", playOnClick)
            } catch (e) {
              console.error("Retry play failed:", e)
            }
          }
          document.addEventListener("click", playOnClick, { once: true })
        } else if (error.name === "NotSupportedError") {
          setError("Format audio non supporté par votre navigateur")
        } else if (error.name === "AbortError") {
          setError("La lecture a été interrompue")
        } else {
          setError(`Erreur de lecture: ${error.message || "Erreur inconnue"}`)
        }

        setIsPlaying(false)
        setDebugInfo((prev) => ({
          ...prev,
          playAttempt: "failed",
          playError: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }))
      }
    }
  }

  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = value[0]
    setCurrentTime(value[0])

    // Débouncer la sauvegarde pour éviter trop d'appels
    if (isAuthenticated && contentId) {
      setTimeout(() => saveProgress(), 1000)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0]
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume || 1
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, audio.currentTime - 15)
    setCurrentTime(audio.currentTime)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.min(audio.duration, audio.currentTime + 15)
    setCurrentTime(audio.currentTime)
  }

  const changePlaybackRate = () => {
    const audio = audioRef.current
    if (!audio) return

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    const newRate = rates[nextIndex]

    audio.playbackRate = newRate
    setPlaybackRate(newRate)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`
    }

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const refreshAudio = async () => {
    const effectiveStoragePath = storagePath || file_path || (metadata && metadata.storagePath)

    if (!effectiveStoragePath && !useFallback) {
      // Si ce n'est pas un fichier de stockage, simplement recharger l'audio
      const audio = audioRef.current
      if (audio) {
        audio.load()
        setError(null)
        setDebugInfo((prev) => ({ ...prev, refreshAttempt: "reload" }))
      }
      return
    }

    // Récupérer une nouvelle URL signée
    try {
      setIsLoadingUrl(true)
      setError(null)
      setDebugInfo((prev) => ({ ...prev, refreshAttempt: "newSignedUrl" }))

      if (useFallback) {
        setAudioUrl(FALLBACK_AUDIO_URL)
        setDebugInfo((prev) => ({ ...prev, refreshResult: "usedFallback" }))
      } else {
        const timestamp = new Date().getTime()
        const response = await fetch(
          `/api/storage/get-file-url?path=${encodeURIComponent(effectiveStoragePath)}&t=${timestamp}`,
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de la récupération de l'URL signée")
        }

        const data = await response.json()
        console.log("New signed URL received:", data.url)
        setAudioUrl(data.url)
        setDebugInfo((prev) => ({ ...prev, refreshResult: "newUrlReceived", newUrl: data.url }))
      }

      // Recharger l'audio avec la nouvelle URL
      setTimeout(() => {
        const audio = audioRef.current
        if (audio) {
          const currentPosition = audio.currentTime
          audio.load()

          // Restaurer la position après le rechargement
          audio.addEventListener(
            "canplay",
            () => {
              audio.currentTime = currentPosition
            },
            { once: true },
          )

          setDebugInfo((prev) => ({ ...prev, audioReloaded: true }))
        }
      }, 100)
    } catch (error) {
      console.error("Error refreshing signed URL:", error)
      setError(`Impossible d'accéder au fichier audio: ${(error as Error).message}`)
      setDebugInfo((prev) => ({ ...prev, refreshError: (error as Error).message }))
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const toggleFallbackAudio = () => {
    setUseFallback(!useFallback)
    setDebugInfo((prev) => ({ ...prev, useFallback: !useFallback }))
  }

  // Déterminer le chemin de stockage effectif pour l'affichage
  const effectiveStoragePath = storagePath || file_path || (metadata && metadata.storagePath)

  // Calculer le pourcentage de progression
  const progressPercentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0

  return (
    <div className="p-4 bg-card rounded-lg">
      {/* Élément audio avec preload */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          crossOrigin="anonymous"
          onError={(e) => {
            const audio = e.target as HTMLAudioElement
            console.error("Audio error event:", {
              error: audio.error,
              src: audio.src,
              readyState: audio.readyState,
              networkState: audio.networkState,
            })

            const errorMessages: { [key: number]: string } = {
              1: "Le chargement a été abandonné",
              2: "Erreur réseau lors du chargement",
              3: "Erreur de décodage audio",
              4: "Format audio non supporté",
            }

            const errorCode = audio.error?.code || 0
            setError(errorMessages[errorCode] || "Erreur lors du chargement de l'audio")

            setDebugInfo((prev) => ({
              ...prev,
              audioErrorEvent: {
                code: errorCode,
                message: audio.error?.message,
                src: audio.src,
              },
            }))
          }}
        />
      )}

      {/* Afficher l'état de chargement de l'URL */}
      {isLoadingUrl && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <AlertTitle>Chargement du fichier audio</AlertTitle>
          <AlertDescription>Récupération de l'accès au fichier audio depuis le stockage...</AlertDescription>
        </Alert>
      )}

      {/* Afficher les erreurs */}
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertTitle className="text-red-700">Erreur de lecture</AlertTitle>
          <AlertDescription className="text-red-600">
            <p>{error}</p>
            {effectiveStoragePath && <p className="text-sm mt-1">Chemin du fichier: {effectiveStoragePath}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={refreshAudio} disabled={isLoadingUrl}>
                {isLoadingUrl ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Réessai en cours...
                  </>
                ) : (
                  "Réessayer"
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFallbackAudio}>
                {useFallback ? "Utiliser l'URL originale" : "Utiliser l'audio de test"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Afficher un état de chargement */}
      {isLoading && !error && !isLoadingUrl && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <AlertTitle>Chargement de l'audio</AlertTitle>
          <AlertDescription>Préparation de la lecture audio en cours...</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-32 h-32 flex-shrink-0">
          <Image
            src={thumbnailUrl || "/placeholder.svg?height=128&width=128&query=podcast"}
            alt={title}
            fill
            className="object-cover rounded-md"
          />
          {isAuthenticated && isCompleted && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex-grow space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium">{title}</h3>
              {isAuthenticated && isCompleted && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Terminé</span>
              )}
            </div>
            <p className="text-muted-foreground">{author}</p>
            {effectiveStoragePath && (
              <p className="text-xs text-muted-foreground mt-1">Fichier: {effectiveStoragePath}</p>
            )}
            {useFallback && (
              <p className="text-xs text-amber-600 font-medium">Mode test: Utilisation d'un audio de démonstration</p>
            )}
            {isAuthenticated && progressPercentage > 0 && progressPercentage < 100 && !isCompleted && (
              <p className="text-xs text-blue-600 font-medium mt-1">Progression: {progressPercentage}%</p>
            )}
          </div>

          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleTimeChange}
              className="cursor-pointer"
              disabled={isLoading || isLoadingUrl || !!error}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipBackward}
                disabled={isLoading || isLoadingUrl || !!error}
                aria-label="Reculer de 15 secondes"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={togglePlay}
                disabled={isLoading || isLoadingUrl || !!error}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
                disabled={isLoading || isLoadingUrl || !!error}
                aria-label="Avancer de 15 secondes"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={changePlaybackRate}
                disabled={isLoading || isLoadingUrl || !!error}
                aria-label="Changer la vitesse de lecture"
              >
                {playbackRate}x
              </Button>

              <div className="relative flex items-center group">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  disabled={isLoading || isLoadingUrl || !!error}
                  aria-label={isMuted ? "Activer le son" : "Couper le son"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                <div className="hidden group-hover:block absolute right-7 w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                    disabled={isLoading || isLoadingUrl || !!error}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const audio = audioRef.current
                  if (audio) audio.currentTime = 0
                }}
                disabled={isLoading || isLoadingUrl || !!error}
                aria-label="Recommencer"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de débogage */}
      <Accordion type="single" collapsible className="mt-4">
        <AccordionItem value="debug">
          <AccordionTrigger className="text-xs text-muted-foreground">
            <Info className="h-3 w-3 mr-1" /> Informations de débogage
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-60">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={toggleFallbackAudio}>
                {useFallback ? "Utiliser l'URL originale" : "Utiliser l'audio de test"}
              </Button>
              <Button variant="outline" size="sm" onClick={refreshAudio}>
                Rafraîchir l'URL
              </Button>
              {isAuthenticated && (
                <Button variant="outline" size="sm" onClick={markAsCompleted}>
                  Marquer comme terminé
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
