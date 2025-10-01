
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
import { onTransactionsUpdate, addTransaction as addManualTransaction } from '@/lib/firestore';
import { processAndSaveTransaction } from '@/lib/agent-workflow';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { VoiceAgent } from './voice-agent';

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
        let resultMessage = '';
        if (typeof transactionInput === 'string') {
          // Use the full agent workflow for natural language input
          resultMessage = await processAndSaveTransaction(user.uid, transactionInput);
        } else {
          // Use the simpler manual add for form data
          await addManualTransaction(user.uid, transactionInput);
          resultMessage = `Transaction "${transactionInput.description}" added successfully.`;
        }
         toast({
          title: 'Success!',
          description: resultMessage,
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
             <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TransactionsTable
                  transactions={transactions}
                  onAddTransaction={() => setAddTransactionOpen(true)}
                />
              </div>
              <div>
                <VoiceAgent
                  userId={user?.uid}
                  pastTransactions={transactions}
                  budgets={mockBudgets}
                />
              </div>
            </div>
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
