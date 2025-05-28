"use client"

import { useState } from "react"
import { ArrowUpDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SortDropdownProps {
  onSortChange: (option: string) => void
}

export function SortDropdown({ onSortChange }: SortDropdownProps) {
  const [activeSort, setActiveSort] = useState("newest")

  const sortOptions = [
    { id: "newest", label: "🆕 Nouveautés" },
    { id: "popular", label: "🔥 Les plus vus" },
    { id: "recommended", label: "🎯 Suggestions personnalisées" },
    { id: "favorites", label: "❤️ Vos favoris" },
  ]

  const handleSortChange = (option: string) => {
    setActiveSort(option)
    onSortChange(option)
  }

  const activeLabel = sortOptions.find((option) => option.id === activeSort)?.label || sortOptions[0].label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">{activeLabel}</span>
          <span className="sm:hidden">Tri</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleSortChange(option.id)}
          >
            <span>{option.label}</span>
            {activeSort === option.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
