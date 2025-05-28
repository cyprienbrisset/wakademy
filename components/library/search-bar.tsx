"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Mock suggestions based on query
  const suggestions = [
    "Marketing digital",
    "Leadership",
    "Analyse de données",
    "Management d'équipe",
    "Cybersécurité",
    "Intelligence artificielle",
  ].filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    // Handle clicks outside of the search component
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery("")
    onSearch("")
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher des vidéos, podcasts, documents..."
            className="pl-10 pr-10 bg-background border-muted-foreground/20 focus-visible:ring-primary"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length > 0 && setShowSuggestions(true)}
          />
          {query.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-10 w-full mt-1 p-2 bg-card/95 backdrop-blur-sm border border-muted-foreground/20 shadow-lg">
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
