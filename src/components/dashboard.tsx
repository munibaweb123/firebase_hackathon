
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
import { processAndSaveTransaction, onTransactionsUpdate } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = onTransactionsUpdate(user.uid, (userTransactions) => {
        setTransactions(userTransactions);
        setLoading(false);
      });

      // Cleanup subscription on component unmount
      return () => unsubscribe();
    }
  }, [user]);

  const handleAddTransaction = async (transactionInput: string | TransactionData) => {
    if (user) {
      try {
        // processAndSaveTransaction will trigger the AI agent workflow and save to Firestore.
        // The real-time listener (onTransactionsUpdate) will then automatically update the UI.
        await processAndSaveTransaction(user.uid, transactionInput);
         toast({
          title: 'Success!',
          description: 'Your transaction has been processed and added.',
        });
      } catch (error) {
        console.error('Failed to process and add transaction:', error);
        toast({
          variant: 'destructive',
          title: 'Processing Error',
          description: 'Failed to process the transaction.',
        });
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
