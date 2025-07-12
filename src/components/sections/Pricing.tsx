'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Check, Star } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
      name: "Simple use",
      price: "$9",
      period: "/month",
      description: "Perfect for cherishing one special relationship",
      features: [
        "1 voice persona",
        "Unlimited conversations",
        "Basic voice quality",
        "Email support"
      ],
      popular: false,
      cta: "Start Simple"
    },
    {
      name: "Connect+",
      price: "$19",
      period: "/month",
      description: "Ideal for maintaining multiple meaningful connections",
      features: [
        "3 voice personas",
        "Unlimited conversations",
        "High-quality voices",
        "Priority support",
        "Advanced personality training",
        "Conversation history"
      ],
      popular: true,
      cta: "Get Connect+"
    },
    {
      name: "Complete",
      price: "$39",
      period: "/month",
      description: "For those who want to preserve their entire family legacy",
      features: [
        "Unlimited voice personas",
        "Unlimited conversations",
        "Premium voice quality",
        "24/7 priority support",
        "Advanced AI personality",
        "Family sharing features",
        "Voice backup & export",
        "Custom integrations"
      ],
      popular: false,
      cta: "Go Complete"
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Access the voice you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to preserve and connect with the voices that matter most to you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative group hover:shadow-2xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary shadow-xl scale-105 bg-gradient-to-b from-card/95 to-primary/5 backdrop-blur-sm' 
                  : 'hover:-translate-y-1 bg-card/95 backdrop-blur-sm'
              }`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl font-semibold mb-2 text-card-foreground">
                  {plan.name}
                </CardTitle>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-card-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-card-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild
                  className={`w-full py-3 text-lg font-medium relative overflow-hidden group ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20'
                  }`}
                >
                  <Link href="/sign-up">
                    <span className="relative z-10">{plan.cta}</span>
                    {plan.popular && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    )}
                  </Link>
                </Button>
              </CardContent>

              {/* Spotlight effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            All plans include a 7-day free trial. Cancel anytime. No long-term commitments.
          </p>
        </div>
      </div>
    </section>
  )
}