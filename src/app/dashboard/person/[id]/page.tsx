import { createServerComponentClient } from '@/src/lib/supabase-server'
import { getUser } from '@/src/lib/auth'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUser()
  
  if (!user) {
    notFound()
  }

  const supabase = await createServerComponentClient()
  
  // Get person details
  const { data: person, error: personError } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (personError || !person) {
    notFound()
  }

  // Get the most recent conversation or create one if none exists
  let { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('person_id', person.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!conversation) {
    // Create a default conversation
    const { data: newConversation } = await supabase
      .from('conversations')
      .insert({
        person_id: person.id,
        title: `Chat with ${person.name}`,
      })
      .select()
      .single()
    
    conversation = newConversation
  }

  // Redirect to the conversation page
  redirect(`/dashboard/person/${id}/conversation/${conversation.id}`)
}