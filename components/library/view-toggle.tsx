"use client"

import { LayoutGrid, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface ViewToggleProps {
  activeView: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}

export function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={activeView}
      onValueChange={(value) => value && onViewChange(value as "grid" | "list")}
    >
      <ToggleGroupItem value="grid" aria-label="Vue en grille" className="px-3">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="Vue en liste" className="px-3">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
