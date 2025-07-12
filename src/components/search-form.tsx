'use client'

import { useState, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"

interface Person {
  id: string
  name: string
  relationship: string
  voice_id: string
  created_at: string
}

interface SearchFormProps extends React.ComponentProps<"form"> {
  onSearchResults?: (persons: Person[]) => void
  onSearchClear?: () => void
}

export function SearchForm({ onSearchResults, onSearchClear, ...props }: SearchFormProps) {
  const [query, setQuery] = useState("")
  const [, setIsLoading] = useState(false)

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onSearchClear?.()
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/persons/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        onSearchResults?.(data.persons || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onSearchResults, onSearchClear])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const handleClear = () => {
    setQuery("")
    onSearchClear?.()
  }

  return (
    <form {...props} onSubmit={(e) => e.preventDefault()}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search people
          </Label>
          <SidebarInput
            id="search"
            value={query}
            onChange={handleInputChange}
            placeholder="Search people..."
            className="pl-8 pr-8"
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-2 size-4 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="size-4" />
            </button>
          )}
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
