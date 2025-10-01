
import {
  collection,
  doc,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  query,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Budget, Transaction, TransactionData } from './types';
import { processTransaction } from '@/ai/flows/transaction-manager-flow';
import { mockBudgets } from './data';

// Collection References
export const getUsersCollection = () => collection(db, 'users');

export const getTransactionsCollection = (userId: string) =>
  collection(getUsersCollection(), `${userId}/transactions`);

export const getBudgetsCollection = (userId: string) =>
  collection(getUsersCollection(), `${userId}/budgets`);

export const getGoalsCollection = (userId: string) =>
  collection(getUsersCollection(), `${userId}/goals`);

export const getAlertsCollection = (userId: string) =>
  collection(getUsersCollection(), `${userId}/alerts`);

export const getRecurringExpensesCollection = (userId: string) =>
    collection(getUsersCollection(), `${userId}/recurring_expenses`);

export const getInsightsCollection = (userId: string) =>
    collection(getUsersCollection(), `${userId}/insights`);


/**
 * Processes a raw transaction input (either from text or structured data),
 * runs it through the AI agent workflow, and saves the results to Firestore.
 * This function embodies the "Firebase Integration Agent" persona.
 * @param userId - The ID of the user.
 * @param input - Can be a raw text string or structured transaction data.
 */
export async function processAndSaveTransaction(
  userId: string,
  input: string | TransactionData
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to process a transaction.');
  }

  try {
    const pastTransactions = await getTransactions(userId);
    const budgets: Budget[] = mockBudgets; 

    // 1. Get structured data from the AI Manager Agent
    const rawInputText = typeof input === 'string' ? input : `${input.description} ${input.amount}`;
    const agentResult = await processTransaction({
      rawInput: rawInputText,
      pastTransactions: pastTransactions.map(t => ({...t, date: new Date(t.date)})),
      budgets: budgets,
    });

    const { transaction, category, recurring, insights, alerts } = agentResult;

    // 2. Save categorized transaction
    const transactionsCol = getTransactionsCollection(userId);
    const transactionDoc = {
      description: transaction.description,
      amount: transaction.amount,
      category: category,
      type: category === 'Salary' || category === 'Freelance' || category === 'Investment' ? 'income' : 'expense',
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
    
    // This part would handle FCM/Email, but is out of scope for now.
    // if (alerts && alerts.length > 0) {
    //   console.log("Forwarding alerts to notification service...");
    // }

  } catch (error) {
    console.error('Error in Firebase Integration Agent workflow:', error);
    throw new Error('Failed to process and save transaction.');
  }
}



/**
 * Example function to add a transaction for a specific user.
 * @param userId - The ID of the user.
 * @param transactionData - The data for the new transaction.
 */
export async function addTransaction(
  userId: string,
  transactionData: TransactionData
): Promise<void> {
  try {
    const transactionsCol = getTransactionsCollection(userId);
    await addDoc(transactionsCol, {
      ...transactionData,
      date: Timestamp.fromDate(transactionData.date),
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw new Error('Failed to add transaction.');
  }
}

/**
 * Sets up a real-time listener for a user's transactions.
 * @param userId - The ID of the user.
 * @param onTransactionsUpdate - Callback function to be called with the updated transactions.
 * @returns A function to unsubscribe from the listener.
 */
export function onTransactionsUpdate(
  userId: string,
  onTransactionsUpdate: (transactions: Transaction[]) => void
): Unsubscribe {
  try {
    const transactionsCol = getTransactionsCollection(userId);
    const q = query(transactionsCol, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactions: Transaction[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            description: data.description,
            amount: data.amount,
            type: data.type,
            category: data.category,
            date: (data.date as Timestamp).toDate(),
          };
        });
        onTransactionsUpdate(transactions);
      },
      (error) => {
        // Gracefully handle missing Firestore index or other query errors
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          console.warn(
            `A Firestore index is required for this query. 
            Please create the index in your Firebase console. 
            The error message should contain a direct link to create it. 
            Falling back to an empty list for now.`,
            error
          );
        } else {
          console.error('Error getting transactions in real-time:', error);
        }
        // Provide an empty array to the callback to prevent crashes
        onTransactionsUpdate([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up transaction listener:', error);
    onTransactionsUpdate([]); // Call with empty array on initial setup error
    return () => {}; // Return a no-op unsubscribe function
  }
}


/**
 * Example function to read all transactions for a specific user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of transactions.
 */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const transactionsCol = getTransactionsCollection(userId);
    const q = query(transactionsCol, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const transactions: Transaction[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: (data.date as Timestamp).toDate(),
      };
    });

    return transactions;
  } catch (error: any) {
    // Gracefully handle missing Firestore index or other query errors
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.warn(
        `A Firestore index is required for this query. 
        Please create the index in your Firebase console. 
        The error message should contain a direct link to create it. 
        Falling back to an empty list for now.`,
        error
        );
    } else {
      console.error('Error getting transactions:', error);
    }
    // Return empty array to prevent app from crashing
    return [];
  }
}
