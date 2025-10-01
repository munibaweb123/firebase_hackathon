
'use server';

import {
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Budget, Transaction } from './types';
import { processTransaction as runManagerAgent } from '@/ai/flows/transaction-manager-flow';
import { mockBudgets, incomeCategories } from './data';
import { 
    getTransactions, 
    getTransactionsCollection, 
    getRecurringExpensesCollection,
    getInsightsCollection,
    getAlertsCollection,
} from './firestore';

/**
 * Processes a raw transaction input (either from text or structured data),
 * runs it through the AI agent workflow, and saves the results to Firestore.
 * This function embodies the "Firebase Integration Agent" persona.
 * @param userId - The ID of the user.
 * @param input - Can be a raw text string or structured transaction data.
 */
export async function processAndSaveTransaction(
  userId: string,
  input: string
): Promise<string> {
  if (!userId) {
    throw new Error('User ID is required to process a transaction.');
  }

  try {
    const pastTransactions = await getTransactions(userId);
    const budgets: Budget[] = mockBudgets; 

    // 1. Get structured data from the AI Manager Agent
    const agentResult = await runManagerAgent({
      rawInput: input,
      pastTransactions: pastTransactions.map(t => ({...t, date: new Date(t.date)})),
      budgets: budgets,
    });

    const { transaction, category, recurring, insights, alerts } = agentResult;
    const type = incomeCategories.includes(category) ? 'income' : 'expense';
    
    // 2. Save categorized transaction
    const transactionsCol = getTransactionsCollection(userId);
    const transactionDoc = {
      description: transaction.description,
      amount: transaction.amount,
      category: category,
      type: type,
      date: Timestamp.now(),
    };
    await addDoc(transactionsCol, transactionDoc);

    // 3. Save recurring expense data if applicable
    if (recurring) {
      const recurringCol = getRecurringExpensesCollection(userId);
      await addDoc(recurringCol, {
        ...transactionDoc,
        recurring: true,
      });
    }

    // 4. Save insights
    if (insights && insights.length > 0) {
        const insightsCol = getInsightsCollection(userId);
        for (const insight of insights) {
            await addDoc(insightsCol, {
                message: insight,
                date: Timestamp.now(),
            });
        }
    }

    // 5. Save alerts
    if (alerts && alerts.length > 0) {
        const alertsCol = getAlertsCollection(userId);
        for (const alert of alerts) {
            await addDoc(alertsCol, {
                message: alert,
                date: Timestamp.now(),
                read: false,
            });
        }
    }
    
    return `Transaction: ${transaction.description} for $${transaction.amount} has been added under ${category}.`;

  } catch (error) {
    console.error('Error in Firebase Integration Agent workflow:', error);
    throw new Error('Failed to process and save transaction.');
  }
}
