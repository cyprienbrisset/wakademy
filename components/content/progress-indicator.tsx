"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock } from "lucide-react"
import { getContentProgress } from "@/lib/content/progress-service"
import type { ContentProgress } from "@/lib/content/progress-service"

interface ProgressIndicatorProps {
  contentId: string
}

export function ProgressIndicator({ contentId }: ProgressIndicatorProps) {
  const [progress, setProgress] = useState<ContentProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProgress() {
      setLoading(true)
      const data = await getContentProgress(contentId)
      setProgress(data)
      setLoading(false)
    }

    loadProgress()
  }, [contentId])

  if (loading) {
    return <div className="h-1.5 bg-muted animate-pulse rounded-full" />
  }

  if (!progress) {
    return null
  }

  // Formater le temps restant
  const formatTimeRemaining = (current: number, total: number) => {
    const remaining = Math.max(0, total - current)
    const minutes = Math.floor(remaining / 60)
    const seconds = Math.floor(remaining % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center">
          {progress.is_completed ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Terminé
            </Badge>
          ) : (
            <span className="text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeRemaining(progress.current_position, progress.duration)} restant
            </span>
          )}
        </div>
        <span className="font-medium">{Math.round(progress.percentage)}%</span>
      </div>
      <Progress value={progress.percentage} className="h-1.5" />
    </div>
  )
}
