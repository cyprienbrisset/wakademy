"use client"

import { ContentCard } from "./content-card"
import { ContentListItem } from "./content-list-item"

interface Content {
  id: string
  title: string
  description: string
  type: string
  author: string
  duration: string
  category: string
  createdAt: string
  views: number
  thumbnailUrl: string
}

interface ContentGridProps {
  contents: Content[]
  viewMode: "grid" | "list"
}

export function ContentGrid({ contents, viewMode }: ContentGridProps) {
  if (!contents || contents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Aucun contenu trouvé</p>
      </div>
    )
  }

  return (
    <div>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map((content) => (
            <ContentListItem key={content.id} content={content} />
          ))}
        </div>
      )}
    </div>
  )
}
