'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Button } from '@/src/components/ui/button'
import { Plus, MessageCircle } from 'lucide-react'
import { createClientComponentClient } from '@/src/lib/supabase'
import AddPersonModal from './AddPersonModal'

interface Person {
  id: string
  name: string
  relationship: string
  created_at: string
}

export default function Sidebar() {
  const [persons, setPersons] = useState<Person[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPersons()
  }, [])

  async function fetchPersons() {
    const { data } = await supabase
      .from('persons')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setPersons(data)
    }
  }

  const handlePersonAdded = () => {
    fetchPersons()
    setIsAddModalOpen(false)
  }

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Voice Notes</h2>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full mt-3"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {persons.map((person) => (
            <Link
              key={person.id}
              href={`/dashboard/person/${person.id}`}
              className={`flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 ${
                pathname.includes(person.id) ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <Avatar>
                <AvatarFallback>
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{person.name}</p>
                <p className="text-sm text-gray-500 capitalize">{person.relationship}</p>
              </div>
              <MessageCircle className="h-4 w-4 text-gray-400" />
            </Link>
          ))}
          
          {persons.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p>No persons added yet.</p>
              <p className="text-sm mt-1">Click "Add Person" to get started.</p>
            </div>
          )}
        </div>
      </div>

      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPersonAdded={handlePersonAdded}
      />
    </>
  )
}