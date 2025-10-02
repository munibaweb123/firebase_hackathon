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
  