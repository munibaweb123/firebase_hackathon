

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
import { ArrowRight, Mic, Shield, Smartphone, BarChart, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

const SplineHero = dynamic(() => import('@/components/spline-hero'), {
  ssr: false,
});


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
    icon: BarChart,
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
    <div className="flex flex-col min-h-screen w-full bg-background dark:bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[80vh] lg:h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-pink-500/5 dark:from-primary/10 dark:via-[#10032A] dark:to-pink-500/10" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="container mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center px-4 md:px-6 relative z-10">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-primary-foreground text-sm mb-4">
                <Sparkles className="w-4 h-4" />
                Intelligent Finance, Humanized
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-tight">
                Your AI {' '}
                <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  Financial Partner
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                The smart, voice-powered way to track expenses, manage budgets, and achieve your financial goals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button asChild size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                  <Link href="/signup" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 w-1/2 h-full lg:relative lg:w-full lg:h-[600px]">
              <SplineHero />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
                Why Choose WealthWise?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience the future of personal finance management with our innovative features designed for modern life.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative bg-card/50 dark:bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border hover:border-primary/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/5"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="relative text-xl font-semibold text-card-foreground mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="relative text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Voice Agent Section */}
        <section id="voice-agent" className="py-20 lg:py-28 bg-gradient-to-b from-card/30 to-background dark:from-card/30 dark:to-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="w-full max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-primary to-violet-600 mb-6 shadow-lg">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
                  Meet Wally, Your Voice Assistant
                </h2>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Managing your money is now as easy as talking. Just tell Wally about your transactions and watch the magic happen.
                </p>
              </div>
              
              <div className="bg-card/50 dark:bg-card/50 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-border shadow-2xl shadow-primary/5">
                <VoiceAgent />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 lg:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Everything you need to know about WealthWise and how it can transform your financial life.
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-3xl">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem 
                    value={`item-${index}`} 
                    key={item.question}
                    className="bg-card/50 dark:bg-card/50 backdrop-blur-sm rounded-2xl px-6 border border-border hover:border-primary/20 transition-colors"
                  >
                    <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:text-primary py-6 text-left">
                      {item.question}
                    </AccordionTrigger>
                    
                    <AccordionContent className="text-base text-muted-foreground pb-6 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary via-violet-600 to-pink-500 rounded-2xl p-12 lg:p-16 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6">
                  Ready to Transform Your Financial Journey?
                </h2>
                
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of users who are already taking control of their finances with WealthWise. Start your free trial today.
                </p>
                
                <Button asChild size="lg" className="h-14 px-10 text-base bg-white text-primary hover:bg-gray-50 border-0 shadow-2xl hover:scale-105 transition-transform">
                  <Link href="/signup" className="flex items-center gap-3">
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                
                <p className="text-white/70 text-sm mt-6">
                  No credit card required • 14-day free trial • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card/30 dark:bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              &copy; {new Date().getFullYear()} WealthWise. All rights reserved.
            </p>
            
            <div className="flex justify-center space-x-8">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
