'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { MessageCircle, Heart, Users } from 'lucide-react';
import { signInWithGoogle, sendMagicLink } from '@/src/lib/auth-client';

export default function Home() {
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		try {
			setIsLoading(true);
			await signInWithGoogle();
		} catch (error) {
			console.error('Sign in error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMagicLink = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;

		try {
			setIsLoading(true);
			await sendMagicLink(email);
			alert('Magic link sent! Check your email.');
		} catch (error) {
			console.error('Magic link error:', error);
			alert('Failed to send magic link');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
			{/* Header */}
			<header className='container mx-auto px-6 py-8'>
				<nav className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<MessageCircle className='h-8 w-8 text-blue-600' />
						<span className='text-2xl font-bold text-gray-900'>Voice Notes</span>
					</div>
				</nav>
			</header>

			{/* Hero Section */}
			<main className='container mx-auto px-6 py-12'>
				<div className='grid lg:grid-cols-2 gap-12 items-center'>
					<div>
						<h1 className='text-5xl font-bold text-gray-900 leading-tight mb-6'>
							Keep Their Voice
							<span className='text-blue-600'> Forever</span>
						</h1>
						<p className='text-xl text-gray-600 mb-8 leading-relaxed'>
							Create AI-powered conversations with loved ones who have passed away. Upload voice samples to preserve their memory and continue meaningful
							conversations that bring comfort and connection.
						</p>

						{/* Sign In Options */}
						<Card className='w-full max-w-md'>
							<CardHeader>
								<CardTitle>Get Started</CardTitle>
								<CardDescription>Sign in to create your first voice memory</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<Button onClick={handleGoogleSignIn} disabled={isLoading} className='w-full' size='lg'>
									Continue with Google
								</Button>

								<div className='relative'>
									<div className='absolute inset-0 flex items-center'>
										<span className='w-full border-t' />
									</div>
									<div className='relative flex justify-center text-xs uppercase'>
										<span className='bg-white px-2 text-muted-foreground'>Or</span>
									</div>
								</div>

								<form onSubmit={handleMagicLink} className='space-y-3'>
									<Input type='email' placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)} required />
									<Button type='submit' disabled={isLoading || !email} variant='outline' className='w-full'>
										Send Magic Link
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>

					{/* Features Grid */}
					<div className='grid gap-6'>
						<Card className='p-6'>
							<div className='flex items-start gap-4'>
								<div className='bg-blue-100 p-3 rounded-lg'>
									<Heart className='h-6 w-6 text-blue-600' />
								</div>
								<div>
									<h3 className='font-semibold text-lg mb-2'>Voice Cloning</h3>
									<p className='text-gray-600'>Advanced AI technology preserves the unique voice patterns and speaking style of your loved ones.</p>
								</div>
							</div>
						</Card>

						<Card className='p-6'>
							<div className='flex items-start gap-4'>
								<div className='bg-green-100 p-3 rounded-lg'>
									<MessageCircle className='h-6 w-6 text-green-600' />
								</div>
								<div>
									<h3 className='font-semibold text-lg mb-2'>Natural Conversations</h3>
									<p className='text-gray-600'>Have meaningful dialogues that reflect their personality, memories, and the unique relationship you shared.</p>
								</div>
							</div>
						</Card>

						<Card className='p-6'>
							<div className='flex items-start gap-4'>
								<div className='bg-purple-100 p-3 rounded-lg'>
									<Users className='h-6 w-6 text-purple-600' />
								</div>
								<div>
									<h3 className='font-semibold text-lg mb-2'>Multiple Relationships</h3>
									<p className='text-gray-600'>Create voice memories for grandparents, parents, siblings, friends, and other important people in your life.</p>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
