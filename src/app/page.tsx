'use client'

import { Suspense } from 'react'
import Navigation from '@/src/components/sections/Navigation'
import Hero from '@/src/components/sections/Hero'
import HowItWorks from '@/src/components/sections/HowItWorks'
import EchoStories from '@/src/components/sections/EchoStories'
import Testimonials from '@/src/components/sections/Testimonials'
import Pricing from '@/src/components/sections/Pricing'
import Features from '@/src/components/sections/Features'
import FAQ from '@/src/components/sections/FAQ'
import Footer from '@/src/components/sections/Footer'
import Threads from '@/src/components/bits/Threads/Threads'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Threads Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <Threads 
            color={[0.34, 0.22, 0.85]} // Purple color matching our primary theme
            amplitude={0.8}
            distance={0.3}
            enableMouseInteraction={true}
          />
        </Suspense>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Navigation />
        <Hero />
        <HowItWorks />
        <EchoStories />
        <Testimonials />
        <Pricing />
        <Features />
        <FAQ />
        <Footer />
      </div>
    </div>
  )
}
