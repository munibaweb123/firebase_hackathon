'use server';
/**
 * @fileOverview A simple "hello world" flow for Genkit.
 *
 * - hello - A function that generates a greeting.
 * - HelloInput - The input type for the hello function.
 * - HelloOutput - The return type for the hello function.
 */

import { ai } from '@/ai/client';
import { z } from 'zod';

const HelloInputSchema = z.object({
  name: z.string().describe('The name to include in the greeting.'),
});
export type HelloInput = z.infer<typeof HelloInputSchema>;

const HelloOutputSchema = z.object({
  greeting: z.string().describe('The generated greeting message.'),
});
export type HelloOutput = z.infer<typeof HelloOutputSchema>;

export async function hello(input: HelloInput): Promise<HelloOutput> {
  return helloFlow(input);
}

const helloFlow = ai.defineFlow(
  {
    name: 'helloFlow',
    inputSchema: HelloInputSchema,
    outputSchema: HelloOutputSchema,
  },
  async ({ name }) => {
    // Make a generation request to the default model.
    const llmResponse = await ai.generate({
      prompt: `Hello Gemini, my name is ${name}`,
    });

    const text = llmResponse.text;

    return {
      greeting: text,
    };
  }
);
