'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const teamMembers = [
  { name: 'Muniba Ahmed', role: 'Team Lead' },
  { name: 'Nitoo Kumari', role: 'Team Member' },
  { name: 'Sana Abid', role: 'Team Member' },
  { name: 'Wania', role: 'Team Member' },
  { name: 'Aksa', role: 'Team Member' },
];

export default function AboutPage() {
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
