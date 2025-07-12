'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { ChevronLeft, ChevronRight, Play, MessageCircle } from 'lucide-react'
import Image from 'next/image'

export default function EchoStories() {
  const [currentStory] = useState(0)

  const stories = [
    {
      id: 'dad',
      name: 'Dad',
      relationship: 'Father',
      image: 'https://picsum.photos/400/300?random=1',
      preview: "Hey kiddo, I wanted to tell you how proud I am of the person you've become...",
      lastMessage: "2 hours ago"
    }
  ]

  const currentStoryData = stories[currentStory]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Echo Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real conversations that bring comfort and connection
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden bg-card/95 backdrop-blur-sm border-border shadow-xl">
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Image */}
              <div className="relative">
                <Image
                  src={currentStoryData.image}
                  alt={`Photo of ${currentStoryData.name}`}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover min-h-[300px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Story Info Overlay */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">{currentStoryData.name}</h3>
                  <p className="text-white/80">{currentStoryData.relationship}</p>
                </div>
              </div>

              {/* Right Side - Chat Interface */}
              <CardContent className="p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-semibold text-card-foreground">Recent Conversation</h4>
                    <span className="text-sm text-muted-foreground">{currentStoryData.lastMessage}</span>
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-card-foreground leading-relaxed">
                          {currentStoryData.preview}
                        </p>
                        
                        {/* Audio Player */}
                        <div className="flex items-center gap-3 mt-4">
                          <Button 
                            size="sm" 
                            className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          
                          <div className="flex-1">
                            <div className="h-2 bg-primary/20 rounded-full">
                              <div className="h-full w-1/4 bg-primary rounded-full" />
                            </div>
                          </div>
                          
                          <span className="text-sm text-muted-foreground">1:23</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 max-w-xs">
                      <p className="text-sm">I miss you dad. How was your day?</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    {stories.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStory ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}