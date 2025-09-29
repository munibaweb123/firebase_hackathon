export type Transaction = {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
};

export type Budget = {
  category: string;
  limit: number;
};

export type SpendingAnalysisData = {
  income: number;
  expenses: { category: string; amount: number }[];
  budgetLimits: Budget[];
};
