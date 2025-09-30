'use server';
/**
 * @fileOverview A simple chat flow that generates a text response and converts it to speech.
 *
 * - chat - A function that handles the chat interaction.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string().describe("The user's message to the AI."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string().describe("The AI's response message."),
  audio: z
    .string()
    .describe("The base64 encoded WAV audio of the AI's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const history = input.history.map(msg => ({
      role: msg.role,
      content: [{text: msg.content}],
    }));
    
    // Clean user input to remove transcription artifacts
    const cleanedMessage = input.message.replace(/\[.*?\]/g, '').trim();

    // Generate the text response
    const llmResponse = await ai.generate({
      history,
      prompt: cleanedMessage,
      config: {
        maxOutputTokens: 100,
      },
      system:
        'You are Wally, a helpful financial voice assistant. Always answer in clear, simple English.',
    });
    const responseText = llmResponse.text;
    
    const fallbackMessage = "I didn’t quite get that. Can you rephrase?";

    async function generateAudio(text: string): Promise<string> {
        try {
            const { media } = await ai.generate({
                model: 'googleai/gemini-2.5-flash-preview-tts',
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'achernar' },
                        },
                    },
                },
                prompt: text,
            });

            if (!media) {
                return ''; // Return empty string if audio generation fails
            }

            const audioBuffer = Buffer.from(
                media.url.substring(media.url.indexOf(',') + 1),
                'base64'
            );
            const wavBase64 = await toWav(audioBuffer);
            return `data:audio/wav;base64,${wavBase64}`;
        } catch (error) {
            console.error('Error generating audio:', error);
            // In case of any error (like rate limiting), return no audio.
            return '';
        }
    }

    if (!responseText || responseText.trim() === '') {
      // Don't generate audio for the fallback to save API calls
      return {
        message: fallbackMessage,
        audio: '',
      };
    }
    
    // Generate the audio for the valid response
    const responseAudio = await generateAudio(responseText);

    return {
      message: responseText,
      audio: responseAudio,
    };
  }
);
