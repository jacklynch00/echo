'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import Message from './Message';

interface ChatWindowProps {
	person: {
		id: string;
		name: string;
		relationship: string;
		voice_id: string;
	};
	conversation: {
		id: string;
		title: string;
	};
	initialMessages: Array<{
		id: string;
		role: 'user' | 'assistant';
		content: string;
		audio_url?: string;
		created_at: string;
	}>;
}

export default function ChatWindow({ person, conversation, initialMessages }: ChatWindowProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
		api: '/api/chat',
		id: conversation.id,
		initialMessages: initialMessages.map((msg) => ({
			id: msg.id,
			role: msg.role,
			content: msg.content,
		})),
		sendExtraMessageFields: true,
		onFinish: () => {
			// Don't reload - let the streaming work naturally
			console.log('Chat finished');
		},
	});

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<div className='flex flex-col h-full'>
			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-6 space-y-4'>
				{initialMessages.map((message) => (
					<Message 
						key={message.id} 
						message={message} 
						personName={person.name} 
						conversationId={conversation.id}
						isNewMessage={false}
					/>
				))}

				{/* Show streaming messages */}
				{messages
					.slice(initialMessages.length)
					.filter((message) => message.role === 'user' || message.role === 'assistant')
					.map((message) => (
						<Message
							key={message.id}
							message={message as { id: string; role: 'user' | 'assistant'; content: string }}
							personName={person.name}
							conversationId={conversation.id}
							isNewMessage={true}
						/>
					))}

				{isLoading && (
					<div className='flex items-center gap-2 text-gray-500'>
						<Loader2 className='h-4 w-4 animate-spin' />
						<span>{person.name} is thinking...</span>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className='border-t border-gray-200 p-6'>
				<form onSubmit={handleSubmit} className='flex gap-2'>
					<Input value={input} onChange={handleInputChange} placeholder={`Type a message to ${person.name}...`} disabled={isLoading} className='flex-1' />
					<Button type='submit' disabled={isLoading || !input.trim()}>
						<Send className='h-4 w-4' />
					</Button>
				</form>
			</div>
		</div>
	);
}
