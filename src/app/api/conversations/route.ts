import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@/src/lib/supabase-server'
import { getUser } from '@/src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { person_id, title } = await request.json()

    if (!person_id) {
      return NextResponse.json({ error: 'Person ID is required' }, { status: 400 })
    }

    const supabase = await createServerActionClient()
    
    // Verify the person belongs to the user
    const { data: person, error: personError } = await supabase
      .from('persons')
      .select('id, name')
      .eq('id', person_id)
      .eq('user_id', user.id)
      .single()

    if (personError || !person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    // Create new conversation
    const conversationTitle = title || `Chat with ${person.name}`
    
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        person_id,
        title: conversationTitle,
      })
      .select()
      .single()

    if (conversationError) {
      console.error('Conversation creation error:', conversationError)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json({ 
      conversation: {
        ...conversation,
        person: {
          id: person.id,
          name: person.name
        }
      }
    })
  } catch (error) {
    console.error('Conversation creation error:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('person_id')

    const supabase = await createServerActionClient()
    
    let query = supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        person:persons!inner(
          id,
          name,
          relationship,
          user_id
        )
      `)
      .eq('persons.user_id', user.id)
      .order('created_at', { ascending: false })

    if (personId) {
      query = query.eq('person_id', personId)
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Conversations fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    return NextResponse.json({ conversations: conversations || [] })
  } catch (error) {
    console.error('Conversations fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}