'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { TransactionList } from '@/components/transactions/transaction-list';
import { MonthlyExpensesChart } from '@/components/charts/monthly-expenses-chart';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { BudgetChart } from '@/components/charts/budget-chart';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { BudgetManager } from '@/components/budget/budget-manager';
import { Transaction, Budget } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import { Plus, List, PieChart, Target, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'budget'>('overview');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance-transactions');
    const savedBudgets = localStorage.getItem('finance-budgets');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance-budgets', JSON.stringify(budgets));
  }, [budgets]);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setIsAddDialogOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction | Omit<Transaction, 'id'>) => {
    if ('id' in transaction) {
      setTransactions(prev => 
        prev.map(t => t.id === transaction.id ? transaction : t)
      );
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleUpdateBudget = (budget: Budget) => {
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === budget.categoryId && b.month === budget.month);
      if (existing) {
        return prev.map(b => b.id === existing.id ? budget : b);
      } else {
        return [...prev, budget];
      }
    });
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'budget', label: 'Budget', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader />
        
        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards transactions={transactions} />
        </div>

        {/* Main Navigation */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex bg-white rounded-lg p-1 shadow-sm border">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm onSubmit={handleAddTransaction} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {activeView === 'overview' && (
            <>
              {/* Charts Grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                <MonthlyExpensesChart transactions={transactions} />
                <CategoryPieChart transactions={transactions} />
              </div>
              
              {/* Budget Overview */}
              <BudgetChart transactions={transactions} budgets={budgets} />
            </>
          )}

          {activeView === 'transactions' && (
            <TransactionList 
              transactions={transactions}
              onEdit={openEditDialog}
              onDelete={handleDeleteTransaction}
            />
          )}

          {activeView === 'budget' && (
            <BudgetManager 
              budgets={budgets}
              transactions={transactions}
              onUpdateBudget={handleUpdateBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}
        </div>

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            {editingTransaction && (
              <TransactionForm 
                transaction={editingTransaction}
                onSubmit={handleEditTransaction}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}