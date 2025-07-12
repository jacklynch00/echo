'use client'

import Link from 'next/link'
import { Button } from '@/src/components/ui/button'
import { Play, MessageCircle } from 'lucide-react'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="pt-24 pb-16 relative overflow-hidden">
      {/* Aurora Background Effect - Reduced opacity to work with Threads */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background/80 to-accent/3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="inline-block">Exchange voice notes</span>
                <br />
                <span className="inline-block">with people who have</span>
                <br />
                <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                  time
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Connect with AI personas of your loved ones who have passed away. 
                Experience meaningful conversations that bring comfort and preserve their memory.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg relative overflow-hidden group"
              >
                <Link href="/sign-up">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-lg group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://picsum.photos/600/400"
                alt="People embracing - representing connection and memory"
                width={600}
                height={400}
                className="w-full h-auto"
              />
              
              {/* Overlaid Chat Bubble */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground mb-1">Dad</p>
                      <p className="text-sm text-muted-foreground">
                        &ldquo;I&apos;m so proud of everything you&apos;ve accomplished. Remember, I&apos;m always with you in spirit.&rdquo;
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
                          <Play className="w-3 h-3 text-primary" />
                        </div>
                        <div className="flex-1 h-1 bg-primary/20 rounded-full">
                          <div className="h-full w-1/3 bg-primary rounded-full" />
                        </div>
                        <span className="text-xs text-muted-foreground">0:15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}