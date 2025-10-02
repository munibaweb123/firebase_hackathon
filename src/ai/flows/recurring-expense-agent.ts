'use server';

/**
 * @fileOverview This file contains the Genkit flow for identifying recurring expenses.
 *
 * - checkForRecurringExpense - A function that triggers the recurring expense check.
 * - RecurringExpenseInput - The input type for the checkForRecurringExpense function.
 * - RecurringExpenseOutput - The return type for the checkForRecurringExpense function.
 */

import { ai } from '@/ai/client';
import { z } from 'zod';
import type { Transaction } from '@/lib/types';

const RecurringExpenseInputSchema = z.object({
  transaction: z.object({
    description: z.string(),
    amount: z.number(),
    category: z.string(),
  }),
  pastTransactions: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    category: z.string(),
    date: z.date(),
  })),
});
export type RecurringExpenseInput = z.infer<typeof RecurringExpenseInputSchema>;

const RecurringExpenseOutputSchema = z.object({
  isRecurring: z.boolean().describe('Whether the transaction is a recurring expense.'),
  reason: z.string().optional().describe('The reason for the determination.'),
});
export type RecurringExpenseOutput = z.infer<typeof RecurringExpenseOutputSchema>;

export async function checkForRecurringExpense(
  input: RecurringExpenseInput
): Promise<RecurringExpenseOutput> {
  return recurringExpenseAgentFlow(input);
}

const recurringExpenseAgentFlow = ai.defineFlow(
  {
    name: 'recurringExpenseAgentFlow',
    inputSchema: RecurringExpenseInputSchema,
    outputSchema: RecurringExpenseOutputSchema,
  },
  async ({ transaction, pastTransactions }) => {
    // Simple rule-based check for now.
    // A more advanced version could use AI to find patterns.
    const recurringKeywords = ['netflix', 'rent', 'gym', 'spotify', 'subscription', 'membership'];
    const descriptionLower = transaction.description.toLowerCase();

    if (recurringKeywords.some(keyword => descriptionLower.includes(keyword))) {
        return { isRecurring: true, reason: 'Transaction description contains a recurring keyword.' };
    }

    // Check for similar transactions in the past
    const similarTransactions = pastTransactions.filter(
      (t) =>
        t.description.toLowerCase() === descriptionLower &&
        Math.abs(t.amount - transaction.amount) < 1 // Allow for small variations in amount
    );

    if (similarTransactions.length > 1) {
        return { isRecurring: true, reason: 'Multiple similar transactions found in the past.' };
    }

    return { isRecurring: false };
  }
);
