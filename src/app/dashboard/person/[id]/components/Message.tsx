'use client'

import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Card, CardContent } from '@/src/components/ui/card'
import VoicePlayer from './VoicePlayer'
import { User } from 'lucide-react'

interface MessageProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
  }
  personName: string
}

export default function Message({ message, personName }: MessageProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="flex-shrink-0">
        <AvatarFallback>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            personName.split(' ').map(n => n[0]).join('')
          )}
        </AvatarFallback>
      </Avatar>
      
      <Card className={`max-w-md ${isUser ? 'bg-blue-500 text-white' : 'bg-white'}`}>
        <CardContent className="p-3">
          <p className="text-sm">{message.content}</p>
          
          {!isUser && message.id && (
            <div className="mt-2">
              <VoicePlayer messageId={message.id} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}