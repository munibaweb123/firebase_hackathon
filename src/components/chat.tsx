'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { chat, ChatInput, ChatOutput } from '@/ai/flows/chat-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { SendHorizonal } from 'lucide-react';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const form = useForm<ChatInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit: SubmitHandler<ChatInput> = async (data) => {
    setLoading(true);
    setMessages((prev) => [...prev, { sender: 'user', text: data.message }]);
    form.reset();

    try {
      const response: ChatOutput = await chat(data);
      setMessages((prev) => [...prev, { sender: 'ai', text: response.message }]);

      if (audioRef.current) {
        audioRef.current.src = response.audio;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I ran into an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ensure we have an audio element to play the responses
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border">
      <div className="h-40 overflow-y-auto mb-4 p-2 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2 ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-muted-foreground">Thinking...</div>}
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
                    placeholder="Ask Wally anything..."
                    {...field}
                    autoComplete="off"
                    suppressHydrationWarning
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="icon" disabled={loading} suppressHydrationWarning>
            <SendHorizonal />
          </Button>
        </form>
      </Form>
    </div>
  );
}
