import { Category } from '@/types/transaction';

export const defaultCategories: Category[] = [
  // Expense Categories
  { id: 'food', name: 'Food & Dining', color: '#EF4444', type: 'expense', icon: 'UtensilsCrossed' },
  { id: 'transport', name: 'Transportation', color: '#F97316', type: 'expense', icon: 'Car' },
  { id: 'shopping', name: 'Shopping', color: '#EAB308', type: 'expense', icon: 'ShoppingBag' },
  { id: 'entertainment', name: 'Entertainment', color: '#8B5CF6', type: 'expense', icon: 'Gamepad2' },
  { id: 'bills', name: 'Bills & Utilities', color: '#06B6D4', type: 'expense', icon: 'Receipt' },
  { id: 'healthcare', name: 'Healthcare', color: '#10B981', type: 'expense', icon: 'Heart' },
  { id: 'education', name: 'Education', color: '#3B82F6', type: 'expense', icon: 'GraduationCap' },
  { id: 'other-expense', name: 'Other Expenses', color: '#6B7280', type: 'expense', icon: 'MoreHorizontal' },
  
  // Income Categories
  { id: 'salary', name: 'Salary', color: '#10B981', type: 'income', icon: 'Briefcase' },
  { id: 'freelance', name: 'Freelance', color: '#059669', type: 'income', icon: 'Laptop' },
  { id: 'investment', name: 'Investment', color: '#0D9488', type: 'income', icon: 'TrendingUp' },
  { id: 'other-income', name: 'Other Income', color: '#047857', type: 'income', icon: 'Plus' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return defaultCategories.find(cat => cat.id === id);
};

export const getCategoriesByType = (type: 'income' | 'expense'): Category[] => {
  return defaultCategories.filter(cat => cat.type === type);
};