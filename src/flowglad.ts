// flowglad.ts
import { FlowgladServer } from '@flowglad/nextjs/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export const flowgladServer = new FlowgladServer({
  secretKey: process.env.FLOWGLAD_SECRET_KEY!,
  supabaseAuth: {
    client: createServerComponentClient,
  },
})