"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Content } from "@/lib/content/content-service"

interface AISummaryProps {
  content: Content
}

export default function AISummary({ content }: AISummaryProps) {
  const [expanded, setExpanded] = useState(false)

  // Si pas de résumé AI disponible
  if (!content.aiSummary) {
    return (
      <div className="p-4 bg-card rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-medium">Résumé AI</h3>
        </div>
        <p className="text-muted-foreground">Aucun résumé AI disponible pour ce contenu.</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-medium">Résumé AI</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="flex items-center gap-1">
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Réduire</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Voir plus</span>
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <p>{content.aiSummary.summary}</p>

        {expanded && content.aiSummary.keyPoints && content.aiSummary.keyPoints.length > 0 && (
          <div>
            <h4 className="font-medium mt-4 mb-2">Points clés</h4>
            <ul className="list-disc pl-5 space-y-1">
              {content.aiSummary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
