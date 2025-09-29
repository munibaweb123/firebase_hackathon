import { Button } from '@/components/ui/button';
import { Landmark } from 'lucide-react';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            TrackIt
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/sign-in">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
          <h2 className="text-4xl font-bold">Welcome to TrackIt</h2>
          <p className="text-muted-foreground">
            Your personal finance tracking companion.
          </p>
          <Button asChild size="lg">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
