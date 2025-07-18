'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { User, Play, Pause, Volume2 } from 'lucide-react';

interface MessageProps {
	message: {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		audio_url?: string;
	};
	personName: string;
	conversationId: string;
	isNewMessage?: boolean;
}

export default function Message({ message, personName, isNewMessage = false }: MessageProps) {
	const isUser = message.role === 'user';
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	// Fetch audio URL for assistant messages
	useEffect(() => {
		if (!isUser && message.id) {
			// If this is an existing message with audio URL already provided, use it directly
			if (message.audio_url) {
				setAudioUrl(message.audio_url);
				return;
			}

			// Only fetch audio for new messages or messages without audio URLs
			if (isNewMessage) {
				let retryCount = 0;
				const maxRetries = 5;

				async function fetchAudioUrl() {
					try {
						setIsLoading(true);

						// Initial wait time increases with retry count
						const waitTime = Math.min(3000 + retryCount * 2000, 10000);
						await new Promise((resolve) => setTimeout(resolve, waitTime));

						// Fetch the message with audio URL from the database
						const response = await fetch(`/api/message/${message.id}`);

						if (response.ok) {
							const data = await response.json();

							if (data.audio_url) {
								setAudioUrl(data.audio_url);

								// Only auto-play for new messages to avoid browser autoplay restrictions
								if (isNewMessage) {
									setTimeout(() => {
										if (audioRef.current) {
											audioRef.current.play().catch((error) => {
												console.error('Auto-play failed:', error);
											});
										}
									}, 100);
								}
							} else {
								// Retry if no audio URL yet and haven't exceeded max retries
								if (retryCount < maxRetries) {
									retryCount++;
									setTimeout(fetchAudioUrl, 2000);
									return; // Don't set loading to false yet
								}
							}
						} else {
							// Retry if message not found and haven't exceeded max retries
							if (retryCount < maxRetries) {
								retryCount++;
								setTimeout(fetchAudioUrl, 2000);
								return; // Don't set loading to false yet
							}
						}
					} catch (error) {
						console.error('Error fetching audio:', error);
						// Retry on error if haven't exceeded max retries
						if (retryCount < maxRetries) {
							retryCount++;
							setTimeout(fetchAudioUrl, 2000);
							return; // Don't set loading to false yet
						}
					} finally {
						// Only set loading to false if we're not retrying
						if (retryCount >= maxRetries || audioUrl) {
							setIsLoading(false);
						}
					}
				}
				fetchAudioUrl();
			}
		}
	}, [message.id, isUser, isNewMessage, message.audio_url, audioUrl]);

	const handlePlayPause = () => {
		if (!audioRef.current || !audioUrl) return;

		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
	};

	const handleAudioEnded = () => {
		setIsPlaying(false);
	};

	const handleAudioPlay = () => {
		setIsPlaying(true);
	};

	const handleAudioPause = () => {
		setIsPlaying(false);
	};

	return (
		<div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
			<Avatar className='flex-shrink-0'>
				<AvatarFallback>
					{isUser ? (
						<User className='h-4 w-4' />
					) : (
						personName
							.split(' ')
							.map((n) => n[0])
							.join('')
					)}
				</AvatarFallback>
			</Avatar>

			<Card className={`max-w-md ${isUser ? 'bg-blue-500 text-white' : 'bg-white'}`}>
				<CardContent className='p-3'>
					<p className='text-sm'>{message.content}</p>

					{!isUser && (
						<div className='mt-2 flex items-center gap-2'>
							{isLoading && (
								<div className='flex items-center gap-2 text-xs text-gray-500'>
									<Volume2 className='h-3 w-3' />
									<span>Generating audio...</span>
								</div>
							)}

							{audioUrl && (
								<>
									<Button variant='ghost' size='sm' onClick={handlePlayPause} className='p-1 h-6 w-6'>
										{isPlaying ? <Pause className='h-3 w-3' /> : <Play className='h-3 w-3' />}
									</Button>

									<audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} onPlay={handleAudioPlay} onPause={handleAudioPause} preload='metadata' />

									<span className='text-xs text-gray-500'>Voice message</span>
								</>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
