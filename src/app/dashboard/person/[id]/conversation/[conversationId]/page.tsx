import { createServerComponentClient } from '@/src/lib/supabase-server'
import { getUser } from '@/src/lib/auth'
import { notFound } from 'next/navigation'
import ChatWindow from '../../components/ChatWindow'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from '@/components/ui/breadcrumb'

interface PageProps {
  params: Promise<{ id: string; conversationId: string }>
}

export default async function ConversationPage({ params }: PageProps) {
  const { id, conversationId } = await params
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

  // Get conversation details
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('person_id', person.id)
    .single()

  if (conversationError || !conversation) {
    notFound()
  }

  // Get existing messages in AI SDK format
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true })

  // Transform messages to AI SDK format
  const formattedMessages = messages?.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    audio_url: msg.audio_url,
    created_at: msg.created_at,
  })) || []

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/person/${person.id}`}>{person.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>{conversation.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-background border overflow-hidden">
          <ChatWindow
            person={person}
            conversation={conversation}
            initialMessages={formattedMessages}
          />
        </div>
      </div>
    </>
  )
}