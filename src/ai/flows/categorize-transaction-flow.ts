'use server';

/**
 * @fileOverview This file contains the Genkit flow for categorizing a transaction from a natural language string.
 *
 * - categorizeTransaction - A function that triggers the transaction categorization flow.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import { ai } from '@/ai/client';
import { z } from 'zod';
import { allCategories, expenseCategories } from '@/lib/data';

const CategorizeTransactionInputSchema = z.object({
  text: z.string().describe('The natural language text describing a transaction, including amount, merchant, and description.'),
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
  prompt: `You are the Auto Categorization Agent for the WealthWise app. Your job is to classify each financial transaction into a spending category.
  Analyze the following text and extract the transaction details.
  The currency is assumed to be USD unless specified otherwise.
  Assign one category from this list for expenses: ${expenseCategories.join(', ')}.
  For income, you can use categories like Salary, Freelance, etc.
  If unsure, choose "Other".
  Be consistent across similar merchants (e.g., Starbucks -> Food & Dining, Uber -> Transport).

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
