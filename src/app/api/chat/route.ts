import { openai } from '@ai-sdk/openai'
import { streamText, appendResponseMessages, generateId } from 'ai'
import { createServerActionClient } from '@/src/lib/supabase-server'
import { getUser } from '@/src/lib/auth'
import { canSendMessage } from '@/src/lib/rateLimit'
import { createSystemPrompt } from '@/src/lib/ai'
import { speak } from '@/src/lib/tts'

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check rate limit
    const canSend = await canSendMessage(user.id)
    if (!canSend) {
      return new Response('Message limit exceeded', { status: 429 })
    }

    const { messages, id: conversationId } = await request.json()

    const supabase = await createServerActionClient()
    
    // Get conversation and person details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        person:persons(*)
      `)
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return new Response('Conversation not found', { status: 404 })
    }

    const person = conversation.person
    
    // Prepare messages for AI with system prompt
    const systemPrompt = createSystemPrompt(person.name, person.relationship)
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    const result = streamText({
      model: openai('gpt-3.5-turbo'),
      messages: aiMessages,
      async onFinish({ response }) {
        try {
          // Get the assistant's response text from the response messages
          const assistantMessage = response.messages[0]
          
          // Extract text content from the content array
          let assistantContent = ''
          if (assistantMessage && assistantMessage.content) {
            if (Array.isArray(assistantMessage.content)) {
              // If content is an array, extract text from text parts
              assistantContent = assistantMessage.content
                .filter(part => part.type === 'text')
                .map(part => part.text)
                .join('')
            } else if (typeof assistantMessage.content === 'string') {
              assistantContent = assistantMessage.content
            }
          }

          let audioUrl = null

          // Generate audio for assistant response
          if (assistantContent && typeof assistantContent === 'string') {
            try {
              const audioBuffer = await speak(person.voice_id, assistantContent)
              
              // Upload audio to Supabase storage using user ID for RLS policies
              const audioFileName = `${user.id}/${Date.now()}.mp3`
              
              const { data: audioUpload, error: audioError } = await supabase.storage
                .from('generated-audio')
                .upload(audioFileName, audioBuffer, {
                  contentType: 'audio/mpeg',
                  cacheControl: '3600',
                  upsert: false
                })

              if (audioError) {
                console.error('Audio upload error:', audioError)
              } else {
                // Use signed URL instead of public URL for better security and reliability
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                  .from('generated-audio')
                  .createSignedUrl(audioUpload.path, 3600) // 1 hour expiry
                
                if (signedUrlError) {
                  console.error('Signed URL creation error:', signedUrlError)
                  // Fallback to public URL
                  const { data: { publicUrl } } = supabase.storage
                    .from('generated-audio')
                    .getPublicUrl(audioUpload.path)
                  audioUrl = publicUrl
                } else {
                  audioUrl = signedUrlData.signedUrl
                }
              }
            } catch (audioError) {
              console.error('Audio generation error:', audioError)
            }
          }

          // Save user message first
          const userMessage = messages[messages.length - 1]
          
          const { error: userSaveError } = await supabase
            .from('messages')
            .insert({
              id: userMessage.id,
              conversation_id: conversationId,
              role: userMessage.role,
              content: userMessage.content,
              created_at: new Date().toISOString(),
            })

          if (userSaveError) {
            console.error('Error saving user message:', userSaveError)
          }

          // Save assistant message using the ID from the response
          const assistantMessageId = assistantMessage.id
          
          const { error: assistantSaveError } = await supabase
            .from('messages')
            .insert({
              id: assistantMessageId,
              conversation_id: conversationId,
              role: 'assistant',
              content: assistantContent || 'No response generated',
              audio_url: audioUrl,
              created_at: new Date().toISOString(),
            })

          if (assistantSaveError) {
            console.error('Error saving assistant message:', assistantSaveError)
          }
        } catch (error) {
          console.error('onFinish error:', error)
        }
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Chat failed', { status: 500 })
  }
}