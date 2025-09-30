'use client';
import { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Mic, MicOff } from 'lucide-react';
import { Badge } from './ui/badge';

// Initialize Vapi once outside the component
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

interface TranscriptMessage {
  role: 'user' | 'bot';
  transcript: string;
}

export function VoiceAgent() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const { user } = useAuth();
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever transcript changes
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    const handleCallStart = () => {
      setIsSessionActive(true);
      setTranscript([]);
    };

    const handleCallEnd = () => {
      setIsSessionActive(false);
    };

    const handleTranscript = (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const role = message.role === 'assistant' ? 'bot' : 'user';
        setTranscript((prev) => [...prev, { role, transcript: message.transcript }]);
      }
    };

    const handleFunctionCall = async (functionCall: any) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('/api/handle-voice-command', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ functionCall }),
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
    };
    
    // Subscribe to Vapi events
    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('transcript', handleTranscript);
    vapi.on('function-call', handleFunctionCall);

    // Cleanup function to remove listeners
    return () => {
      vapi.off('call-start', handleCallStart);
      vapi.off('call-end', handleCallEnd);
      vapi.off('transcript', handleTranscript);
      vapi.off('function-call', handleFunctionCall);
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
        <div className="space-y-4 p-4 border rounded-lg h-64 overflow-y-auto bg-muted/50">
           {transcript.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <Badge variant={item.role === 'user' ? 'secondary' : 'outline'} className="mt-1">
                {item.role === 'user' ? 'You' : 'Wally'}
              </Badge>
              <p className="flex-1">{item.transcript}</p>
            </div>
          ))}
           <div ref={transcriptEndRef} />
        </div>
      </CardContent>
    </Card>
  );
}
