'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import Message from './Message'

interface ChatWindowProps {
  person: {
    id: string
    name: string
    relationship: string
    voice_id: string
  }
  conversation: {
    id: string
    title: string
  }
  initialMessages: Array<{
    id: string
    sender: 'user' | 'ai'
    text: string
    audio_url?: string
    created_at: string
  }>
}

export default function ChatWindow({ person, conversation, initialMessages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const { messages, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      conversationId: conversation.id,
    },
    initialMessages: initialMessages.map(msg => ({
      id: msg.id,
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    onFinish: () => {
      // Refresh the page to get the latest messages with audio
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    handleSubmit(e)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {initialMessages.map((message) => (
          <Message
            key={message.id}
            message={{
              ...message,
              role: message.sender === 'user' ? 'user' : 'assistant',
              content: message.text,
            }}
            personName={person.name}
          />
        ))}
        
        {/* Show streaming messages */}
        {messages.slice(initialMessages.length).map((message) => (
          <Message
            key={message.id}
            message={message}
            personName={person.name}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{person.name} is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-6">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Type a message to ${person.name}...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}