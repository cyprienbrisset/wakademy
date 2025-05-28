"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface BasicAudioPlayerProps {
  url: string
  title?: string
}

export default function BasicAudioPlayer({ url, title }: BasicAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fonction pour jouer/pauser l'audio
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      // Essayer de jouer l'audio
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          console.log("Lecture démarrée avec succès")
        })
        .catch((err) => {
          console.error("Erreur lors de la lecture:", err)
          setError(`Erreur de lecture: ${err.message}`)
        })
    } else {
      // Pauser l'audio
      audio.pause()
      setIsPlaying(false)
      console.log("Lecture mise en pause")
    }
  }

  // Gestionnaires d'événements pour l'élément audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlay = () => {
      setIsLoading(false)
      console.log("Audio prêt à être joué")
    }

    const handleError = (e: Event) => {
      setIsLoading(false)
      const audioElement = e.target as HTMLAudioElement
      const errorCode = audioElement.error?.code || 0
      const errorMessage = audioElement.error?.message || "Erreur inconnue"

      console.error("Erreur audio:", {
        code: errorCode,
        message: errorMessage,
        src: audioElement.src,
      })

      setError(`Erreur audio (${errorCode}): ${errorMessage}`)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      console.log("Événement play déclenché")
    }

    const handlePause = () => {
      setIsPlaying(false)
      console.log("Événement pause déclenché")
    }

    // Ajouter les écouteurs d'événements
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("error", handleError)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    // Nettoyer les écouteurs d'événements
    return () => {
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
    }
  }, [])

  // Tester avec un fichier audio de référence
  const testWithReferenceAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    // URL d'un fichier audio de test connu pour fonctionner
    const testAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

    // Changer la source de l'audio
    audio.src = testAudioUrl
    audio.load()

    // Essayer de jouer l'audio
    audio
      .play()
      .then(() => {
        setIsPlaying(true)
        console.log("Lecture du fichier de référence démarrée avec succès")
      })
      .catch((err) => {
        console.error("Erreur lors de la lecture du fichier de référence:", err)
        setError(`Erreur de lecture du fichier de référence: ${err.message}`)
      })
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-medium mb-2">Lecteur Audio Basique</h3>

      {title && <p className="text-sm text-gray-500 mb-2">{title}</p>}

      {/* Élément audio caché */}
      <audio ref={audioRef} src={url} preload="auto" crossOrigin="anonymous" style={{ display: "none" }} />

      {/* Afficher l'état de chargement */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Chargement de l'audio...</span>
        </div>
      )}

      {/* Afficher les erreurs */}
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        {/* Bouton de lecture/pause */}
        <Button onClick={togglePlay} disabled={isLoading} variant="default">
          {isPlaying ? "Pause" : "Lecture"}
        </Button>

        {/* Bouton pour tester avec un fichier audio de référence */}
        <Button onClick={testWithReferenceAudio} variant="outline">
          Tester avec un fichier de référence
        </Button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <p>URL: {url}</p>
        <p>État: {isPlaying ? "En lecture" : "En pause"}</p>
      </div>
    </div>
  )
}
