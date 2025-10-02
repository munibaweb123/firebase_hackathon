'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const teamMembers = [
  { name: 'Muniba Ahmed', role: 'Team Lead' },
  { name: 'Nitoo Kumari', role: 'Team Member' },
  { name: 'Sana Abid', role: 'Team Member' },
  { name: 'Wania', role: 'Team Member' },
  { name: 'Aksa', role: 'Team Member' },
];

export default function AboutPage() {
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestGreeting = async () => {
    setLoading(true);
    setGreeting('');
    try {
      const helloFlow = httpsCallable(functions, 'helloFlowFn');
      const response = (await helloFlow({ name: 'Studio User' })).data as any;
      setGreeting(response.greeting);
    } catch (error) {
      console.error('Error fetching greeting:', error);
      setGreeting('Failed to get a greeting.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">About WealthWise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              Your partner in achieving financial clarity and freedom.
            </p>
            <p>
              WealthWise started with a simple idea: personal finance should be accessible and manageable for everyone. In a world of complex financial tools, we wanted to create a straightforward, intuitive platform that empowers users to take control of their financial journey. 
            </p>
            <p>
              Our mission is to provide you with the tools and insights you need to understand your spending, save effectively, and achieve your financial goals. Whether you're just starting to track your expenses or you're a seasoned budgeter, WealthWise is designed to support you every step of the way.
            </p>
            <p>
              We believe in the power of technology to simplify lives. That's why we've built WealthWise with a focus on user experience, powerful features, and the latest in AI to offer personalized financial advice.
            </p>
            
            <Separator className="my-6" />

             {/* Genkit Test Section */}
            <div className="text-center p-4 border rounded-lg">
              <h2 className="text-xl font-bold mb-2">Test Your Genkit Flow</h2>
              <p className="text-muted-foreground mb-4">Click the button below to call the `hello` flow.</p>
              <Button onClick={handleTestGreeting} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Test AI Greeting
              </Button>
              {greeting && (
                <div className="mt-4 p-4 bg-muted rounded-md text-left">
                  <p className="font-semibold">AI Response:</p>
                  <p className="text-sm">{greeting}</p>
                </div>
              )}
            </div>

            <Separator className="my-6" />


            <div className="text-center">
              <h2 className="text-2xl font-bold">Meet the Team</h2>
              <p className="text-muted-foreground">The passionate individuals behind WealthWise.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                     <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      </div>
    </>
  );
}
