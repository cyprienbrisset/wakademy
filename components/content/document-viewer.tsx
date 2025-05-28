"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentViewerProps {
  src: string
}

export default function DocumentViewer({ src }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(100)

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 25)
    }
  }

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 25)
    }
  }

  const handleDownload = () => {
    window.open(src, "_blank")
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex justify-between items-center p-2 bg-muted">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page {currentPage} sur {totalPages}
          </span>

          <Button variant="outline" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="text-sm">{zoom}%</span>

          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-grow bg-muted-foreground/10 overflow-auto flex items-center justify-center">
        <iframe
          src={src}
          className="w-full h-full border-0"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
          title="Document Viewer"
          onLoad={() => {
            // Dans une vraie application, vous pourriez obtenir le nombre total de pages
            // à partir du document chargé
            setTotalPages(Math.max(1, Math.floor(Math.random() * 10) + 1))
          }}
        />
      </div>
    </div>
  )
}
