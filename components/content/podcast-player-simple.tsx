"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface PodcastPlayerSimpleProps {
  content: any
}

export default function PodcastPlayerSimple({ content }: PodcastPlayerSimpleProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  // Extract audio URL
  useEffect(() => {
    // Try to get URL from various sources
    const url = content.url || content.audioUrl || content.metadata?.publicUrl || content.metadata?.signedUrl

    if (url) {
      console.log("Using direct URL:", url)
      setAudioUrl(url)
    } else if (content.storagePath || content.file_path) {
      // Fetch signed URL
      const path = content.storagePath || content.file_path
      console.log("Fetching signed URL for path:", path)

      fetch(`/api/storage/get-file-url?path=${encodeURIComponent(path)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            console.log("Signed URL received:", data.url)
            setAudioUrl(data.url)
          } else {
            setError("Impossible de récupérer l'URL du fichier audio")
          }
        })
        .catch((err) => {
          console.error("Error fetching signed URL:", err)
          setError("Erreur lors de la récupération de l'URL")
        })
    } else {
      setError("Aucune source audio trouvée")
    }
  }, [content])

  // Setup audio element
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return

    const audio = audioRef.current
    console.log("Setting up audio with URL:", audioUrl)

    // Basic event handlers
    const handleLoadedMetadata = () => {
      console.log("Audio metadata loaded, duration:", audio.duration)
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handlePlay = () => {
      console.log("Audio playing")
      setIsPlaying(true)
    }

    const handlePause = () => {
      console.log("Audio paused")
      setIsPlaying(false)
    }

    const handleError = (e: Event) => {
      console.error("Audio error:", e, audio.error)
      setError(`Erreur de lecture: ${audio.error?.message || "Erreur inconnue"}`)
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      console.log("Audio can play")
      setIsLoading(false)
      setError(null)
    }

    // Add event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("error", handleError)
    audio.addEventListener("canplay", handleCanPlay)

    // Set source and load
    audio.src = audioUrl
    audio.load()

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("canplay", handleCanPlay)
    }
  }, [audioUrl])

  // Play/Pause
  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    console.log("Toggle play clicked, current state:", { isPlaying, paused: audio.paused })

    try {
      if (audio.paused) {
        console.log("Attempting to play...")
        const playPromise = audio.play()

        if (playPromise !== undefined) {
          await playPromise
          console.log("Play successful")
        }
      } else {
        console.log("Pausing...")
        audio.pause()
      }
    } catch (error: any) {
      console.error("Playback error:", error)
      setError(`Erreur de lecture: ${error.message}`)

      // If it's an autoplay policy error, show a specific message
      if (error.name === "NotAllowedError") {
        setError("Cliquez à nouveau pour démarrer la lecture")
      }
    }
  }

  // Time slider
  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  // Volume
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="p-4 bg-card rounded-lg">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />

      {/* Error display */}
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertTitle className="text-red-700">Erreur</AlertTitle>
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <AlertTitle>Chargement</AlertTitle>
          <AlertDescription>Préparation de l'audio...</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={content.thumbnailUrl || "/placeholder.svg?height=96&width=96&query=podcast"}
            alt={content.title}
            fill
            className="object-cover rounded-md"
          />
        </div>

        {/* Controls */}
        <div className="flex-grow space-y-2">
          <div>
            <h3 className="font-medium">{content.title}</h3>
            <p className="text-sm text-muted-foreground">{content.author}</p>
          </div>

          {/* Time slider */}
          <div className="space-y-1">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleTimeChange}
              disabled={!audioUrl || isLoading}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <Button size="icon" onClick={togglePlay} disabled={!audioUrl || isLoading}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <Button size="icon" variant="ghost" onClick={toggleMute} disabled={!audioUrl || isLoading}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <div className="w-24">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  disabled={!audioUrl || isLoading}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <details className="mt-4 text-xs text-muted-foreground">
        <summary className="cursor-pointer">Debug Info</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(
            {
              audioUrl,
              isPlaying,
              currentTime,
              duration,
              volume,
              isLoading,
              error,
              contentInfo: {
                id: content.id,
                title: content.title,
                hasUrl: !!content.url,
                hasAudioUrl: !!content.audioUrl,
                hasStoragePath: !!content.storagePath,
                hasFilePath: !!content.file_path,
              },
            },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  )
}
