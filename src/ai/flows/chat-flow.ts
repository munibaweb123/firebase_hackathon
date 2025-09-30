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

    // Generate the text response
    const llmResponse = await ai.generate({
      history,
      prompt: input.message,
      config: {
        maxOutputTokens: 100,
      },
      system:
        'You are a friendly AI assistant named Wally. Keep your responses concise and helpful.',
    });
    const responseText = llmResponse.text;

    if (!responseText) {
      return {
        message: "I'm sorry, I couldn't generate a response.",
        audio: '',
      };
    }

    // Generate the audio response
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'achernar'},
          },
        },
      },
      prompt: responseText,
    });

    if (!media) {
      // This can happen if the responseText is empty or contains unsupported characters.
      // We return the text message but no audio.
      return {
        message: responseText,
        audio: '',
      };
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      message: responseText,
      audio: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
