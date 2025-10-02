'use server';

/**
 * @fileOverview Generates personalized savings plans based on user's financial data.
 *
 * - generateSavingsPlans - A function that generates personalized savings plans.
 * - SavingsPlansInput - The input type for the generateSavingsPlans function.
 * - SavingsPlansOutput - The return type for the generateSavingsPlans function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SavingsPlansInputSchema = z.object({
  income: z.number().describe('The user\'s monthly income.'),
  expenses: z.array(
    z.object({
      category: z.string().describe('The category of the expense.'),
      amount: z.number().describe('The amount spent on the expense.'),
    })
  ).describe('A list of the user\'s monthly expenses.'),
  budgetGoals: z.string().describe('The user\'s budgeting goals.'),
});
export type SavingsPlansInput = z.infer<typeof SavingsPlansInputSchema>;

const SavingsPlansOutputSchema = z.object({
  savingsPlans: z.array(z.string()).describe('A list of personalized savings plans.'),
});
export type SavingsPlansOutput = z.infer<typeof SavingsPlansOutputSchema>;

export async function generateSavingsPlans(input: SavingsPlansInput): Promise<SavingsPlansOutput> {
  return suggestedSavingsPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestedSavingsPlansPrompt',
  input: {schema: SavingsPlansInputSchema},
  output: {schema: SavingsPlansOutputSchema},
  prompt: `You are a financial advisor who specializes in creating personalized savings plans.

  Based on the user's income, expenses, and budgeting goals, you will generate a list of savings plans that the user can implement to improve their financial health.

  Income: {{income}}
  Expenses:
  {{#each expenses}}
  - {{category}}: {{amount}}
  {{/each}}
  Budgeting Goals: {{budgetGoals}}

  Savings Plans:`, // The Handlebars template should end with the field being populated.
});

const suggestedSavingsPlansFlow = ai.defineFlow(
  {
    name: 'suggestedSavingsPlansFlow',
    inputSchema: SavingsPlansInputSchema,
    outputSchema: SavingsPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
