"use client"

import { useState } from "react"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FilterPanelProps {
  onFilterChange: (filters: string[]) => void
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Filter categories
  const contentTypes = [
    { id: "video", label: "Vidéo", icon: "🎥" },
    { id: "podcast", label: "Podcast", icon: "🎧" },
    { id: "document", label: "Document", icon: "📄" },
  ]

  const categories = [
    { id: "marketing", label: "Marketing" },
    { id: "leadership", label: "Leadership" },
    { id: "data", label: "Analyse de données" },
    { id: "security", label: "Sécurité" },
    { id: "hr", label: "Ressources Humaines" },
    { id: "tech", label: "Technologie" },
  ]

  const tags = [
    { id: "digital", label: "Digital" },
    { id: "management", label: "Management" },
    { id: "ai", label: "Intelligence Artificielle" },
    { id: "soft-skills", label: "Soft Skills" },
    { id: "strategy", label: "Stratégie" },
    { id: "innovation", label: "Innovation" },
  ]

  const durations = [
    { id: "short", label: "< 5 min" },
    { id: "medium", label: "5-15 min" },
    { id: "long", label: "> 15 min" },
  ]

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(filterId)) {
        return prev.filter((id) => id !== filterId)
      } else {
        return [...prev, filterId]
      }
    })
  }

  const applyFilters = () => {
    onFilterChange(activeFilters)
    setIsOpen(false)
  }

  const resetFilters = () => {
    setActiveFilters([])
    onFilterChange([])
  }

  const FilterSection = ({
    title,
    items,
    isCollapsible = true,
  }: {
    title: string
    items: { id: string; label: string; icon?: string }[]
    isCollapsible?: boolean
  }) => {
    const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(true)

    const content = (
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center">
            <Button
              variant="ghost"
              className={`flex items-center justify-start w-full px-2 py-1 h-auto text-sm ${
                activeFilters.includes(item.id) ? "bg-primary/20 text-primary" : ""
              }`}
              onClick={() => toggleFilter(item.id)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </Button>
          </div>
        ))}
      </div>
    )

    if (!isCollapsible) {
      return (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{title}</h3>
          {content}
        </div>
      )
    }

    return (
      <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen} className="space-y-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
            <h3 className="text-sm font-medium">{title}</h3>
            {isCollapsibleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>{content}</CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <>
      {/* Mobile Filter Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-6">
            <FilterSection title="Type de contenu" items={contentTypes} isCollapsible={false} />
            <FilterSection title="Catégories" items={categories} />
            <FilterSection title="Tags" items={tags} />
            <FilterSection title="Durée" items={durations} />
          </div>
          <SheetFooter className="flex flex-row justify-between">
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <SheetClose asChild>
              <Button onClick={applyFilters}>Appliquer</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
