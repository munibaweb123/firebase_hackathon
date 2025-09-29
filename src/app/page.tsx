
'use client';

import dynamic from 'next/dynamic';
import Chat from '@/components/chat';
import { Landmark } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const ThreeScene = dynamic(() => import('@/components/three-scene'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="absolute top-0 left-0 z-10 p-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-foreground">
          <Landmark className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">WealthWise</h1>
        </Link>
      </div>

      <div className="absolute inset-0 z-0">
        <ThreeScene />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Chat />
      </div>
    </div>
  );
}
