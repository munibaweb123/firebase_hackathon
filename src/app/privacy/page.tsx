
'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your privacy is important to us. It is WealthWise's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
            </p>
            <h3 className="font-semibold text-lg">1. Information we collect</h3>
            <p>
              We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
            </p>
            <h3 className="font-semibold text-lg">2. How we use your information</h3>
            <p>
              We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
            </p>
            <h3 className="font-semibold text-lg">3. Security</h3>
            <p>
              We don’t share any personally identifying information publicly or with third-parties, except when required to by law.
            </p>
             <p>
              Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
            </p>
            <p>
              You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.
            </p>
             <p>
              Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.
            </p>
             <p>This policy is effective as of 1 August 2024.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
