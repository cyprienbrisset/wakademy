"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Check, Info } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { saveContentProgress, getContentProgress } from "@/lib/content/progress-service"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  src: string
  poster?: string
  contentId: string
}

// Intervalle de sauvegarde de la progression en secondes
const SAVE_INTERVAL = 10

export default function VideoPlayer({ src, poster, contentId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [lastSavedPosition, setLastSavedPosition] = useState(0)
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const { toast } = useToast()

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

  // Récupérer la progression de l'utilisateur
  useEffect(() => {
    async function loadProgress() {
      if (!contentId || hasLoadedProgress || !isAuthenticated) return

      try {
        const progress = await getContentProgress(contentId)

        if (progress) {
          setDebugInfo((prev: any) => ({ ...prev, loadedProgress: progress }))

          // Ne pas définir currentTime directement ici, car la vidéo n'est peut-être pas encore chargée
          // On le fera après le chargement de la vidéo
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

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      setCurrentTime(video.currentTime)

      // Vérifier si la vidéo est presque terminée (95% ou plus)
      if (isAuthenticated && video.duration > 0 && video.currentTime >= video.duration * 0.95 && !isCompleted) {
        setIsCompleted(true)
        markAsCompleted()
      }
    }

    const updateDuration = () => {
      setDuration(video.duration)

      // Appliquer la position sauvegardée une fois que la durée est connue
      if (isAuthenticated && lastSavedPosition > 0 && lastSavedPosition < video.duration) {
        video.currentTime = lastSavedPosition
        setCurrentTime(lastSavedPosition)

        if (contentId) {
          toast({
            title: "Lecture reprise",
            description: `Reprise à ${formatTime(lastSavedPosition)}`,
            duration: 3000,
          })
        }
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setDebugInfo((prev: any) => ({ ...prev, videoState: "playing" }))
    }

    const handlePause = () => {
      setIsPlaying(false)
      setDebugInfo((prev: any) => ({ ...prev, videoState: "paused" }))

      // Sauvegarder la progression lors de la pause
      if (isAuthenticated && contentId && video.currentTime > 0) {
        saveProgress()
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (isAuthenticated) {
        setIsCompleted(true)
        markAsCompleted()
      }
    }

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("durationchange", updateDuration)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)

    // Configurer l'intervalle de sauvegarde de la progression
    let saveInterval: NodeJS.Timeout | null = null

    if (isAuthenticated && contentId) {
      saveInterval = setInterval(() => {
        if (isPlaying && video.currentTime > 0) {
          saveProgress()
        }
      }, SAVE_INTERVAL * 1000)
    }

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("durationchange", updateDuration)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)

      if (saveInterval) {
        clearInterval(saveInterval)
      }

      // Sauvegarder la progression lors du démontage du composant
      if (isAuthenticated && contentId && video.currentTime > 0) {
        saveProgress()
      }
    }
  }, [contentId, isPlaying, lastSavedPosition, isCompleted, isAuthenticated])

  // Fonction pour sauvegarder la progression
  const saveProgress = async () => {
    if (!contentId || !videoRef.current || !isAuthenticated) return

    const currentPosition = videoRef.current.currentTime
    const videoDuration = videoRef.current.duration

    // Ne pas sauvegarder si la position n'a pas changé significativement (moins de 1 seconde)
    if (Math.abs(currentPosition - lastSavedPosition) < 1) return

    try {
      const result = await saveContentProgress({
        content_id: contentId,
        current_position: currentPosition,
        duration: videoDuration,
        is_completed: isCompleted,
      })

      if (result) {
        setLastSavedPosition(currentPosition)
        setDebugInfo((prev: any) => ({
          ...prev,
          savedProgress: {
            position: currentPosition,
            duration: videoDuration,
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
        current_position: videoRef.current?.currentTime || 0,
        duration: videoRef.current?.duration || 0,
        is_completed: true,
      })

      if (result) {
        setIsCompleted(true)
        setDebugInfo((prev: any) => ({
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

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((error) => {
        console.error("Erreur lors de la lecture:", error)
        // Afficher un message d'erreur à l'utilisateur
      })
    }
  }

  const handleTimeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])

    // Débouncer la sauvegarde pour éviter trop d'appels
    if (isAuthenticated && contentId) {
      setTimeout(() => saveProgress(), 1000)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume || 1
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen().catch((err) => {
        console.error("Erreur lors du passage en plein écran:", err)
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, video.currentTime - 10)
    setCurrentTime(video.currentTime)
  }

  const skipForward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.min(video.duration, video.currentTime + 10)
    setCurrentTime(video.currentTime)
  }

  // Calculer le pourcentage de progression
  const progressPercentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video bg-black"
        onClick={togglePlay}
        onError={(e) => {
          console.error("Video error:", e)
          setDebugInfo((prev: any) => ({
            ...prev,
            videoError: {
              message: (e.target as HTMLVideoElement).error?.message,
              code: (e.target as HTMLVideoElement).error?.code,
            },
          }))
        }}
      />

      {isAuthenticated && isCompleted && (
        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 z-10">
          <Check className="h-4 w-4" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleTimeChange}
            className="cursor-pointer"
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="text-white hover:text-primary transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              <button
                onClick={skipBackward}
                className="text-white hover:text-primary transition-colors"
                aria-label="Reculer de 10 secondes"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={skipForward}
                className="text-white hover:text-primary transition-colors"
                aria-label="Avancer de 10 secondes"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {isAuthenticated && progressPercentage > 0 && progressPercentage < 100 && !isCompleted && (
                <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full ml-2">
                  {progressPercentage}%
                </span>
              )}

              {isAuthenticated && isCompleted && (
                <span className="text-xs text-white bg-green-500 px-2 py-0.5 rounded-full ml-2">Terminé</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center group/volume">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-primary transition-colors"
                  aria-label={isMuted ? "Activer le son" : "Couper le son"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>

                <div className="hidden group-hover/volume:block absolute left-7 w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleFullscreen}
                className="text-white hover:text-primary transition-colors"
                aria-label="Plein écran"
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {contentId && (
        <Accordion type="single" collapsible className="mt-2">
          <AccordionItem value="debug">
            <AccordionTrigger className="text-xs text-muted-foreground">
              <Info className="h-3 w-3 mr-1" /> Informations de débogage
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-60">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
              <div className="flex gap-2 mt-2">
                {isAuthenticated && (
                  <Button variant="outline" size="sm" onClick={markAsCompleted}>
                    Marquer comme terminé
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}
