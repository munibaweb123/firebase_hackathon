import type { Transaction, Budget } from '@/lib/types';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2024-07-15'),
    description: 'Monthly Salary',
    category: 'Salary',
    amount: 5000,
    type: 'income',
  },
  {
    id: '2',
    date: new Date('2024-07-16'),
    description: 'Grocery Shopping',
    category: 'Food',
    amount: 150.75,
    type: 'expense',
  },
  {
    id: '3',
    date: new Date('2024-07-17'),
    description: 'Gasoline',
    category: 'Transport',
    amount: 60.0,
    type: 'expense',
  },
  {
    id: '4',
    date: new Date('2024-07-18'),
    description: 'Dinner with friends',
    category: 'Food',
    amount: 85.5,
    type: 'expense',
  },
  {
    id: '5',
    date: new Date('2024-07-20'),
    description: 'Freelance Project',
    category: 'Freelance',
    amount: 750,
    type: 'income',
  },
  {
    id: '6',
    date: new Date('2024-07-22'),
    description: 'Movie tickets',
    category: 'Entertainment',
    amount: 30.0,
    type: 'expense',
  },
  {
    id: '7',
    date: new Date('2024-07-25'),
    description: 'Monthly Rent',
    category: 'Housing',
    amount: 1200,
    type: 'expense',
  },
    {
    id: '8',
    date: new Date('2024-07-01'),
    description: 'Internet Bill',
    category: 'Utilities',
    amount: 80,
    type: 'expense',
  },
  {
    id: '9',
    date: new Date('2024-07-05'),
    description: 'Gym Membership',
    category: 'Health',
    amount: 50,
    type: 'expense',
  },
];

export const mockBudgets: Budget[] = [
  { category: 'Food', limit: 400 },
  { category: 'Transport', limit: 150 },
  { category: 'Entertainment', limit: 100 },
  { category: 'Housing', limit: 1200 },
  { category: 'Utilities', limit: 150 },
  { category: 'Health', limit: 100 },
  { category: 'Other', limit: 200 },
];

export const categories = [
  'Food',
  'Transport',
  'Entertainment',
  'Housing',
  'Utilities',
  'Health',
  'Salary',
  'Freelance',
  'Other',
];
