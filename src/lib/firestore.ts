
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
import { categorizeTransaction } from '@/ai/flows/categorize-transaction-flow';
import { incomeCategories } from './data';

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
 * A streamlined function to add a transaction from a tool call.
 * It categorizes the text and saves it directly.
 * @param userId - The ID of the user.
 * @param transactionText - The natural language description of the transaction.
 */
export async function addTransaction(
  userId: string,
  transactionText: string
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to add a transaction.');
  }
  try {
    // 1. Categorize transaction
    const categorized = await categorizeTransaction({ text: transactionText });

    // 2. Determine type
    const type = incomeCategories.includes(categorized.category) ? 'income' : 'expense';

    // 3. Save to Firestore
    const transactionsCol = getTransactionsCollection(userId);
    await addDoc(transactionsCol, {
      description: categorized.description,
      amount: categorized.amount,
      category: categorized.category,
      type: type,
      date: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding transaction via tool:', error);
    throw new Error('Failed to add transaction.');
  }
}

/**
 * Adds a transaction from a manual form submission.
 * @param userId - The ID of the user.
 * @param transactionData - The data for the new transaction.
 */
export async function addManualTransaction(
  userId: string,
  transactionData: TransactionData
): Promise<void> {
  try {
    const transactionsCol = getTransactionsCollection(userId);
    const type = incomeCategories.includes(transactionData.category) ? 'income' : 'expense';
    await addDoc(transactionsCol, {
      ...transactionData,
      type: type,
      date: Timestamp.fromDate(new Date(transactionData.date)),
    });
  } catch (error) {
    console.error('Error adding manual transaction:', error);
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
