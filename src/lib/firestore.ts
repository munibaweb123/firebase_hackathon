
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
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Budget, Transaction, TransactionData } from './types';
import { incomeCategories } from './data';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';


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

export const getPaymentsCollection = (userId: string) =>
    collection(getUsersCollection(), `${userId}/payments`);


/**
 * A streamlined function to add a transaction from a tool call.
 * It now expects already categorized data.
 * @param userId - The ID of the user.
 * @param transactionData - The categorized transaction data from the AI.
 */
export async function addTransaction(
  userId: string,
  transactionData: { description: string, amount: number, category: string }
): Promise<{ success: boolean; message: string; }> {
  if (!userId) {
     return {
        success: false,
        message: "I'm sorry, I wasn't able to add this transaction. User ID is required to add a transaction.",
      };
  }
  try {
    const categorizeTransactionFlow = httpsCallable(functions, 'categorizeTransactionFlowFn');

    const { data: categorized } = await categorizeTransactionFlow({ text: `${transactionData.description} ${transactionData.amount}` });

    const type = incomeCategories.includes((categorized as any).category) ? 'income' : 'expense';

    // 2. Save to Firestore
    const transactionsCol = getTransactionsCollection(userId);
    await addDoc(transactionsCol, {
      description: (categorized as any).description,
      amount: (categorized as any).amount,
      category: (categorized as any).category,
      type: type,
      date: Timestamp.now(),
    });
     return {
        success: true,
        message: `Transaction "${(categorized as any).description}" was added successfully.`,
      };
  } catch (error) {
    console.error('Error adding transaction via tool:', error);
    return {
        success: false,
        message: "There was an error adding the transaction. Please try again.",
      };
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
 * Updates an existing transaction.
 * @param userId - The ID of the user.
 * @param transactionId - The ID of the transaction to update.
 * @param transactionData - The new data for the transaction.
 */
export async function updateTransaction(
  userId: string,
  transactionId: string,
  transactionData: TransactionData
): Promise<void> {
  try {
    const transactionRef = doc(getTransactionsCollection(userId), transactionId);
    const type = incomeCategories.includes(transactionData.category) ? 'income' : 'expense';
    await updateDoc(transactionRef, {
        ...transactionData,
        type: type,
        date: Timestamp.fromDate(new Date(transactionData.date)),
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction.');
  }
}

/**
 * Deletes a transaction.
 * @param userId - The ID of the user.
 * @param transactionId - The ID of the transaction to delete.
 */
export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  try {
    const transactionRef = doc(getTransactionsCollection(userId), transactionId);
    await deleteDoc(transactionRef);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction.');
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

/**
 * Logs a payment transaction to Firestore.
 * @param paymentData - The payment data to log.
 */
export async function logPayment(paymentData: {
  uid: string;
  amount: number;
  currency: string;
  riskScore: number;
  status: 'ok' | 'flagged' | 'error';
  error?: string;
}): Promise<void> {
  try {
    const paymentsCol = getPaymentsCollection(paymentData.uid);
    await addDoc(paymentsCol, {
      ...paymentData,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging payment to Firestore:', error);
    // Don't throw here to avoid crashing the parent flow
  }
}
