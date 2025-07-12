'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoicePlayerProps {
	messageId: string;
}

export default function VoicePlayer({ messageId }: VoicePlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		async function fetchAudioUrl() {
			try {
				setIsLoading(true);
				const response = await fetch(`/api/message/${messageId}`);
				if (response.ok) {
					const data = await response.json();
					if (data.audio_url) {
						setAudioUrl(data.audio_url);
						setIsLoading(false);
					}
				}
			} catch (error) {
				console.error('Error fetching audio:', error);
				setIsLoading(false);
			}
		}
		fetchAudioUrl();
	}, [messageId]);

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

	if (isLoading) {
		return (
			<div className='flex items-center gap-2 text-xs text-gray-500'>
				<Volume2 className='h-3 w-3' />
				<span>Generating audio...</span>
			</div>
		);
	}

	if (!audioUrl) {
		return null;
	}

	return (
		<div className='flex items-center gap-2'>
			<Button variant='ghost' size='sm' onClick={handlePlayPause} className='p-1 h-6 w-6'>
				{isPlaying ? <Pause className='h-3 w-3' /> : <Play className='h-3 w-3' />}
			</Button>

			<audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} onPlay={handleAudioPlay} onPause={handleAudioPause} preload='metadata' />

			<span className='text-xs text-gray-500'>Voice message</span>
		</div>
	);
}
