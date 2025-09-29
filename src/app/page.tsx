'use client';

import Chat from '@/components/chat';
import { Landmark } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center justify-center">
      <header className="absolute top-0 left-0 z-10 p-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-foreground">
          <Landmark className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">WealthWise</h1>
        </Link>
      </header>

      <main className="w-full max-w-4xl p-4">
        <Chat />
      </main>
    </div>
  );
}
