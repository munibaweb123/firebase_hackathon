'use client';
import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Mic, MicOff } from 'lucide-react';
import { Badge } from './ui/badge';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

interface TranscriptMessage {
  role: 'user' | 'bot';
  transcript: string;
}

export function VoiceAgent() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    vapi.on('call-start', () => {
      setIsSessionActive(true);
      setTranscript([]);
    });

    vapi.on('call-end', () => {
      setIsSessionActive(false);
    });

    vapi.on('transcript', (message) => {
      if (message.type === 'transcript') {
        const role = message.role === 'assistant' ? 'bot' : 'user';
        // Only update if the transcript is final
        if (message.transcriptType === 'final') {
           setTranscript((prev) => [...prev, { role, transcript: message.transcript }]);
        }
      }
    });

     vapi.on('function-call', async (functionCall) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('/api/handle-voice-command', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(functionCall),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to handle voice command:', errorData.error);
          }
        } catch (error) {
          console.error('Error sending function call to backend:', error);
        }
      } else {
        console.log('User not authenticated. Cannot process function call.');
      }
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, [user]);

  const start = () => {
    if (!user) {
      alert('Please log in to use the voice agent.');
      return;
    }
    vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
  };

  const stop = () => {
    vapi.stop();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Voice Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-4">
          <Button onClick={start} disabled={isSessionActive}>
            <Mic className="mr-2" /> Start Voice Agent
          </Button>
          <Button onClick={stop} disabled={!isSessionActive} variant="destructive">
            <MicOff className="mr-2" /> Stop Session
          </Button>
        </div>
        <div className="space-y-2 p-4 border rounded-lg h-64 overflow-y-auto bg-muted/50">
           {transcript.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Badge variant={item.role === 'user' ? 'secondary' : 'outline'}>
                {item.role === 'user' ? 'You' : 'Wally'}
              </Badge>
              <p>{item.transcript}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
