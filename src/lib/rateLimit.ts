import { createServerActionClient } from './supabase-server'

export async function canSendMessage(userId: string): Promise<boolean> {
  const supabase = await createServerActionClient()
  
  // Count user messages sent today using join
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count, error } = await supabase
    .from('messages')
    .select(`
      *,
      conversation:conversations!inner(
        person:persons!inner(user_id)
      )
    `, { count: 'exact', head: true })
    .eq('role', 'user')
    .eq('conversation.person.user_id', userId)
    .gte('created_at', today.toISOString())

  if (error) {
    console.error('Error checking message count:', error)
    return false
  }

  const messageLimit = parseInt(process.env.FREE_MESSAGE_CAP || '10')
  return (count || 0) < messageLimit
}

export async function getRemainingMessages(userId: string): Promise<number> {
  const supabase = await createServerActionClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { count, error } = await supabase
    .from('messages')
    .select(`
      *,
      conversation:conversations!inner(
        person:persons!inner(user_id)
      )
    `, { count: 'exact', head: true })
    .eq('role', 'user')
    .eq('conversation.person.user_id', userId)
    .gte('created_at', today.toISOString())

  if (error) {
    console.error('Error checking message count:', error)
    return 0
  }

  const messageLimit = parseInt(process.env.FREE_MESSAGE_CAP || '10')
  return Math.max(0, messageLimit - (count || 0))
}