"use client"

import { Star, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Content } from "@/lib/content/content-service"

interface TopCreamBadgeProps {
  content: Content
}

export function TopCreamBadge({ content }: TopCreamBadgeProps) {
  if (!content.is_topcream_content) {
    return null
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <Crown className="h-3 w-3 mr-1" />
        TopCream
      </Badge>
      
      {content.rating && (
        <div className="flex items-center gap-1">
          <div className="flex">
            {renderStars(content.rating)}
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            {content.rating}/5
          </span>
        </div>
      )}
      
      {content.curator && (
        <span className="text-xs text-muted-foreground">
          Curé par {content.curator}
        </span>
      )}
    </div>
  )
}

export default TopCreamBadge 