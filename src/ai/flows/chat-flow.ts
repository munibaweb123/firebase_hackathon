'use server';
/**
 * @fileOverview A simple chat flow that generates a text response and converts it to speech.
 * It can also use tools, like adding a transaction.
 *
 * - chat - A function that handles the chat interaction.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import { addTransaction as saveTransactionToDb } from '@/lib/firestore';
import { categorizeTransaction } from './categorize-transaction-flow';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  userId: z.string(),
  history: z.array(MessageSchema),
  message: z.string().describe("The user's message to the AI."),
  pastTransactions: z.array(z.any()), // Keeping it simple for now
  budgets: z.array(z.any()),
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


const addTransactionTool = ai.defineTool(
  {
    name: 'addTransaction',
    description: 'Use this to add a new income or expense transaction. The input should be a natural language description of the transaction (e.g., "I just spent $10 on coffee" or "received 2000 for my salary").',
    inputSchema: z.object({
      userId: z.string().optional(), // Make optional so LLM doesn't need to provide it.
      transactionText: z.string().describe('The natural language description of the transaction.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
    }),
  },
  async ({ userId, transactionText }) => {
    if (!userId) {
       return {
        success: false,
        message: "Please provide your User ID so I can save this transaction.",
      };
    }
    try {
      // The tool now only categorizes, it doesn't save.
      const categorized = await categorizeTransaction({ text: transactionText });
      if (!categorized.category || !categorized.amount) {
         return {
            success: false,
            message: "I couldn't figure out the details for that transaction. Could you be more specific?",
         };
      }
      
      // We ask for confirmation in the main flow.
      const confirmationMessage = `You spent $${categorized.amount} on ${categorized.description}, correct?`;

      return {
        success: true,
        message: confirmationMessage,
        data: categorized
      };
      
    } catch (error: any) {
      console.error('Tool error:', error);
       return {
        success: false,
        message: "I'm sorry, there was an issue processing your request. Please try again.",
      };
    }
  }
);


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
    try {
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
        tools: [addTransactionTool],
        toolConfig: {
           custom: (toolRequest) => {
             if (toolRequest.name === 'addTransaction') {
                toolRequest.input.userId = input.userId;
             }
             return toolRequest;
           }
        },
        config: {
          maxOutputTokens: 256,
        },
        system: `You are Wally, a friendly financial assistant that works through voice.
Your job is to listen to the user’s spoken commands and help them record, manage, and view their financial transactions.

Core Instructions:
1. Always understand the intent: add expense, add income, view balance, view transactions, delete or update a transaction.
2. When adding a transaction, use the 'addTransaction' tool to parse the details.
3. The tool will return a confirmation message. You must ask the user this confirmation question.
4. If the user confirms (e.g., "yes", "correct"), on the *next* turn, you will call the 'saveTransactionToDb' function to actually save the data.
5. Never proceed with saving if a User ID is missing. The tool handles this check.
6. Respond in a natural, short, voice-friendly way.
7. Be polite and helpful.
`,
      });

      const responseText = llmResponse.text;
      const fallbackMessage = "I didn’t quite get that. Can you rephrase?";

      async function generateAudio(text: string): Promise<string> {
        try {
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

      if (llmResponse.toolRequests.length > 0) {
        // This is a simplified example. A real implementation would need to handle
        // the user's confirmation ("yes/no") in the next turn to actually save the transaction.
        // For now, we'll just return the confirmation question.
        const toolResponse = llmResponse.toolRequests[0];
        const toolResult = await addTransactionTool(toolResponse.input);
        const messageToUser = toolResult.message;
        
        const responseAudio = await generateAudio(messageToUser);

        return {
          message: messageToUser,
          audio: responseAudio,
        };
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
    } catch (error) {
      console.error('An unexpected error occurred in the chat flow:', error);
      return {
        message: 'Sorry, I ran into an unexpected issue. Please try again.',
        audio: '',
      };
    }
  }
);
