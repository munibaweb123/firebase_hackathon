'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating budget alerts.
 *
 * - generateBudgetAlerts - A function that triggers the budget alert generation.
 * - BudgetAlertInput - The input type for the generateBudgetAlerts function.
 * - BudgetAlertOutput - The return type for the generateBudgetAlerts function.
 */

import { ai } from '@/ai/client';
import { z } from 'zod';

const BudgetAlertInputSchema = z.object({
  category: z.string(),
  totalSpent: z.number(),
  budgetLimit: z.number(),
});
export type BudgetAlertInput = z.infer<typeof BudgetAlertInputSchema>;

const AlertSchema = z.object({
  type: z.enum(['Budget', 'Recurring']),
  message: z.string(),
});

const BudgetAlertOutputSchema = z.object({
  alerts: z.array(AlertSchema).describe('A list of budget-related alerts.'),
});
export type BudgetAlertOutput = z.infer<typeof BudgetAlertOutputSchema>;

export async function generateBudgetAlerts(
  input: BudgetAlertInput
): Promise<BudgetAlertOutput> {
  return budgetAlertAgentFlow(input);
}

const budgetAlertAgentFlow = ai.defineFlow(
  {
    name: 'budgetAlertAgentFlow',
    inputSchema: BudgetAlertInputSchema,
    outputSchema: BudgetAlertOutputSchema,
  },
  async ({ category, totalSpent, budgetLimit }) => {
    const alerts: z.infer<typeof AlertSchema>[] = [];
    const spendingRatio = totalSpent / budgetLimit;

    if (spendingRatio >= 1) {
      alerts.push({
        type: 'Budget',
        message: `🚨 You have exceeded your budget for ${category} by ${Math.round((spendingRatio - 1) * 100)}%.`,
      });
    } else if (spendingRatio >= 0.8) {
      alerts.push({
        type: 'Budget',
        message: `⚠️ You have spent ${Math.round(spendingRatio * 100)}% of your ${category} budget. Consider reducing spending in this area.`,
      });
    }

    return { alerts };
  }
);
