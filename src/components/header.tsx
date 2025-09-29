'use client';
import { Landmark, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          WealthWise
        </h1>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
