'use client'

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { MessageCircle, User, MessageSquarePlus } from "lucide-react"
import { SearchForm } from "@/components/search-form"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface Person {
  id: string
  name: string
  relationship: string
  voice_id: string
  created_at: string
}

interface Conversation {
  id: string
  title: string
  created_at: string
  person: {
    id: string
    name: string
    relationship: string
  }
}

interface PersonWithConversations extends Person {
  conversations: Conversation[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [persons, setPersons] = useState<PersonWithConversations[]>([])
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Load all persons and their conversations
  const loadPersonsAndConversations = async () => {
    try {
      setIsLoading(true)
      
      // Get all persons
      const personsResponse = await fetch('/api/person')
      if (!personsResponse.ok) return
      
      const personsData = await personsResponse.json()
      const allPersons = personsData.persons || []

      // Get conversations for each person
      const personsWithConversations = await Promise.all(
        allPersons.map(async (person: Person) => {
          try {
            const conversationsResponse = await fetch(`/api/conversations?person_id=${person.id}`)
            if (conversationsResponse.ok) {
              const conversationsData = await conversationsResponse.json()
              return {
                ...person,
                conversations: conversationsData.conversations || []
              }
            }
            return { ...person, conversations: [] }
          } catch (error) {
            console.error(`Error loading conversations for ${person.name}:`, error)
            return { ...person, conversations: [] }
          }
        })
      )

      setPersons(personsWithConversations)
    } catch (error) {
      console.error('Error loading persons and conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPersonsAndConversations()
  }, [])

  const handleSearchResults = (results: Person[]) => {
    setSearchResults(results)
    setIsSearching(true)
  }

  const handleSearchClear = () => {
    setSearchResults([])
    setIsSearching(false)
  }

  const createNewConversation = async (personId: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person_id: personId })
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh the data to show new conversation
        await loadPersonsAndConversations()
        // Navigate to the new conversation
        router.push(`/dashboard/person/${personId}/conversation/${data.conversation.id}`)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const displayPersons = isSearching ? searchResults.map(p => ({ ...p, conversations: [] })) : persons

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <MessageCircle className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Echo</span>
                  <span className="text-xs">Voice conversations</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm onSearchResults={handleSearchResults} onSearchClear={handleSearchClear} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>People</SidebarGroupLabel>
          <SidebarMenu>
            {isLoading ? (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  Loading...
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : displayPersons.length === 0 ? (
              <SidebarMenuItem>
                <SidebarMenuButton disabled>
                  {isSearching ? 'No search results' : 'No people yet'}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              displayPersons.map((person) => (
                <div key={person.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <User className="size-4" />
                      <span className="flex-1 text-left">{person.name}</span>
                      <span className="text-xs text-muted-foreground mr-2">
                        {person.relationship}
                      </span>
                      <button
                        onClick={() => createNewConversation(person.id)}
                        className="ml-auto p-1 hover:bg-accent rounded-sm"
                      >
                        <MessageSquarePlus className="size-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuSub>
                    {/* Existing Conversations */}
                    {person.conversations.map((conversation) => (
                      <SidebarMenuSubItem key={conversation.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.includes(`/conversation/${conversation.id}`)}
                        >
                          <a href={`/dashboard/person/${person.id}/conversation/${conversation.id}`}>
                            <MessageCircle className="size-4" />
                            {conversation.title}
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    
                    {person.conversations.length === 0 && !isSearching && (
                      <SidebarMenuSubItem>
                        <div className="text-muted-foreground italic px-2 py-1 text-sm">
                          No conversations yet
                        </div>
                      </SidebarMenuSubItem>
                    )}
                  </SidebarMenuSub>
                </div>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
