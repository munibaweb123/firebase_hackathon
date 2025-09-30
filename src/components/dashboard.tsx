'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { SummaryCards } from '@/components/summary-cards';
import { TransactionsTable } from '@/components/transactions-table';
import { SpendingAnalysis } from '@/components/spending-analysis';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { mockBudgets } from '@/lib/data';
import type { Transaction, TransactionData } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { getTransactions, addTransaction } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);

  useEffect(() => {
    async function fetchTransactions() {
      if (user) {
        setLoading(true);
        try {
          const userTransactions = await getTransactions(user.uid);
          setTransactions(userTransactions);
        } catch (error) {
          console.error('Failed to fetch transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchTransactions();
  }, [user]);

  const handleAddTransaction = async (newTransactionData: TransactionData) => {
    if (user) {
      try {
        await addTransaction(user.uid, newTransactionData);
        // Refetch transactions to show the new one
        const userTransactions = await getTransactions(user.uid);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Failed to add transaction:', error);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 sm:px-6 sm:py-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : (
          <SummaryCards transactions={transactions} />
        )}
        <div className="space-y-4">
          {loading ? (
            <Skeleton className="h-96" />
          ) : (
            <TransactionsTable
              transactions={transactions}
              onAddTransaction={() => setAddTransactionOpen(true)}
            />
          )}
          <SpendingAnalysis transactions={transactions} budgets={mockBudgets} />
        </div>
      </main>
      <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        onTransactionAdd={handleAddTransaction}
      />
    </div>
  );
}
