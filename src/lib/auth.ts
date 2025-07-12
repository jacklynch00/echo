'use server';

import { redirect } from 'next/navigation';
import { createServerActionClient } from './supabase-server';

export async function signInWithGoogle() {
	const supabase = await createServerActionClient();

	// Get the current origin from headers or fallback to env variable
	const origin = process.env.VERCEL_URL 
		? `https://${process.env.VERCEL_URL}` 
		: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${origin}/api/auth/callback`,
		},
	});

	if (error) {
		throw new Error(error.message);
	}

	if (data.url) {
		redirect(data.url);
	}
}

export async function sendMagicLink(email: string) {
	const supabase = await createServerActionClient();

	// Get the current origin from headers or fallback to env variable
	const origin = process.env.VERCEL_URL 
		? `https://${process.env.VERCEL_URL}` 
		: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

	const { error } = await supabase.auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: `${origin}/api/auth/callback`,
		},
	});

	if (error) {
		throw new Error(error.message);
	}
}

export async function signOut() {
	const supabase = await createServerActionClient();
	await supabase.auth.signOut();
	redirect('/');
}

export async function getUser() {
	const supabase = await createServerActionClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
}
