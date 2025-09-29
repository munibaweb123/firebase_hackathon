'use client';
import { Landmark } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          WealthWise
        </h1>
      </Link>
      <div className="ml-auto flex items-center gap-4"></div>
    </header>
  );
}
