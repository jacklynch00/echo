import { flowgladServer } from '@/src/flowglad'
import { getUser } from './auth'
import { createServerActionClient } from './supabase-server'

export interface SubscriptionStatus {
	hasActiveSubscription: boolean
	subscriptionTier: 'free' | 'pro' | 'premium'
	subscriptions: any[]
	customer: any
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
	try {
		const user = await getUser()
		if (!user) {
			return {
				hasActiveSubscription: false,
				subscriptionTier: 'free',
				subscriptions: [],
				customer: null
			}
		}

		// Get customer and subscription data from Flowglad
		const { customer, subscriptions } = await flowgladServer.getBilling({
			userId: user.id
		})

		// Check if user has any active subscriptions
		const hasActiveSubscription = subscriptions?.some((sub: any) =>
			['Active', 'Trialing', 'PastDue', 'CancellationScheduled', 'Unpaid'].includes(sub.status)
		)

		// Determine subscription tier based on plan
		let subscriptionTier: 'free' | 'pro' | 'premium' = 'free'
		if (hasActiveSubscription && subscriptions.length > 0) {
			const activeSub = subscriptions.find((sub: any) =>
				['Active', 'Trialing'].includes(sub.status)
			)
			if (activeSub) {
				// Adjust these plan names to match your Flowglad setup
				if (activeSub.plan?.name?.toLowerCase().includes('premium')) {
					subscriptionTier = 'premium'
				} else if (activeSub.plan?.name?.toLowerCase().includes('pro')) {
					subscriptionTier = 'pro'
				}
			}
		}

		return {
			hasActiveSubscription,
			subscriptionTier,
			subscriptions: subscriptions || [],
			customer
		}
	} catch (error) {
		console.error('Error checking subscription status:', error)
		return {
			hasActiveSubscription: false,
			subscriptionTier: 'free',
			subscriptions: [],
			customer: null
		}
	}
}

export async function canSendMessage(userId: string): Promise<boolean> {
	const { hasActiveSubscription } = await getSubscriptionStatus()

	if (hasActiveSubscription) {
		return true // Unlimited messages for paid users
	}

	// Check if free user has reached total message limit
	const supabase = await createServerActionClient()

	// Count all messages sent by user across all conversations using joins
	const { count, error } = await supabase
		.from('messages')
		.select('*', { count: 'exact', head: true })
		.eq('sender', 'user')
		.in('conversation_id',
			supabase
				.from('conversations')
				.select('id')
				.in('person_id',
					supabase
						.from('persons')
						.select('id')
						.eq('user_id', userId)
				)
		)

	if (error) {
		console.error('Error checking message count:', error)
		return false
	}

	const messageLimit = 5 // Free tier: 5 messages total
	return (count || 0) < messageLimit
}

export async function canCreateConversation(userId: string): Promise<boolean> {
	const { hasActiveSubscription } = await getSubscriptionStatus()

	if (hasActiveSubscription) {
		return true // Unlimited conversations for paid users
	}

	// Check if free user has reached total conversation limit
	const supabase = await createServerActionClient()

	const { count, error } = await supabase
		.from('conversations')
		.select('*', { count: 'exact', head: true })
		.in('person_id',
			supabase
				.from('persons')
				.select('id')
				.eq('user_id', userId)
		)

	if (error) {
		console.error('Error checking conversation count:', error)
		return false
	}

	const conversationLimit = 1 // Free tier: 1 conversation total
	return (count || 0) < conversationLimit
}

export async function canCreatePersona(userId: string): Promise<boolean> {
	const { hasActiveSubscription } = await getSubscriptionStatus()

	if (hasActiveSubscription) {
		return true // Unlimited personas for paid users
	}

	// Check if free user has reached persona limit
	const supabase = await createServerActionClient()

	const { count, error } = await supabase
		.from('persons')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)

	if (error) {
		console.error('Error checking persona count:', error)
		return false
	}

	const personaLimit = 1 // Free tier: 1 persona maximum
	return (count || 0) < personaLimit
}

export async function getRemainingMessages(userId: string): Promise<number> {
	const { hasActiveSubscription } = await getSubscriptionStatus()

	if (hasActiveSubscription) {
		return Infinity // Unlimited for paid users
	}

	const supabase = await createServerActionClient()

	// Count all user messages across all conversations
	const { count, error } = await supabase
		.from('messages')
		.select('*', { count: 'exact', head: true })
		.eq('sender', 'user')
		.in('conversation_id',
			supabase
				.from('conversations')
				.select('id')
				.in('person_id',
					supabase
						.from('persons')
						.select('id')
						.eq('user_id', userId)
				)
		)

	if (error) {
		console.error('Error checking message count:', error)
		return 0
	}

	const messageLimit = 5
	return Math.max(0, messageLimit - (count || 0))
}

export async function getRemainingConversations(userId: string): Promise<number> {
	const { hasActiveSubscription } = await getSubscriptionStatus()

	if (hasActiveSubscription) {
		return Infinity // Unlimited for paid users
	}

	const supabase = await createServerActionClient()

	const { count, error } = await supabase
		.from('conversations')
		.select('*', { count: 'exact', head: true })
		.in('person_id',
			supabase
				.from('persons')
				.select('id')
				.eq('user_id', userId)
		)

	if (error) {
		console.error('Error checking conversation count:', error)
		return 0
	}

	const conversationLimit = 1
	return Math.max(0, conversationLimit - (count || 0))
}

export async function getRemainingPersonas(userId: string): Promise<number> {
	const { hasActiveSubscription } = await getSubscriptionStatus()

	if (hasActiveSubscription) {
		return Infinity // Unlimited for paid users
	}

	const supabase = await createServerActionClient()

	const { count, error } = await supabase
		.from('persons')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)

	if (error) {
		console.error('Error checking persona count:', error)
		return 0
	}

	const personaLimit = 1
	return Math.max(0, personaLimit - (count || 0))
}

export function getFeatureLimits(subscriptionTier: 'free' | 'pro' | 'premium') {
	switch (subscriptionTier) {
		case 'premium':
			return {
				totalMessages: Infinity,
				totalConversations: Infinity,
				totalPersonas: Infinity,
				voiceCloning: true,
				prioritySupport: true
			}
		case 'pro':
			return {
				totalMessages: Infinity,
				totalConversations: Infinity,
				totalPersonas: Infinity,
				voiceCloning: true,
				prioritySupport: false
			}
		case 'free':
		default:
			return {
				totalMessages: 5,
				totalConversations: 1,
				totalPersonas: 1,
				voiceCloning: true, // Allowed for their 1 persona
				prioritySupport: false
			}
	}
}
