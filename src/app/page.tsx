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
import Image from 'next/image';
import { ArrowRight, Mic, Shield, Smartphone, TrendingUp } from 'lucide-react';

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

const features = [
  {
    icon: Mic,
    title: 'Voice-Powered',
    description: 'Simply speak to log transactions - no typing required',
    color: 'from-primary to-violet-500'
  },
  {
    icon: TrendingUp,
    title: 'Smart Analytics',
    description: 'Visualize your spending patterns with intuitive charts',
    color: 'from-teal-400 to-cyan-500'
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'Your financial data is protected with enterprise-grade security',
    color: 'from-red-500 to-orange-500'
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description: 'Access your finances anywhere, on any device',
    color: 'from-orange-400 to-yellow-500'
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#1C0E2B] to-[#241539]">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-pink-500/10" />
          <div className="container relative mx-auto grid lg:grid-cols-2 gap-12 items-center px-4 md:px-6">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Take Control of Your{' '}
                <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  Finances
                </span>{' '}
                with WealthWise
              </h1>
              <p className="max-w-xl mx-auto lg:mx-0 text-lg text-muted-foreground">
                The smart, voice-powered way to track expenses, manage budgets,
                and achieve your financial goals. Get started for free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white border-0 shadow-lg">
                  <Link href="/signup" className="flex items-center">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-card text-white bg-white/5 hover:bg-white/10 hover:text-white">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
            <div className="relative w-full max-w-lg mx-auto lg:max-w-none h-64 lg:h-auto lg:aspect-video">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur-2xl opacity-30"></div>
                <Image
                src="/hero.png"
                alt="AI robot interacting with financial data interfaces"
                fill
                className="relative object-contain rounded-xl shadow-2xl border border-card"
                data-ai-hint="AI finance"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Why Choose WealthWise?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the future of personal finance management with our innovative features
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative bg-card rounded-2xl p-6 hover:bg-accent/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/10"
                >
                   <div className={`absolute -inset-px bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                  <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="relative text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="relative text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Voice Agent Section */}
        <section id="voice-agent" className="py-20 lg:py-24 bg-card/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="w-full max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-violet-600 mb-4">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Meet Wally, Your Voice Assistant
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Managing your money is now as easy as talking. Just tell Wally about your transactions.
                </p>
              </div>
              <div className="bg-card rounded-2xl p-8 border border-border shadow-2xl shadow-primary/10">
                <VoiceAgent />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 lg-py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Find answers to common questions about WealthWise.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem 
                    value={`item-${index}`} 
                    key={item.question}
                    className="bg-card border-border rounded-lg px-6 mb-4 hover:bg-accent/50 transition-colors"
                  >
                    <AccordionTrigger className="text-lg font-medium text-left text-white hover:text-primary py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary via-violet-600 to-pink-500 rounded-3xl p-12">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                Ready to Transform Your Financial Journey?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already taking control of their finances with WealthWise.
              </p>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 border-0 shadow-lg">
                <Link href="/signup" className="flex items-center">
                  Start Your Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WealthWise. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/privacy" className="text-muted-foreground hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
