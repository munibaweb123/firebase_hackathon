'use server';

/**
 * @fileOverview This file contains the Genkit flow for categorizing a transaction from a natural language string.
 *
 * - categorizeTransaction - A function that triggers the transaction categorization flow.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { allCategories } from '@/lib/data';

const CategorizeTransactionInputSchema = z.object({
  text: z.string().describe('The natural language text describing a transaction.'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  description: z.string().describe('A concise description of the transaction.'),
  amount: z.number().describe('The numerical amount of the transaction.'),
  category: z.enum(allCategories as [string, ...string[]]).describe('The most likely category for this transaction.'),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const categorizeTransactionPrompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: { schema: CategorizeTransactionInputSchema },
  output: { schema: CategorizeTransactionOutputSchema },
  prompt: `You are an expert at parsing and categorizing financial transactions.
  Analyze the following text and extract the transaction details.
  The currency is assumed to be USD unless specified otherwise.
  The category must be one of the following: ${allCategories.join(', ')}.

  Text: {{{text}}}
  `,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async (input) => {
    const { output } = await categorizeTransactionPrompt(input);
    return output!;
  }
);
