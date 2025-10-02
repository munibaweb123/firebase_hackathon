'use server';

/**
 * @fileOverview This file contains the Genkit flow for providing AI-powered insights into spending habits.
 *
 * It analyzes spending data to identify patterns and suggest potential savings plans.
 * - spendingInsightsWithAI - A function that triggers the spending insights flow.
 * - SpendingInsightsWithAIInput - The input type for the spendingInsightsWithAI function.
 * - SpendingInsightsWithAIOutput - The return type for the spendingInsightsWithAI function.
 */

import {ai} from '@/ai/client';
import {z} from 'zod';

const SpendingInsightsWithAIInputSchema = z.object({
  income: z.number().describe('The total income for the period.'),
  expenses: z
    .array(z.object({
      category: z.string().describe('The category of the expense.'),
      amount: z.number().describe('The amount spent in that category.'),
    }))
    .describe('An array of expenses with their categories and amounts.'),
  budgetLimits: z
    .array(z.object({
      category: z.string().describe('The category of the budget limit.'),
      limit: z.number().describe('The budget limit for that category.'),
    }))
    .describe('An array of budget limits for each category.'),
});
export type SpendingInsightsWithAIInput = z.infer<
  typeof SpendingInsightsWithAIInputSchema
>;

const SpendingInsightsWithAIOutputSchema = z.object({
  spendingAnalysis: z.string().describe('A detailed analysis of spending patterns and trends.'),
  savingsSuggestions: z
    .string()
    .describe('Specific, actionable suggestions for saving money.'),
});
export type SpendingInsightsWithAIOutput = z.infer<
  typeof SpendingInsightsWithAIOutputSchema
>;

export async function spendingInsightsWithAI(
  input: SpendingInsightsWithAIInput
): Promise<SpendingInsightsWithAIOutput> {
  return spendingInsightsWithAIFlow(input);
}

const spendingInsightsAIPrompt = ai.definePrompt({
  name: 'spendingInsightsAIPrompt',
  input: {schema: SpendingInsightsWithAIInputSchema},
  output: {schema: SpendingInsightsWithAIOutputSchema},
  prompt: `You are a personal finance advisor providing insights and advice based on spending data.

  Analyze the following income, expenses, and budget limits to identify spending patterns, trends, and potential areas for savings.

  Income: {{{income}}}

  Expenses:
  {{#each expenses}}
  - Category: {{{category}}}, Amount: {{{amount}}}
  {{/each}}

  Budget Limits:
  {{#each budgetLimits}}
  - Category: {{{category}}}, Limit: {{{limit}}}
  {{/each}}

  Based on this data, provide a detailed spending analysis and suggest specific, actionable ways to save money.
  The spendingAnalysis should explain where the user is overspending, where they are doing well, and any notable trends. The savingsSuggestions should be concrete and easy to implement.
  `,
});

const spendingInsightsWithAIFlow = ai.defineFlow(
  {
    name: 'spendingInsightsWithAIFlow',
    inputSchema: SpendingInsightsWithAIInputSchema,
    outputSchema: SpendingInsightsWithAIOutputSchema,
  },
  async input => {
    const {output} = await spendingInsightsAIPrompt(input);
    return output!;
  }
);
