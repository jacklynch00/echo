'use client'

import { createClientComponentClient } from './supabase'

export async function signInWithGoogle() {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function sendMagicLink(email: string) {
  const supabase = createClientComponentClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }
}