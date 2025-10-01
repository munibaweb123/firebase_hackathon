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
    category: 'Food & Dining',
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
    category: 'Food & Dining',
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
    category: 'Rent & Housing',
    amount: 1200,
    type: 'expense',
  },
    {
    id: '8',
    date: new Date('2024-07-01'),
    description: 'Internet Bill',
    category: 'Bills & Utilities',
    amount: 80,
    type: 'expense',
  },
  {
    id: '9',
    date: new Date('2024-07-05'),
    description: 'Gym Membership',
    category: 'Health & Fitness',
    amount: 50,
    type: 'expense',
  },
];

export const mockBudgets: Budget[] = [
  { category: 'Food & Dining', limit: 400 },
  { category: 'Transport', limit: 150 },
  { category: 'Entertainment', limit: 100 },
  { category: 'Rent & Housing', limit: 1200 },
  { category: 'Bills & Utilities', limit: 150 },
  { category: 'Health & Fitness', limit: 100 },
  { category: 'Other', limit: 200 },
];

export const expenseCategories = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Rent & Housing',
  'Health & Fitness',
  'Other',
];

export const incomeCategories = [
  'Salary',
  'Freelance',
  'Investment',
  'Other',
];

export const allCategories = [...new Set([...expenseCategories, ...incomeCategories])];
