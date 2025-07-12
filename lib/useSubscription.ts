'use client'

import { useBilling } from '@flowglad/nextjs'

export interface UseSubscriptionReturn {
  // Billing data
  customer: any
  subscriptions: any[]
  loading: boolean
  error: any
  
  // Computed subscription status
  hasActiveSubscription: boolean
  subscriptionTier: 'free' | 'pro' | 'premium'
  
  // Feature limits
  limits: {
    totalMessages: number
    totalConversations: number
    totalPersonas: number
    voiceCloning: boolean
    prioritySupport: boolean
  }
  
  // Helper functions
  canUpgrade: boolean
  isUnlimited: boolean
}

export function useSubscription(): UseSubscriptionReturn {
  const { customer, subscriptions, loading, error } = useBilling()
  
  // Check if user has any active subscriptions
  const hasActiveSubscription = subscriptions?.some((sub: any) => 
    ['Active', 'Trialing', 'PastDue', 'CancellationScheduled', 'Unpaid'].includes(sub.status)
  ) || false
  
  // Determine subscription tier based on plan
  let subscriptionTier: 'free' | 'pro' | 'premium' = 'free'
  if (hasActiveSubscription && subscriptions && subscriptions.length > 0) {
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
  
  // Get feature limits based on tier
  const limits = getFeatureLimits(subscriptionTier)
  
  return {
    customer,
    subscriptions: subscriptions || [],
    loading,
    error,
    hasActiveSubscription,
    subscriptionTier,
    limits,
    canUpgrade: !hasActiveSubscription || subscriptionTier !== 'premium',
    isUnlimited: hasActiveSubscription
  }
}

function getFeatureLimits(subscriptionTier: 'free' | 'pro' | 'premium') {
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

// Additional helper hook for usage tracking
export function useUsageTracking() {
  // This would need to be implemented with API calls to get current usage
  // For now, returning placeholder data
  return {
    currentMessages: 0,
    currentConversations: 0,
    currentPersonas: 0,
    loading: false,
    error: null
  }
}