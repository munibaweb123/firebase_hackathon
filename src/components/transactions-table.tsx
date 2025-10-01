'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';
import { ArrowUpDown, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionsTableProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
}

type SortKey = keyof Transaction;

export function TransactionsTable({
  transactions,
  onAddTransaction,
}: TransactionsTableProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>('date');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
    'desc'
  );

  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [transactions, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const SortableHeader = ({
    sortKey: key,
    children,
  }: {
    sortKey: SortKey;
    children: React.ReactNode;
  }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(key)}
        className="px-0 hover:bg-transparent"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            A list of your recent income and expenses.
          </CardDescription>
        </div>
        <Button onClick={onAddTransaction}>
          <Plus className="mr-2 h-4 w-4" />
          Add Manually
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader sortKey="date">Date</SortableHeader>
              <TableHead>Description</TableHead>
              <SortableHeader sortKey="category">Category</SortableHeader>
              <TableHead>Type</TableHead>
              <SortableHeader sortKey="amount">Amount</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="font-medium">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.type === 'income' ? 'secondary' : 'destructive'
                    }
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`font-semibold ${
                    transaction.type === 'income'
                      ? 'text-green-500 dark:text-green-400'
                      : 'text-destructive'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
