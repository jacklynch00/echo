'use client'

import { useState } from 'react'
import { Phone, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PhoneCallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personName: string
  onCall: (phoneNumber: string) => Promise<void>
}

export function PhoneCallDialog({ 
  open, 
  onOpenChange, 
  personName, 
  onCall 
}: PhoneCallDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      setError('Phone number is required')
      return
    }

    // Basic validation for E.164 format
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError('Phone number must be in E.164 format (e.g., +1234567890)')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await onCall(phoneNumber)
      // Close dialog on success
      onOpenChange(false)
      setPhoneNumber('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate call')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setPhoneNumber('')
        setError(null)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call {personName}
          </DialogTitle>
          <DialogDescription>
            Enter your phone number to receive a call from {personName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCall}
              disabled={isLoading || !phoneNumber.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calling...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}