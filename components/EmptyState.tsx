'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Plus, Users } from 'lucide-react'
import AddPersonModal from './AddPersonModal'

export default function EmptyState() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handlePersonAdded = () => {
    setIsAddModalOpen(false)
    window.location.reload() // Simple refresh to show new person
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Users className="h-12 w-12 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Welcome to Voice Notes for the Dead</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Create voice memories of your loved ones. Upload a voice sample to get started 
          and have conversations with those who matter most.
        </p>
        
        <Button
          onClick={() => setIsAddModalOpen(true)}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Your First Person
        </Button>
      </div>

      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPersonAdded={handlePersonAdded}
      />
    </>
  )
}