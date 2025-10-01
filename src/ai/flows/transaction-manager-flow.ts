'use server';

/**
 * @fileOverview This file contains the main Manager Agent flow for processing transactions.
 * It coordinates multiple sub-agents to categorize, analyze, and generate insights for each transaction.
 *
 * - processTransaction - The main function to trigger the transaction processing workflow.
 * - ProcessTransactionInput - The input type for the processTransaction function.
 * - ProcessTransactionOutput - The return type for the processTransaction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Transaction, Budget } from '@/lib/types';

import { categorizeTransaction } from './categorize-transaction-flow';
import { checkForRecurringExpense } from './recurring-expense-agent';
import { spendingInsightsWithAI } from './spending-insights-ai';
import { generateBudgetAlerts } from './budget-alert-agent';
import { allCategories } from '@/lib/data';

const ProcessTransactionInputSchema = z.object({
  rawInput: z.string().describe('The raw text input describing the transaction.'),
  pastTransactions: z.array(z.object({
      id: z.string(),
      date: z.date(),
      description: z.string(),
      category: z.string(),
      amount: z.number(),
      type: z.enum(['income', 'expense']),
  })).describe("A list of the user's past transactions."),
  budgets: z.array(z.object({
      category: z.string(),
      limit: z.number(),
  })).describe("The user's current budget limits."),
});
export type ProcessTransactionInput = z.infer<typeof ProcessTransactionInputSchema>;

const ProcessTransactionOutputSchema = z.object({
  transaction: z.object({
    description: z.string(),
    amount: z.number(),
  }),
  category: z.enum(allCategories as [string, ...string[]]),
  recurring: z.boolean(),
  insights: z.array(z.string()),
  alerts: z.array(z.string()),
});
export type ProcessTransactionOutput = z.infer<typeof ProcessTransactionOutputSchema>;


export async function processTransaction(
  input: ProcessTransactionInput
): Promise<ProcessTransactionOutput> {
  return transactionManagerFlow(input);
}


const transactionManagerFlow = ai.defineFlow(
  {
    name: 'transactionManagerFlow',
    inputSchema: ProcessTransactionInputSchema,
    outputSchema: ProcessTransactionOutputSchema,
  },
  async ({ rawInput, pastTransactions, budgets }) => {
    // 1. Auto Categorization Agent
    const categorized = await categorizeTransaction({ text: rawInput });

    const newTransaction = {
        description: categorized.description,
        amount: categorized.amount,
        category: categorized.category,
    };
    
    // 2. Recurring Expense Agent
    const recurringResult = await checkForRecurringExpense({
        transaction: newTransaction,
        pastTransactions: pastTransactions,
    });

    // 3. Spending Insights & Trends Agent
    const currentMonthExpenses = pastTransactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((acc, t) => {
            const item = acc.find(item => item.category === t.category);
            if (item) {
                item.amount += t.amount;
            } else {
                acc.push({ category: t.category, amount: t.amount });
            }
            return acc;
        }, [] as { category: string; amount: number }[]);
    
    const income = pastTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const insightsResult = await spendingInsightsWithAI({
        income: income,
        expenses: currentMonthExpenses,
        budgetLimits: budgets,
    });

    // 4. Budget Alert Agent
    let alerts: string[] = [];
    const budgetForCategory = budgets.find(b => b.category === categorized.category);
    if (budgetForCategory) {
        const totalSpent = (currentMonthExpenses.find(e => e.category === categorized.category)?.amount || 0) + newTransaction.amount;
        const alertResult = await generateBudgetAlerts({
            category: categorized.category,
            totalSpent: totalSpent,
            budgetLimit: budgetForCategory.limit,
        });
        alerts = alertResult.alerts;
    }
    
    // 5. Final structured response
    return {
      transaction: {
        description: newTransaction.description,
        amount: newTransaction.amount,
      },
      category: newTransaction.category as any,
      recurring: recurringResult.isRecurring,
      insights: [insightsResult.spendingAnalysis, insightsResult.savingsSuggestions].filter(Boolean),
      alerts: alerts,
    };
  }
);
