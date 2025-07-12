import { NextRequest } from 'next/server'
import { createServerActionClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { canSendMessage } from '@/lib/rateLimit'
import { chat, createSystemPrompt } from '@/lib/ai'
import { speak } from '@/lib/tts'
import { StreamingTextResponse } from 'ai'

export async function POST(request: NextRequest) {
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

    const { messages, conversationId } = await request.json()

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
    
    // Save user message
    const userMessage = messages[messages.length - 1]
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender: 'user',
        text: userMessage.content,
      })

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError)
    }

    // Prepare messages for AI
    const systemPrompt = createSystemPrompt(person.name, person.relationship)
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Get AI response
    const completion = await chat(aiMessages)

    // Create a transform stream to handle the AI response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            fullResponse += content
            
            // Send the text chunk to the client
            controller.enqueue(new TextEncoder().encode(content))
          }

          // Generate audio for the complete response
          if (fullResponse.trim()) {
            try {
              const audioBuffer = await speak(person.voice_id, fullResponse)
              
              // Upload audio to Supabase storage
              const audioFileName = `${conversationId}/${Date.now()}.mp3`
              const { data: audioUpload, error: audioError } = await supabase.storage
                .from('generated-audio')
                .upload(audioFileName, audioBuffer, {
                  contentType: 'audio/mpeg',
                })

              let audioUrl = null
              if (!audioError && audioUpload) {
                const { data: { publicUrl } } = supabase.storage
                  .from('generated-audio')
                  .getPublicUrl(audioUpload.path)
                audioUrl = publicUrl
              }

              // Save AI message with audio URL
              await supabase
                .from('messages')
                .insert({
                  conversation_id: conversationId,
                  sender: 'ai',
                  text: fullResponse,
                  audio_url: audioUrl,
                })
            } catch (audioError) {
              console.error('Audio generation error:', audioError)
              // Save message without audio if audio generation fails
              await supabase
                .from('messages')
                .insert({
                  conversation_id: conversationId,
                  sender: 'ai',
                  text: fullResponse,
                })
            }
          }
          
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Chat failed', { status: 500 })
  }
}