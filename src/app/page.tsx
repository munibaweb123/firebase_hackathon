'use client';

import { VoiceAgent } from '@/components/voice-agent';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <VoiceAgent />
        </div>
      </main>
    </div>
  );
}
