"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DiagnosticInfo {
  timestamp: string
  event: string
  details: any
}

interface PodcastPlayerDiagnosticProps {
  content: any
}

export default function PodcastPlayerDiagnostic({ content }: PodcastPlayerDiagnosticProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo[]>([])
  const [audioState, setAudioState] = useState({
    readyState: 0,
    networkState: 0,
    error: null as MediaError | null,
    currentSrc: "",
    duration: 0,
    paused: true,
    ended: false,
    seeking: false,
    buffered: [] as { start: number; end: number }[],
  })

  // Add diagnostic entry
  const addDiagnostic = (event: string, details: any) => {
    setDiagnostics((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        event,
        details,
      },
    ])
  }

  // Extract audio URL from content
  useEffect(() => {
    addDiagnostic("Component mounted", { content })

    // Try different URL sources
    const possibleUrls = [
      content.url,
      content.audioUrl,
      content.metadata?.publicUrl,
      content.metadata?.signedUrl,
    ].filter(Boolean)

    addDiagnostic("Possible URLs found", { urls: possibleUrls })

    if (possibleUrls.length > 0) {
      setAudioUrl(possibleUrls[0])
      addDiagnostic("Audio URL set", { url: possibleUrls[0] })
    } else if (content.storagePath || content.file_path) {
      // Need to fetch signed URL
      const path = content.storagePath || content.file_path
      addDiagnostic("Fetching signed URL", { path })

      fetch(`/api/storage/get-file-url?path=${encodeURIComponent(path)}`)
        .then((res) => {
          addDiagnostic("Signed URL response", {
            status: res.status,
            ok: res.ok,
            headers: Object.fromEntries(res.headers.entries()),
          })
          return res.json()
        })
        .then((data) => {
          if (data.url) {
            setAudioUrl(data.url)
            addDiagnostic("Signed URL received", { url: data.url })
          } else {
            addDiagnostic("No URL in response", { data })
          }
        })
        .catch((error) => {
          addDiagnostic("Error fetching signed URL", {
            error: error.message,
            stack: error.stack,
          })
        })
    } else {
      addDiagnostic("No audio source found", { content })
    }
  }, [content])

  // Update audio state
  const updateAudioState = () => {
    const audio = audioRef.current
    if (!audio) return

    const buffered = []
    for (let i = 0; i < audio.buffered.length; i++) {
      buffered.push({
        start: audio.buffered.start(i),
        end: audio.buffered.end(i),
      })
    }

    setAudioState({
      readyState: audio.readyState,
      networkState: audio.networkState,
      error: audio.error,
      currentSrc: audio.currentSrc,
      duration: audio.duration,
      paused: audio.paused,
      ended: audio.ended,
      seeking: audio.seeking,
      buffered,
    })
  }

  // Setup audio element
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return

    const audio = audioRef.current
    addDiagnostic("Setting up audio element", { url: audioUrl })

    // Event handlers
    const events = [
      "loadstart",
      "progress",
      "suspend",
      "abort",
      "error",
      "emptied",
      "stalled",
      "loadedmetadata",
      "loadeddata",
      "canplay",
      "canplaythrough",
      "playing",
      "waiting",
      "seeking",
      "seeked",
      "ended",
      "durationchange",
      "timeupdate",
      "play",
      "pause",
      "ratechange",
      "volumechange",
    ]

    const handlers: { [key: string]: EventListener } = {}

    events.forEach((eventName) => {
      handlers[eventName] = (e: Event) => {
        addDiagnostic(`Audio event: ${eventName}`, {
          currentTime: audio.currentTime,
          duration: audio.duration,
          readyState: audio.readyState,
          networkState: audio.networkState,
          error: audio.error,
          paused: audio.paused,
        })
        updateAudioState()

        // Handle specific events
        if (eventName === "play") {
          setIsPlaying(true)
        } else if (eventName === "pause" || eventName === "ended") {
          setIsPlaying(false)
        } else if (eventName === "error") {
          const error = audio.error
          addDiagnostic("Audio error details", {
            code: error?.code,
            message: error?.message,
            MEDIA_ERR_ABORTED: error?.code === 1,
            MEDIA_ERR_NETWORK: error?.code === 2,
            MEDIA_ERR_DECODE: error?.code === 3,
            MEDIA_ERR_SRC_NOT_SUPPORTED: error?.code === 4,
          })
        }
      }
      audio.addEventListener(eventName, handlers[eventName])
    })

    // Set source and load
    audio.src = audioUrl
    audio.load()
    updateAudioState()

    return () => {
      events.forEach((eventName) => {
        audio.removeEventListener(eventName, handlers[eventName])
      })
    }
  }, [audioUrl])

  // Play/Pause handler
  const handlePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) {
      addDiagnostic("Play attempted but no audio element", {})
      return
    }

    addDiagnostic("Play/Pause clicked", {
      paused: audio.paused,
      readyState: audio.readyState,
      networkState: audio.networkState,
      currentSrc: audio.currentSrc,
    })

    try {
      if (audio.paused) {
        // Check if audio is ready
        if (audio.readyState < 2) {
          addDiagnostic("Audio not ready, attempting load", {
            readyState: audio.readyState,
          })
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
              reject(new Error("Audio failed to load"))
            }
            audio.addEventListener("canplay", canPlayHandler)
            audio.addEventListener("error", errorHandler)

            // Timeout after 10 seconds
            setTimeout(() => {
              audio.removeEventListener("canplay", canPlayHandler)
              audio.removeEventListener("error", errorHandler)
              reject(new Error("Audio load timeout"))
            }, 10000)
          })
        }

        addDiagnostic("Attempting to play", {})
        const playPromise = audio.play()

        if (playPromise !== undefined) {
          await playPromise
          addDiagnostic("Play successful", {})
        }
      } else {
        addDiagnostic("Pausing audio", {})
        audio.pause()
      }
    } catch (error: any) {
      addDiagnostic("Play/Pause error", {
        error: error.message,
        name: error.name,
        stack: error.stack,
      })

      // Try to recover
      if (error.name === "NotAllowedError") {
        addDiagnostic("Browser autoplay policy blocked playback", {
          suggestion: "User interaction required",
        })
      } else if (error.name === "NotSupportedError") {
        addDiagnostic("Audio format not supported", {
          src: audio.currentSrc,
        })
      }
    }
  }

  // Test direct playback
  const testDirectPlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    addDiagnostic("Testing direct playback", {})

    // Create a simple test
    const testAudio = new Audio()
    testAudio.src = audioUrl || ""

    testAudio.addEventListener("canplay", () => {
      addDiagnostic("Test audio can play", {})
    })

    testAudio.addEventListener("error", (e) => {
      addDiagnostic("Test audio error", {
        error: testAudio.error,
      })
    })

    testAudio.load()

    // Try to play after a short delay
    setTimeout(() => {
      testAudio
        .play()
        .then(() => {
          addDiagnostic("Test audio playing successfully", {})
          testAudio.pause()
        })
        .catch((error) => {
          addDiagnostic("Test audio play failed", {
            error: error.message,
          })
        })
    }, 1000)
  }

  // Network state descriptions
  const getNetworkStateDesc = (state: number) => {
    switch (state) {
      case 0:
        return "NETWORK_EMPTY"
      case 1:
        return "NETWORK_IDLE"
      case 2:
        return "NETWORK_LOADING"
      case 3:
        return "NETWORK_NO_SOURCE"
      default:
        return "UNKNOWN"
    }
  }

  // Ready state descriptions
  const getReadyStateDesc = (state: number) => {
    switch (state) {
      case 0:
        return "HAVE_NOTHING"
      case 1:
        return "HAVE_METADATA"
      case 2:
        return "HAVE_CURRENT_DATA"
      case 3:
        return "HAVE_FUTURE_DATA"
      case 4:
        return "HAVE_ENOUGH_DATA"
      default:
        return "UNKNOWN"
    }
  }

  return (
    <div className="space-y-4">
      {/* Audio Element */}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

      {/* Player Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Podcast Player Diagnostic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handlePlayPause} size="lg" variant={isPlaying ? "secondary" : "default"}>
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </>
              )}
            </Button>

            <Button onClick={testDirectPlayback} variant="outline">
              Test Direct Playback
            </Button>

            <Button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.load()
                  addDiagnostic("Manual load triggered", {})
                }
              }}
              variant="outline"
            >
              Force Load
            </Button>
          </div>

          {/* Audio State */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Ready State:</strong> {getReadyStateDesc(audioState.readyState)} ({audioState.readyState})
            </div>
            <div>
              <strong>Network State:</strong> {getNetworkStateDesc(audioState.networkState)} ({audioState.networkState})
            </div>
            <div>
              <strong>Duration:</strong> {audioState.duration || "Unknown"}
            </div>
            <div>
              <strong>Paused:</strong> {audioState.paused ? "Yes" : "No"}
            </div>
            <div>
              <strong>Current Source:</strong>
              <div className="text-xs break-all">{audioState.currentSrc || "None"}</div>
            </div>
            <div>
              <strong>Error:</strong> {audioState.error ? `Code ${audioState.error.code}` : "None"}
            </div>
          </div>

          {/* Buffered Ranges */}
          {audioState.buffered.length > 0 && (
            <div>
              <strong>Buffered Ranges:</strong>
              {audioState.buffered.map((range, i) => (
                <div key={i} className="text-sm">
                  Range {i + 1}: {range.start.toFixed(2)}s - {range.end.toFixed(2)}s
                </div>
              ))}
            </div>
          )}

          {/* Current Audio URL */}
          {audioUrl && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Audio URL:</strong>
                <div className="text-xs break-all mt-1">{audioUrl}</div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Diagnostics Log */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {diagnostics.map((diag, index) => (
              <div key={index} className="text-xs border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-500">{new Date(diag.timestamp).toLocaleTimeString()}</span>
                  <span className="font-semibold">{diag.event}</span>
                </div>
                {Object.keys(diag.details).length > 0 && (
                  <pre className="mt-1 text-gray-600 overflow-x-auto">{JSON.stringify(diag.details, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
