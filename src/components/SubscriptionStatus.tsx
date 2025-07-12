'use client'

import { useSubscription } from '@/lib/useSubscription'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Crown, MessageSquare, Users, Zap } from 'lucide-react'

interface SubscriptionStatusProps {
  currentMessages?: number
  currentConversations?: number
  currentPersonas?: number
  showUpgradeButton?: boolean
}

export default function SubscriptionStatus({
  currentMessages = 0,
  currentConversations = 0,
  currentPersonas = 0,
  showUpgradeButton = true
}: SubscriptionStatusProps) {
  const { 
    subscriptionTier, 
    hasActiveSubscription, 
    limits, 
    loading,
    canUpgrade 
  } = useSubscription()

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    )
  }

  const tierColors = {
    free: 'text-gray-600',
    pro: 'text-blue-600',
    premium: 'text-purple-600'
  }

  const tierIcons = {
    free: MessageSquare,
    pro: Users,
    premium: Crown
  }

  const TierIcon = tierIcons[subscriptionTier]

  return (
    <Card className="p-4 space-y-3">
      {/* Subscription Tier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TierIcon className={`h-4 w-4 ${tierColors[subscriptionTier]}`} />
          <span className={`font-medium capitalize ${tierColors[subscriptionTier]}`}>
            {subscriptionTier} Plan
          </span>
        </div>
        {hasActiveSubscription && (
          <div className="flex items-center gap-1 text-green-600">
            <Zap className="h-3 w-3" />
            <span className="text-xs">Active</span>
          </div>
        )}
      </div>

      {/* Usage Stats for Free Users */}
      {!hasActiveSubscription && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Messages used:</span>
            <span className={currentMessages >= limits.totalMessages ? 'text-red-600 font-medium' : 'text-gray-600'}>
              {currentMessages}/{limits.totalMessages}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Conversations:</span>
            <span className={currentConversations >= limits.totalConversations ? 'text-red-600 font-medium' : 'text-gray-600'}>
              {currentConversations}/{limits.totalConversations}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Personas:</span>
            <span className={currentPersonas >= limits.totalPersonas ? 'text-red-600 font-medium' : 'text-gray-600'}>
              {currentPersonas}/{limits.totalPersonas}
            </span>
          </div>
        </div>
      )}

      {/* Upgrade Prompt */}
      {canUpgrade && showUpgradeButton && (
        <div className="pt-2 border-t">
          {!hasActiveSubscription ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600">
                Upgrade for unlimited messages, conversations, and personas
              </p>
              <Button 
                className="w-full" 
                size="sm"
                onClick={() => window.location.href = '/billing'}
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade to Pro
              </Button>
            </div>
          ) : subscriptionTier !== 'premium' ? (
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => window.location.href = '/billing'}
            >
              Upgrade to Premium
            </Button>
          ) : null}
        </div>
      )}

      {/* Premium Features */}
      {hasActiveSubscription && (
        <div className="text-xs text-green-600">
          ✓ Unlimited everything • Priority support
        </div>
      )}
    </Card>
  )
}