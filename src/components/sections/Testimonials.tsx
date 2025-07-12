'use client'

import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Play, Quote } from 'lucide-react'
import Image from 'next/image'

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      relationship: "Daughter",
      avatar: "https://picsum.photos/64/64?random=10",
      quote: "Hearing my mother's voice again brought such comfort during the grieving process. It feels like she's still here with me.",
      voicePreview: "Mom's voice message",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      relationship: "Son",
      avatar: "https://picsum.photos/64/64?random=11",
      quote: "The AI captured my father's personality perfectly. Our conversations help me feel connected to his wisdom and love.",
      voicePreview: "Dad's voice message",
      rating: 5
    },
    {
      id: 3,
      name: "Emma Williams",
      relationship: "Granddaughter",
      avatar: "https://picsum.photos/64/64?random=12",
      quote: "My grandmother's stories live on through Echo. It's like having bedtime stories with grandma again.",
      voicePreview: "Grandma's voice message",
      rating: 5
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-primary/3 via-background/80 to-primary/5 relative overflow-hidden">
      {/* Beams Background Effect */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Stories of Connection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how Echo has helped families preserve memories and find comfort
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id}
              className={`relative group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-border ${
                index === 1 ? 'md:scale-105' : ''
              }`}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/60 mb-4" />
                
                {/* Testimonial Text */}
                <p className="text-card-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Voice Preview */}
                <div className="bg-primary/10 rounded-lg p-3 mb-6 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0 flex-shrink-0"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    
                    <div className="flex-1">
                      <div className="h-1.5 bg-primary/20 rounded-full">
                        <div className="h-full w-1/3 bg-primary rounded-full" />
                      </div>
                    </div>
                    
                    <span className="text-xs text-muted-foreground">0:45</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {testimonial.voicePreview}
                  </p>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-card-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.relationship}</p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <div key={i} className="w-4 h-4 text-yellow-400">
                      ⭐
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Floating Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500 -z-10" />
            </Card>
          ))}
        </div>

        {/* Horizontal Scroll Indicator */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-primary/30 hover:bg-primary/60 transition-colors cursor-pointer"
            />
          ))}
        </div>
      </div>
    </section>
  )
}