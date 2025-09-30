'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-muted-foreground text-center">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" suppressHydrationWarning />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" suppressHydrationWarning />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" suppressHydrationWarning />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." suppressHydrationWarning />
              </div>
              <Button type="submit" className="w-full" suppressHydrationWarning>
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
