import {
  collection,
  doc,
  addDoc,
  getDocs,
  Timestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction, TransactionData } from './types';

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
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to get transactions.');
  }
}
