'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Transaction, Budget } from '@/types/transaction';
import { getCategoriesByType, getCategoryById } from '@/lib/categories';
import { Plus, Trash2, Target, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import * as LucideIcons from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetManager({ budgets, transactions, onUpdateBudget, onDeleteBudget }: BudgetManagerProps) {
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const expenseCategories = getCategoriesByType('expense');
  const currentMonthBudgets = budgets.filter(b => b.month === selectedMonth);

  const handleAddBudget = () => {
    if (!selectedCategory || !budgetAmount || Number(budgetAmount) <= 0) return;

    const newBudget: Budget = {
      id: Date.now().toString(),
      categoryId: selectedCategory,
      amount: Number(budgetAmount),
      month: selectedMonth,
      spent: 0,
    };

    onUpdateBudget(newBudget);
    setSelectedCategory('');
    setBudgetAmount('');
    setIsAddingBudget(false);
  };

  const getBudgetProgress = (budget: Budget) => {
    const spent = transactions
      .filter(t => 
        t.category === budget.categoryId && 
        t.type === 'expense' &&
        format(new Date(t.date), 'yyyy-MM') === budget.month
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      spent,
      percentage: (spent / budget.amount) * 100,
      remaining: Math.max(0, budget.amount - spent),
      isOverBudget: spent > budget.amount,
    };
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = -2; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy');
      options.push({ value, label });
    }
    
    return options;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Manager</h2>
          <p className="text-gray-600">Set and track your monthly spending limits</p>
        </div>
        
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {generateMonthOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add Budget Section */}
      {isAddingBudget ? (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Set New Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories
                      .filter(cat => !currentMonthBudgets.some(b => b.categoryId === cat.id))
                      .map(category => {
                        const IconComponent = (LucideIcons as any)[category.icon];
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                              {IconComponent && <IconComponent className="h-4 w-4" />}
                              {category.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Monthly Budget (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                />
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={handleAddBudget} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Budget
                </Button>
                <Button variant="outline" onClick={() => setIsAddingBudget(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsAddingBudget(true)}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Set New Budget
        </Button>
      )}

      {/* Budget List */}
      <div className="grid gap-4">
        {currentMonthBudgets.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
              <p className="text-gray-600 text-center">
                Set your first budget for {format(new Date(selectedMonth), 'MMMM yyyy')} to start tracking your spending
              </p>
            </CardContent>
          </Card>
        ) : (
          currentMonthBudgets.map(budget => {
            const category = getCategoryById(budget.categoryId);
            const progress = getBudgetProgress(budget);
            const IconComponent = category ? (LucideIcons as any)[category.icon] : null;

            return (
              <Card key={budget.id} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: category?.color + '20' }}
                      >
                        {IconComponent ? (
                          <IconComponent 
                            className="h-5 w-5" 
                            style={{ color: category?.color }}
                          />
                        ) : (
                          <Target className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {category?.name || 'Unknown Category'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ₹{progress.spent.toLocaleString('en-IN')} spent of ₹{budget.amount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {progress.isOverBudget && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Over Budget
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteBudget(budget.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Progress 
                      value={Math.min(progress.percentage, 100)} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        ₹{progress.remaining.toLocaleString('en-IN')} remaining
                      </span>
                      <span className={progress.isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {progress.percentage.toFixed(1)}% used
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}