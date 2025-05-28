"use client"

import { useState } from "react"
import Image from "next/image"
import { Film, Headphones, FileText } from "lucide-react"
import { ContentModal } from "./content-modal"

interface Content {
  id: string
  title: string
  thumbnail: string
  type: "video" | "podcast" | "document"
}

interface ContentGridProps {
  contents: Content[]
}

export function ContentGrid({ contents }: ContentGridProps) {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Film className="h-4 w-4" />
      case "podcast":
        return <Headphones className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {contents.map((content) => (
          <div key={content.id} className="group cursor-pointer" onClick={() => setSelectedContent(content)}>
            <div className="relative aspect-video overflow-hidden rounded-md">
              <Image
                src={content.thumbnail || "/placeholder.svg?height=200&width=350&query=content thumbnail"}
                alt={content.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">{content.title}</h3>
                <div className="flex items-center text-xs mt-1">
                  {getTypeIcon(content.type)}
                  <span className="ml-1 capitalize">{content.type}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedContent && <ContentModal content={selectedContent} onClose={() => setSelectedContent(null)} />}
    </>
  )
}
