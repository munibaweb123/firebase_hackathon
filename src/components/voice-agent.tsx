
'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import type { Transaction, Budget } from '@/lib/types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';


interface Message {
  role: 'user' | 'model';
  content: string;
}

interface VoiceAgentProps {
  userId: string | undefined;
  pastTransactions: Transaction[];
  budgets: Budget[];
}

export function VoiceAgent({ userId, pastTransactions, budgets }: VoiceAgentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleStartRecording = async () => {
    if (!userId) {
      alert('Please log in to use the voice agent.');
      return;
    }
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const transcribeAudioFlow = httpsCallable(functions, 'transcribeAudioFlow');
            const chatFlow = httpsCallable(functions, 'chatFlow');

            // 1. Transcribe Audio
            const transcriptionResult = (await transcribeAudioFlow({ audio: base64Audio })).data as any;
            const transcribedText = transcriptionResult.text;


            if(transcribedText && transcribedText.trim() !== '' && userId) {
               setTranscript((prev) => [...prev, { role: 'user', content: transcribedText }]);
              
              // 2. Get Chat Response (which may use tools)
              const chatResponse = (await chatFlow({
                userId: userId,
                message: transcribedText,
                history: transcript.slice(-10), // Pass last 10 messages as history
                pastTransactions: pastTransactions.map(t => ({...t, date: t.date.toISOString()})),
                budgets: budgets
              })).data as any;


              if (chatResponse.message) {
                setTranscript((prev) => [...prev, { role: 'model', content: chatResponse.message }]);
              }

              // 3. Play Audio Response
              if (chatResponse.audio) {
                if (audioRef.current) {
                  audioRef.current.src = chatResponse.audio;
                  audioRef.current.play();
                }
              }
            }
          } catch (error) {
            console.error('Error processing audio:', error);
            setTranscript((prev) => [...prev, { role: 'model', content: "Sorry, I ran into an issue. Please try again." }]);
          } finally {
            setIsProcessing(false);
          }
        };
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access the microphone. Please check your browser permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
       // Stop microphone tracks to turn off the indicator
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Talk to Wally</CardTitle>
        <CardDescription>
          Click to record. Click again to stop.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col items-center">
        <Button
          onClick={toggleRecording}
          disabled={isProcessing || !userId}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-10 w-10" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </Button>
        
        <div className="w-full space-y-4 p-4 border rounded-lg h-64 overflow-y-auto bg-muted/50">
           {transcript.length === 0 && (
             <div className="flex items-center justify-center h-full text-muted-foreground">
               Ask me to add a transaction!
            </div>
           )}
           {transcript.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <Badge variant={item.role === 'user' ? 'secondary' : 'outline'} className="mt-1 capitalize">
                {item.role === 'user' ? 'You' : 'Wally'}
              </Badge>
              <p className="flex-1">{item.content}</p>
            </div>
          ))}
           {isProcessing && (
              <div className="flex items-center gap-3">
                 <Badge variant='outline' className="mt-1 capitalize">Wally</Badge>
                 <Loader2 className="h-5 w-5 animate-spin" />
              </div>
           )}
           <div ref={transcriptEndRef} />
        </div>
        <audio ref={audioRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
