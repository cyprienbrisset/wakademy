"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  album?: string
  coverArt?: string
  contentId?: string
  onProgress?: (time: number, duration: number) => void
  onComplete?: () => void
}

export default function AudioPlayer({
  src,
  title = "Podcast",
  artist = "Wakademy",
  album = "",
  coverArt = "/placeholder.svg?height=400&width=400&query=podcast",
  contentId,
  onProgress,
  onComplete,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  // Add a new state for tracking minimized state
  const [isMinimized, setIsMinimized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
      setError(null)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
      if (onProgress) {
        onProgress(audio.currentTime, audio.duration)
      }

      // Check if we're at the end of the track
      if (audio.currentTime >= audio.duration * 0.98) {
        if (onComplete) {
          onComplete()
        }
      }
    }

    const handleError = () => {
      const errorMessages: { [key: number]: string } = {
        1: "Le chargement a été abandonné",
        2: "Erreur réseau lors du chargement",
        3: "Erreur de décodage audio",
        4: "Format audio non supporté",
      }

      const errorCode = audio.error?.code || 0
      setError(errorMessages[errorCode] || "Erreur lors du chargement de l'audio")
      setIsPlaying(false)
    }

    // Events
    audio.addEventListener("loadeddata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)
    audio.addEventListener("error", handleError)

    // Cleanup
    return () => {
      audio.removeEventListener("loadeddata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
      audio.removeEventListener("error", handleError)
      cancelAnimationFrame(animationRef.current as number)
    }
  }, [onProgress, onComplete])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Update audio source when src changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.src !== src) {
      audio.src = src
      audio.load()
      setCurrentTime(0)
      setError(null)

      // Auto-play if it was already playing
      if (isPlaying) {
        audio.play().catch((err) => {
          console.error("Failed to auto-play:", err)
          setIsPlaying(false)
        })
      }
    }
  }, [src, isPlaying])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      cancelAnimationFrame(animationRef.current as number)
    } else {
      audio.play().catch((err) => {
        console.error("Failed to play:", err)
        setError("Cliquez à nouveau pour démarrer la lecture")
      })
      animationRef.current = requestAnimationFrame(whilePlaying)
    }
    setIsPlaying(!isPlaying)
  }

  const whilePlaying = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      animationRef.current = requestAnimationFrame(whilePlaying)
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10
    }
  }

  const onProgressChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = value[0]
    setCurrentTime(value[0])

    if (!isPlaying) {
      setCurrentTime(value[0])
    }
  }

  const onVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Add a toggleMinimize function after the toggleMute function
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Replace the entire return statement with this updated version that includes minimize functionality
  return (
    <>
      {!isMinimized ? (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <p>{error}</p>
              <p className="text-xs mt-1">Essayez de cliquer sur le bouton de lecture ou de rafraîchir la page.</p>
            </div>
          )}

          <div className="w-full flex justify-end mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMinimize}
              aria-label="Minimize player"
              className="h-8 w-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            </Button>
          </div>

          <div className="relative w-full aspect-square mb-6">
            <div
              className={cn(
                "absolute inset-0 rounded-full overflow-hidden transition-transform duration-500",
                "before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black/5",
                "after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-3 after:h-3 after:bg-white after:rounded-full after:z-10",
                isPlaying && "animate-spin-slow",
              )}
            >
              <img
                src={coverArt || "/placeholder.svg?height=400&width=400&query=podcast"}
                alt={`${album} by ${artist}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-full mb-4">
            <h2 className="text-xl font-semibold text-center">{title}</h2>
            <p className="text-sm text-gray-500 text-center">
              {artist} {album && `• ${album}`}
            </p>
          </div>

          <div className="w-full mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.01}
              onValueChange={onProgressChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={skipBackward} aria-label="Skip backward 10 seconds">
              <SkipBack className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={skipForward} aria-label="Skip forward 10 seconds">
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center w-full gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="shrink-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={onVolumeChange}
              className="w-full max-w-[100px]"
            />
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg transition-all duration-300 ease-in-out z-50">
          <div className="container mx-auto max-w-screen-lg">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative h-10 w-10 shrink-0">
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full overflow-hidden",
                      "before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-black/5",
                      "after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:bg-white after:rounded-full after:z-10",
                      isPlaying && "animate-spin-slow",
                    )}
                  >
                    <img
                      src={coverArt || "/placeholder.svg?height=400&width=400&query=podcast"}
                      alt={`${album} by ${artist}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-medium truncate">{title}</h3>
                  <p className="text-xs text-gray-500 truncate">{artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  aria-label="Skip backward 10 seconds"
                  className="h-8 w-8"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  aria-label="Skip forward 10 seconds"
                  className="h-8 w-8"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMinimize}
                  aria-label="Maximize player"
                  className="h-8 w-8"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="px-3 pb-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.01}
                onValueChange={onProgressChange}
                className="w-full h-1"
              />
            </div>
          </div>
        </div>
      )}
      <audio 
        ref={audioRef} 
        {...(src && src.trim() !== "" ? { src } : {})}
        preload="metadata" 
        crossOrigin="anonymous" 
      />
    </>
  )
}
