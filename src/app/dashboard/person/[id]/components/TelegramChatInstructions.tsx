'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'

interface TelegramChatInstructionsProps {
  person: {
    id: string
    name: string
    relationship: string
  }
  userId: string
}

export default function TelegramChatInstructions({ person, userId }: TelegramChatInstructionsProps) {
  const [telegramLinked, setTelegramLinked] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [codeExpiry, setCodeExpiry] = useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = useState(false)

  useEffect(() => {
    checkTelegramRegistration()
  }, [])

  const checkTelegramRegistration = async () => {
    try {
      const response = await fetch('/api/telegram/register')
      const data = await response.json()
      setTelegramLinked(data.has_telegram_account)
    } catch (error) {
      console.error('Error checking Telegram registration:', error)
      setTelegramLinked(false)
    } finally {
      setLoading(false)
    }
  }

  const generateLinkCode = async () => {
    setGeneratingCode(true)
    try {
      const response = await fetch('/api/telegram/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const data = await response.json()
      setLinkCode(data.code)
      setCodeExpiry(data.expires_at)
      
      // Auto-clear code after expiry
      setTimeout(() => {
        setLinkCode(null)
        setCodeExpiry(null)
      }, 10 * 60 * 1000) // 10 minutes

    } catch (error) {
      console.error('Error generating link code:', error)
      alert('Failed to generate link code. Please try again.')
    } finally {
      setGeneratingCode(false)
    }
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'echo_personas_bot'

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking Telegram connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.302 1.927-1.12 2.282-2.313 1.899-.514-.165-1.696-.629-2.514-1.067l-1.204-.635c-.513-.27-.513-.513 0-.783l3.743-3.462c.513-.454.21-.724-.302-.27l-4.558 2.921c-.574.302-1.444.344-2.202.125l-1.982-.574c-.693-.199-.704-.693.145-1.025l9.394-3.69c.785-.29 1.47.175 1.197 1.063l.002.01z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chat via Telegram
            </h2>
            <p className="text-gray-600">
              All conversations with {person.name} now happen through our Telegram bot for the best mobile experience.
            </p>
          </div>

          {telegramLinked ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-medium">Telegram account connected!</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">How to start chatting:</h3>
                <ol className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">1</span>
                    Open Telegram and find our bot: <code className="bg-blue-100 px-2 py-1 rounded ml-1">@{botUsername}</code>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">2</span>
                    Send the command: <code className="bg-blue-100 px-2 py-1 rounded ml-1">/chat {person.name.toLowerCase()}</code>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">3</span>
                    Start your conversation! Send any message to begin.
                  </li>
                </ol>
              </div>

              <div className="text-center space-y-3">
                <Button
                  onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
                  className="w-full"
                >
                  Open Telegram Bot
                </Button>
                
                <p className="text-sm text-gray-500">
                  You'll receive both text and voice responses from {person.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-amber-800 font-medium">Telegram not connected yet</span>
                </div>
              </div>

              {/* Link Code Generation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Step 1: Generate Link Code</h3>
                
                {linkCode ? (
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                      <div className="text-center">
                        <div className="text-sm text-blue-600 mb-1">Your Link Code:</div>
                        <div className="text-3xl font-mono font-bold text-blue-900 tracking-wider">
                          {linkCode}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Expires in 10 minutes
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-800">
                      Now go to Telegram and send: <code className="bg-blue-100 px-2 py-1 rounded">/link {linkCode}</code>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={generateLinkCode}
                    disabled={generatingCode}
                    className="w-full"
                  >
                    {generatingCode ? 'Generating...' : 'Generate Link Code'}
                  </Button>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Step 2: Link Your Telegram Account</h3>
                <ol className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">1</span>
                    Open Telegram and find our bot: <code className="bg-gray-100 px-2 py-1 rounded ml-1">@{botUsername}</code>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">2</span>
                    Send <code className="bg-gray-100 px-2 py-1 rounded ml-1">/link YOUR_CODE</code> (using the code above)
                  </li>
                  <li className="flex items-start">
                    <span className="bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">3</span>
                    Bot will confirm the linking
                  </li>
                  <li className="flex items-start">
                    <span className="bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5">4</span>
                    Refresh this page to see connected status
                  </li>
                </ol>
              </div>

              <div className="text-center space-y-3">
                <Button
                  onClick={() => window.open(`https://t.me/${botUsername}`, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Open Telegram Bot
                </Button>
                
                <Button
                  onClick={checkTelegramRegistration}
                  variant="ghost"
                  className="w-full"
                >
                  Refresh Connection Status
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">Available Bot Commands:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div><code>/start</code> - Welcome and setup</div>
              <div><code>/personas</code> - List your available personas</div>
              <div><code>/chat &lt;name&gt;</code> - Start chatting with a persona</div>
              <div><code>/stop</code> - End current chat session</div>
              <div><code>/help</code> - Show help message</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}