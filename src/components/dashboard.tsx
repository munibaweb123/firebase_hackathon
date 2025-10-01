
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { SummaryCards } from '@/components/summary-cards';
import { TransactionsTable } from '@/components/transactions-table';
import { SpendingAnalysis } from '@/components/spending-analysis';
import { TransactionDialog } from '@/components/transaction-dialog';
import { mockBudgets } from '@/lib/data';
import type { Transaction, TransactionData } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { onTransactionsUpdate, addManualTransaction, updateTransaction, deleteTransaction } from '@/lib/firestore';
import { processAndSaveTransaction } from '@/lib/agent-workflow';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { VoiceAgent } from './voice-agent';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for dialogs
  const [isTransactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | undefined>(undefined);

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

  const handleOpenAddDialog = () => {
    setTransactionToEdit(undefined);
    setTransactionDialogOpen(true);
  };

  const handleOpenEditDialog = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setTransactionDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleTransactionSubmit = async (transactionInput: string | TransactionData) => {
    if (!user) return;
  
    try {
      if (typeof transactionInput === 'string') {
        // Voice Agent Input
        const resultMessage = await processAndSaveTransaction(user.uid, transactionInput);
        toast({ title: 'Success!', description: resultMessage });
      } else {
        // Manual Dialog Input
        if (transactionToEdit) {
          // Update
          await updateTransaction(user.uid, transactionToEdit.id, transactionInput);
          toast({ title: 'Success!', description: 'Transaction updated successfully.' });
        } else {
          // Create
          await addManualTransaction(user.uid, transactionInput);
          toast({ title: 'Success!', description: 'Transaction added successfully.' });
        }
      }
    } catch (error) {
      console.error('Failed to process transaction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save the transaction.',
      });
    } finally {
        setTransactionDialogOpen(false);
        setTransactionToEdit(undefined);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user || !transactionToDelete) return;

    try {
      await deleteTransaction(user.uid, transactionToDelete.id);
      toast({
        title: 'Success!',
        description: `Transaction "${transactionToDelete.description}" deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete transaction.',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(undefined);
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
                  onAddTransaction={handleOpenAddDialog}
                  onEditTransaction={handleOpenEditDialog}
                  onDeleteTransaction={handleOpenDeleteDialog}
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
      <TransactionDialog
        key={transactionToEdit?.id ?? 'new'}
        open={isTransactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        onTransactionSubmit={handleTransactionSubmit}
        transaction={transactionToEdit}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              for "{transactionToDelete?.description}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
