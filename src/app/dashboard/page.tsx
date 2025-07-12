import { createServerComponentClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import PersonList from '@/components/PersonList'
import EmptyState from '@/components/EmptyState'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createServerComponentClient()
  const { data: persons } = await supabase
    .from('persons')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!persons || persons.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Voice Memories</h1>
      <PersonList persons={persons} />
    </div>
  )
}