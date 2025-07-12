'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Upload, Loader2 } from 'lucide-react'

interface AddPersonModalProps {
  isOpen: boolean
  onClose: () => void
  onPersonAdded: () => void
}

export default function AddPersonModal({ isOpen, onClose, onPersonAdded }: AddPersonModalProps) {
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !relationship || !audioFile) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('relationship', relationship)
      formData.append('audioFile', audioFile)

      const response = await fetch('/api/person', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setName('')
        setRelationship('')
        setAudioFile(null)
        onPersonAdded()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create person')
      }
    } catch (error) {
      console.error('Error creating person:', error)
      alert('Failed to create person')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Person</DialogTitle>
          <DialogDescription>
            Create a voice memory by uploading an audio sample of your loved one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter their name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Relationship</label>
            <Select value={relationship} onValueChange={setRelationship} required>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grandparent">Grandparent</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Voice Sample</label>
            <div className="mt-1">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="audio-upload"
                required
              />
              <label
                htmlFor="audio-upload"
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400"
              >
                <Upload className="h-5 w-5 mr-2" />
                {audioFile ? audioFile.name : 'Upload audio file'}
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload a clear audio sample (MP3, WAV, etc.) for voice cloning
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Person'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}