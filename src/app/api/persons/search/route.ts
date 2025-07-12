import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@/src/lib/supabase-server'
import { getUser } from '@/src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query) {
      return NextResponse.json({ persons: [] })
    }

    const supabase = await createServerActionClient()
    
    // Fuzzy search using ILIKE for partial matches
    const { data: persons, error } = await supabase
      .from('persons')
      .select('id, name, relationship, voice_id, created_at')
      .eq('user_id', user.id)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Person search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    return NextResponse.json({ persons: persons || [] })
  } catch (error) {
    console.error('Person search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}