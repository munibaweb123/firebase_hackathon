import { Landmark } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-2">
        <Landmark className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">TrackIt</h1>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        Your personal finance tracking companion.
      </p>
      <div className="mt-8 flex gap-4">
        {/* The dashboard is now the main experience */}
      </div>
    </div>
  );
}
