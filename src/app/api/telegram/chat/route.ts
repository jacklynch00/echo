import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateId, generateText } from 'ai'
import { createServerActionClient, createServiceRoleClient } from '@/src/lib/supabase-server'
import { createSystemPrompt } from '@/src/lib/ai'
import { speak } from '@/src/lib/tts'
import { telegramBot } from '@/src/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { 
      telegram_id, 
      conversation_id, 
      message_content,
      person_id 
    } = await request.json()

    if (!telegram_id || !conversation_id || !message_content || !person_id) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Verify the Telegram user exists and get their Supabase user ID
    const telegramUser = await telegramBot.findOrCreateTelegramUser({
      id: telegram_id,
      is_bot: false,
      first_name: '',
      username: undefined,
      last_name: undefined,
      language_code: undefined
    })

    if (!telegramUser) {
      return NextResponse.json(
        { error: 'Telegram user not found' }, 
        { status: 404 }
      )
    }

    const supabase = await createServerActionClient()
    
    // Get conversation and person details with authorization check
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        person:persons(*)
      `)
      .eq('id', conversation_id)
      .eq('person_id', person_id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or unauthorized' }, 
        { status: 404 }
      )
    }

    // Verify the person belongs to this user
    if (conversation.person.user_id !== telegramUser.user_id) {
      return NextResponse.json(
        { error: 'Unauthorized access to persona' }, 
        { status: 403 }
      )
    }

    const person = conversation.person

    // Get recent conversation history (last 10 messages)
    const { data: recentMessages, error: historyError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (historyError) {
      console.error('Error fetching conversation history:', historyError)
      return NextResponse.json(
        { error: 'Failed to fetch conversation history' }, 
        { status: 500 }
      )
    }

    // Reverse to get chronological order
    const messages = (recentMessages || []).reverse()

    // Prepare messages for AI with system prompt
    const systemPrompt = createSystemPrompt(person.name, person.relationship)
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: message_content }
    ]

    // Generate AI response
    const result = await generateText({
      model: openai('gpt-3.5-turbo'),
      messages: aiMessages,
      temperature: 0.8,
    })

    const assistantContent = result.text

    // Generate unique IDs for messages
    const userMessageId = generateId()
    const assistantMessageId = generateId()

    let audioUrl = null

    // Generate audio for assistant response
    if (assistantContent && typeof assistantContent === 'string') {
      try {
        const audioBuffer = await speak(person.voice_id, assistantContent)
        
        // Use service role client for storage operations to bypass RLS
        const serviceSupabase = createServiceRoleClient()
        
        // Upload audio to Supabase storage
        const audioFileName = `${telegramUser.user_id}/${Date.now()}.mp3`
        
        const { data: audioUpload, error: audioError } = await serviceSupabase.storage
          .from('generated-audio')
          .upload(audioFileName, audioBuffer, {
            contentType: 'audio/mpeg',
            cacheControl: '3600',
            upsert: false
          })

        if (audioError) {
          console.error('Audio upload error:', audioError)
        } else {
          // Get signed URL for audio
          const { data: signedUrlData, error: signedUrlError } = await serviceSupabase.storage
            .from('generated-audio')
            .createSignedUrl(audioUpload.path, 3600) // 1 hour expiry
          
          if (signedUrlError) {
            console.error('Signed URL creation error:', signedUrlError)
            // Fallback to public URL
            const { data: { publicUrl } } = serviceSupabase.storage
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

    // Save user message
    const { error: userSaveError } = await supabase
      .from('messages')
      .insert({
        id: userMessageId,
        conversation_id: conversation_id,
        role: 'user',
        content: message_content,
        created_at: new Date().toISOString(),
      })

    if (userSaveError) {
      console.error('Error saving user message:', userSaveError)
    }

    // Save assistant message
    const { error: assistantSaveError } = await supabase
      .from('messages')
      .insert({
        id: assistantMessageId,
        conversation_id: conversation_id,
        role: 'assistant',
        content: assistantContent,
        audio_url: audioUrl,
        created_at: new Date().toISOString(),
      })

    if (assistantSaveError) {
      console.error('Error saving assistant message:', assistantSaveError)
    }

    return NextResponse.json({
      success: true,
      response: {
        content: assistantContent,
        audio_url: audioUrl,
        message_id: assistantMessageId
      }
    })

  } catch (error) {
    console.error('Telegram chat error:', error)
    return NextResponse.json(
      { error: 'Chat failed' }, 
      { status: 500 }
    )
  }
}