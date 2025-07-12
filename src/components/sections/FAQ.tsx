'use client'

import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'

export default function FAQ() {
  const faqs = [
    {
      question: "How much voice data do you need to create a persona?",
      answer: "We typically need 5-10 minutes of clear, high-quality audio where the person is speaking naturally. This can be from old recordings, voicemails, videos, or any audio where they're talking. The more variety in emotions and speaking styles, the better the result."
    },
    {
      question: "How long can I talk with the AI persona?",
      answer: "There are no time limits on individual conversations. You can chat for as long or as short as you'd like. Our AI is designed to maintain context throughout extended conversations and remember previous discussions."
    },
    {
      question: "Can I upload multiple voice samples?",
      answer: "Yes! In fact, we encourage uploading multiple voice samples. Different recordings (casual conversation, formal speech, emotional moments) help create a more complete and authentic voice persona that can respond appropriately in various situations."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. All voice data and conversations are encrypted both in transit and at rest. We never share your personal data with third parties. You own your voice models and conversation history, and you can delete them at any time."
    },
    {
      question: "What languages are supported?",
      answer: "Currently, we support English with high fidelity. We're actively working on expanding to Spanish, French, German, and other major languages. The AI can understand and respond in the same language as the original voice samples."
    },
    {
      question: "Can family members access the same voice persona?",
      answer: "Yes, with our Connect+ and Complete plans, you can share voice personas with family members. This allows everyone to maintain their own unique relationship and conversations while preserving the same cherished voice."
    },
    {
      question: "What happens to my voices if I cancel?",
      answer: "You'll have 30 days to download your voice models and conversation history after cancellation. We provide export tools to ensure you never lose access to these precious memories, even if you decide to discontinue the service."
    },
    {
      question: "How realistic are the conversations?",
      answer: "Our AI is trained to reflect the personality, speech patterns, and relationship dynamics you describe. While it can't replace the actual person, many users find genuine comfort and connection through these conversations, especially during the grieving process."
    }
  ]

  return (
    <section id="faq" className="py-20 bg-background relative overflow-hidden">
      {/* Subtle infinite scroll background effect */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What&apos;s possible with{" "}
            <span className="text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-clip-text">
              Echo
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Common questions about preserving voices and creating meaningful AI conversations
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg bg-card/90 backdrop-blur-md px-6 hover:bg-card/95 transition-colors group"
              >
                <AccordionTrigger className="text-left font-medium text-card-foreground hover:text-primary transition-colors py-6 hover:no-underline">
                  <span className="pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-card/90 backdrop-blur-md border border-border rounded-xl px-8 py-6">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-card-foreground mb-1">Still have questions?</h3>
              <p className="text-muted-foreground text-sm">We&apos;re here to help you preserve precious memories</p>
            </div>
            <div className="flex gap-3">
              <Link href="/help" className="px-4 py-2 text-primary hover:text-primary/80 transition-colors font-medium">
                Contact Support
              </Link>
              <Link href="/sign-up" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(0px) translateX(10px); }
          75% { transform: translateY(10px) translateX(5px); }
        }
      `}</style>
    </section>
  )
}