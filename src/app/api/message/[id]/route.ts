import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@/src/lib/supabase-server'
import { getUser } from '@/src/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerActionClient()
    
    // Get message with user authorization check using proper joins
    const { data: message, error } = await supabase
      .from('messages')
      .select(`
        *,
        conversations!inner(
          id,
          persons!inner(
            user_id
          )
        )
      `)
      .eq('id', id)
      .eq('conversations.persons.user_id', user.id)
      .single()

    if (error) {
      console.error('Message fetch error:', error)
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: message.id,
      role: message.role,
      content: message.content,
      audio_url: message.audio_url,
      created_at: message.created_at,
    })
  } catch (error) {
    console.error('Message fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 })
  }
}