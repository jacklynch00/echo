// flowglad.ts
import { FlowgladServer } from '@flowglad/nextjs/server';
import { createServerComponentClient } from '@/lib/supabase-server';

export const flowgladServer = new FlowgladServer({
	supabaseAuth: {
		client: createServerComponentClient,
	},
});
