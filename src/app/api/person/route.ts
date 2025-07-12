import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@/src/lib/supabase-server'
import { getUser } from '@/src/lib/auth'
import { cloneVoice } from '@/src/lib/tts'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const relationship = formData.get('relationship') as string
    const audioFile = formData.get('audioFile') as File
    
    if (!name || !relationship || !audioFile) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, relationship, audioFile' 
      }, { status: 400 })
    }

    // Clone the voice using ElevenLabs
    const voiceId = await cloneVoice(audioFile, name)
    
    if (!voiceId) {
      return NextResponse.json({ 
        error: 'Failed to clone voice - no voice ID returned' 
      }, { status: 500 })
    }

    // Save person to database
    const supabase = await createServerActionClient()
    const { data: person, error } = await supabase
      .from('persons')
      .insert({
        user_id: user.id,
        name,
        relationship,
        voice_id: voiceId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create initial conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        person_id: person.id,
        title: `Chat with ${name}`,
      })
      .select()
      .single()

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    return NextResponse.json({ person, conversation })
  } catch (error) {
    console.error('Person creation error:', error)
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerActionClient()
    const { data: persons, error } = await supabase
      .from('persons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ persons })
  } catch (error) {
    console.error('Fetch persons error:', error)
    return NextResponse.json({ error: 'Failed to fetch persons' }, { status: 500 })
  }
}