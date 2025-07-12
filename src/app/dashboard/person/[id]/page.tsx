import { createServerComponentClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import ChatWindow from './components/ChatWindow'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PersonChatPage({ params }: PageProps) {
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

  // Get or create conversation
  let { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('person_id', person.id)
    .single()

  if (!conversation) {
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

  // Get existing messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold">
          Chat with {person.name}
        </h1>
        <p className="text-sm text-gray-500 capitalize">
          {person.relationship}
        </p>
      </div>
      
      <ChatWindow
        person={person}
        conversation={conversation}
        initialMessages={messages || []}
      />
    </div>
  )
}