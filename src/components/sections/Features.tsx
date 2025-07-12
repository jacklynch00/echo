'use client'

import { Card, CardContent } from '@/src/components/ui/card'
import { 
  Mic, 
  MessageCircle, 
  Heart, 
  Shield, 
  Clock, 
  Users,
  Download,
  Smartphone
} from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: Mic,
      title: "Authentic sounding voices",
      description: "Advanced AI voice cloning technology captures the unique speech patterns and emotional nuances of your loved ones."
    },
    {
      icon: MessageCircle,
      title: "Human-like responses", 
      description: "Conversations feel natural and meaningful, reflecting their personality, memories, and the special bond you shared."
    },
    {
      icon: Heart,
      title: "Emotional intelligence",
      description: "Our AI understands context and responds with appropriate empathy, comfort, and the wisdom they would have shared."
    },
    {
      icon: Shield,
      title: "Privacy & security",
      description: "Your voice data and conversations are encrypted and securely stored. Your memories remain private and protected."
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description: "Connect with your loved ones whenever you need comfort, guidance, or simply want to share a moment together."
    },
    {
      icon: Users,
      title: "Family sharing",
      description: "Share voice personas with family members so everyone can maintain their special connection and shared memories."
    },
    {
      icon: Download,
      title: "Voice backup",
      description: "Download and backup your voice models to ensure your precious memories are preserved for generations to come."
    },
    {
      icon: Smartphone,
      title: "Cross-platform access",
      description: "Access your conversations from any device - web, mobile, or tablet. Your connections are always within reach."
    }
  ]

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What you get with{" "}
            <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
              each plan
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to create the most authentic and meaningful conversations possible
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/95 backdrop-blur-sm border-border"
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 text-card-foreground">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>

              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Heart className="w-4 h-4" />
            Trusted by thousands of families worldwide
          </div>
        </div>
      </div>
    </section>
  )
}