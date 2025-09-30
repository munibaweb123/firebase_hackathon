'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { chat, ChatInput, ChatOutput } from '@/ai/flows/chat-flow';
import { transcribeAudio } from '@/ai/flows/speech-to-text-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, SendHorizonal, User, Mic, MicOff } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const defaultAvatar = PlaceHolderImages.find(p => p.id === 'default-avatar');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const form = useForm<{ message: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const processAndSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setLoading(true);
    const newMessages: Message[] = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    form.reset();

    try {
      const chatInput: ChatInput = {
        history: messages,
        message,
      };

      const response: ChatOutput = await chat(chatInput);
      setMessages((prev) => [...prev, { role: 'model', content: response.message }]);

      if (audioRef.current && response.audio) {
        audioRef.current.src = response.audio;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [...prev, { role: 'model', content: 'Sorry, I ran into an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<{ message: string }> = async (data) => {
    await processAndSendMessage(data.message);
  };
  
  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              setLoading(true);
              const { text } = await transcribeAudio({ audio: base64Audio });
              if (text) {
                await processAndSendMessage(text);
              }
            } catch (error) {
              console.error('Error transcribing audio:', error);
              toast({
                variant: 'destructive',
                title: 'Transcription Failed',
                description: 'Could not transcribe the audio. Please try again.',
              });
            } finally {
              setLoading(false);
            }
          };
           // Stop all media tracks to turn off the microphone indicator
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
          variant: 'destructive',
          title: 'Microphone Access Denied',
          description: 'Please enable microphone permissions in your browser to use voice input.',
        });
      }
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border shadow-lg">
       <div className="h-80 overflow-y-auto mb-4 p-4 space-y-4 rounded-lg bg-background/30">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <Avatar className="h-8 w-8">
                <AvatarFallback><Bot size={20} /></AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.content}
            </div>
             {msg.role === 'user' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={defaultAvatar?.imageUrl} />
                <AvatarFallback><User size={20} /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
         {loading && (
          <div className="flex items-start gap-3 justify-start">
             <Avatar className="h-8 w-8">
                <AvatarFallback><Bot size={20} /></AvatarFallback>
              </Avatar>
            <div className="max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 text-sm bg-muted flex items-center gap-2">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder={isRecording ? 'Recording...' : 'Ask Wally anything...'}
                    {...field}
                    autoComplete="off"
                    suppressHydrationWarning
                    className="bg-background/80"
                    disabled={isRecording}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            size="icon"
            variant={isRecording ? 'destructive' : 'outline'}
            onClick={handleToggleRecording}
            disabled={loading}
            suppressHydrationWarning
          >
            {isRecording ? <MicOff /> : <Mic />}
          </Button>
          <Button type="submit" size="icon" disabled={loading || isRecording} suppressHydrationWarning>
            <SendHorizonal />
          </Button>
        </form>
      </Form>
    </div>
  );
}
