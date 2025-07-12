'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { MessageCircle, Clock } from 'lucide-react'

interface Person {
  id: string
  name: string
  relationship: string
  created_at: string
}

interface PersonListProps {
  persons: Person[]
}

export default function PersonList({ persons }: PersonListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {persons.map((person) => (
        <Link key={person.id} href={`/dashboard/person/${person.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarFallback className="text-lg">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{person.name}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">
                  {person.relationship}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(person.created_at).toLocaleDateString()}
                </div>
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}