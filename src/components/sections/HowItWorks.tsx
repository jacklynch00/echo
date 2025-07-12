'use client'

import { Card, CardContent } from '@/src/components/ui/card'
import { Upload, User, MessageCircle } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload a recording",
      description: "Share a voice sample of your loved one. Just a few minutes of clear audio is enough to create their digital voice."
    },
    {
      icon: User,
      title: "Tell us about them",
      description: "Provide details about their personality, relationship to you, and special memories to make conversations more authentic."
    },
    {
      icon: MessageCircle,
      title: "See, hello & hear their response",
      description: "Start meaningful conversations and hear their voice respond with comfort, wisdom, and love."
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-background relative">
      {/* Dot Grid Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--muted)) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create meaningful connections with{" "}
            <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text font-medium">
              advanced AI technology
            </span>{" "}
            in just three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/95 backdrop-blur-sm border-border"
            >
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Connection Lines */}
        <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
          <div className="flex justify-between items-center px-32">
            <div className="w-24 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
            <div className="w-24 h-0.5 bg-gradient-to-r from-primary/20 to-primary/50" />
          </div>
        </div>
      </div>
    </section>
  )
}