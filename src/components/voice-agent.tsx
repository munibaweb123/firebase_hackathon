'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { transcribeAudio } from '@/ai/flows/speech-to-text-flow';
import { chat } from '@/ai/flows/chat-flow';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function VoiceAgent() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const { user } = useAuth();
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleStartRecording = async () => {
    if (!user) {
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
            // 1. Transcribe Audio
            const { text: transcribedText } = await transcribeAudio({ audio: base64Audio });

            if(transcribedText && transcribedText.trim() !== '') {
               setTranscript((prev) => [...prev, { role: 'user', content: transcribedText }]);
              
              // 2. Get Chat Response
              const chatResponse = await chat({
                message: transcribedText,
                history: transcript.slice(-10), // Pass last 10 messages as history
              });

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
            // Optionally, show a toast or message to the user
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Talk to Wally</CardTitle>
        <CardDescription>
          Click the button to start recording your transaction. Click again to stop.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col items-center">
        <Button
          onClick={toggleRecording}
          disabled={isProcessing}
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
