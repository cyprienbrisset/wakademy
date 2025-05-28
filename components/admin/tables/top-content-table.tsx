"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getTopContent } from "@/lib/admin/data-service"
import { Video, Headphones, FileText, Star, Loader2 } from "lucide-react"

interface TopContentTableProps {
  timeFilter: "7d" | "30d" | "90d"
}

export function TopContentTable({ timeFilter }: TopContentTableProps) {
  const [topContent, setTopContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getTopContent(timeFilter)
        setTopContent(data)
      } catch (error) {
        console.error("Error fetching top content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (topContent.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Aucun contenu trouvé</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Contenu</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Vues</TableHead>
            <TableHead className="text-right">Durée moyenne</TableHead>
            <TableHead className="text-right">Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topContent.map((content) => (
            <TableRow key={content.id}>
              <TableCell className="font-medium">{content.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center w-fit gap-1">
                  {content.type === "video" && <Video className="h-3 w-3" />}
                  {content.type === "podcast" && <Headphones className="h-3 w-3" />}
                  {content.type === "document" && <FileText className="h-3 w-3" />}
                  {content.type}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{content.views}</TableCell>
              <TableCell className="text-right">{content.avgDuration} min</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  {content.rating}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
