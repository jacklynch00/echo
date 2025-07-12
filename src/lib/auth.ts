'use server';

import { redirect } from 'next/navigation';
import { createServerActionClient } from './supabase-server';

function getRedirectUrl(): string {
	// For Vercel deployments, use the proper URL construction
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}

	// For production, use the production URL if available
	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}

	// Fallback to the site URL or localhost
	return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';
}

export async function signInWithGoogle() {
	const supabase = await createServerActionClient();

	const origin = getRedirectUrl();

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

	const origin = getRedirectUrl();

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
