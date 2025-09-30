'use client';

import { VoiceAgent } from '@/components/voice-agent';
import { Header } from '@/components/header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const faqItems = [
  {
    question: 'What is WealthWise?',
    answer:
      'WealthWise is a modern personal finance application designed to help you effortlessly track your income and expenses. It uses a voice-powered agent to make logging transactions as simple as speaking.',
  },
  {
    question: 'How does the voice agent work?',
    answer:
      'Our voice agent, Wally, listens to your commands to add transactions. For example, you can say, "I spent 20 dollars on groceries," and Wally will automatically categorize and save the expense for you.',
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Yes, absolutely. We use Firebase Authentication to secure your account and Firestore to store your data, which employs industry-standard security rules to ensure only you can access your financial information.',
  },
  {
    question: 'Can I use this on my mobile device?',
    answer:
      'Yes, WealthWise is designed to be fully responsive and works beautifully on desktops, tablets, and mobile phones, so you can manage your finances from anywhere.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'homepage-hero');

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 lg:py-32 bg-secondary/50">
           <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center px-4 md:px-6">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Take Control of Your Finances with WealthWise
              </h1>
              <p className="max-w-xl mx-auto lg:mx-0 text-lg text-muted-foreground">
                The smart, voice-powered way to track expenses, manage budgets,
                and achieve your financial goals. Get started for free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Started <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                   <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
            {heroImage && (
                 <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={600}
                    height={400}
                    className="mx-auto rounded-xl shadow-2xl"
                    data-ai-hint={heroImage.imageHint}
                />
            )}
          </div>
        </section>

        {/* Voice Agent Section */}
        <section id="voice-agent" className="py-20 lg:py-24">
          <div className="container mx-auto px-4 md:px-6">
             <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Meet Wally, Your Voice Assistant</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Managing your money is now as easy as talking. Just tell Wally about your transactions.</p>
                </div>
                <VoiceAgent />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 lg:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Find answers to common questions about WealthWise.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={item.question}>
                    <AccordionTrigger className="text-lg font-medium text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

        <footer className="py-6 bg-background border-t">
            <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} WealthWise. All rights reserved.</p>
            </div>
        </footer>
    </div>
  );
}
