'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Budget } from '@/types/transaction';
import { getCategoryById } from '@/lib/categories';
import { format } from 'date-fns';

interface BudgetChartProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function BudgetChart({ transactions, budgets }: BudgetChartProps) {
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
  
  const budgetData = currentMonthBudgets.map(budget => {
    const category = getCategoryById(budget.categoryId);
    const spent = transactions
      .filter(t => 
        t.category === budget.categoryId && 
        t.type === 'expense' &&
        format(new Date(t.date), 'yyyy-MM') === currentMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      category: category?.name || 'Unknown',
      budget: budget.amount,
      spent,
      remaining: Math.max(0, budget.amount - spent),
      color: category?.color || '#6B7280',
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">Budget: ₹{data.budget.toLocaleString('en-IN')}</p>
          <p className="text-red-600">Spent: ₹{data.spent.toLocaleString('en-IN')}</p>
          <p className="text-green-600">Remaining: ₹{data.remaining.toLocaleString('en-IN')}</p>
          <p className="text-gray-600">
            Usage: {((data.spent / data.budget) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (budgetData.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Budget vs Actual</CardTitle>
          <p className="text-sm text-gray-600">Track your spending against budgets</p>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <div className="text-center">
            <p className="text-gray-500">No budgets set for this month</p>
            <p className="text-sm text-gray-400 mt-1">Go to the Budget tab to set up your budgets</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Budget vs Actual</CardTitle>
        <p className="text-sm text-gray-600">Track your spending against budgets for {format(new Date(), 'MMMM yyyy')}</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="budget" 
                fill="#e5e7eb" 
                radius={[4, 4, 0, 0]}
                name="Budget"
              />
              <Bar 
                dataKey="spent" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                name="Spent"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}