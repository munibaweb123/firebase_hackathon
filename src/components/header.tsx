'use client';
import { UserButton } from '@clerk/nextjs';
import { Landmark } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          TrackIt
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <UserButton />
      </div>
    </header>
  );
}
