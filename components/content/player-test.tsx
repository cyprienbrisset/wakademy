"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PodcastPlayer from "./podcast-player"
import VideoPlayer from "./video-player"

export function PlayerTest() {
  const [showPlayers, setShowPlayers] = useState(false)

  const testPodcastContent = {
    id: "test-podcast-1",
    title: "Test Podcast",
    author: "Test Author",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnailUrl: "/placeholder.svg?height=128&width=128&query=podcast",
  }

  const testVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  const testVideoPoster = "/placeholder.svg?height=400&width=600&query=video"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test des lecteurs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setShowPlayers(!showPlayers)}>
            {showPlayers ? "Masquer" : "Afficher"} les lecteurs de test
          </Button>

          {showPlayers && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Lecteur Audio (Podcast)</h3>
                <PodcastPlayer content={testPodcastContent} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Lecteur Vidéo</h3>
                <VideoPlayer src={testVideoUrl} poster={testVideoPoster} contentId="test-video-1" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
