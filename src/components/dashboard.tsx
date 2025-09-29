'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { SummaryCards } from '@/components/summary-cards';
import { TransactionsTable } from '@/components/transactions-table';
import { SpendingAnalysis } from '@/components/spending-analysis';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { mockTransactions, mockBudgets } from '@/lib/data';
import type { Transaction } from '@/lib/types';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false);

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <div className="flex flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 sm:px-6 sm:py-6">
        <SummaryCards transactions={transactions} />
        <div className="space-y-4">
          <TransactionsTable
            transactions={transactions}
            onAddTransaction={() => setAddTransactionOpen(true)}
          />
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
