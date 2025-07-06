import { TrendingUp, Wallet } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl shadow-lg">
          <Wallet className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personal Finance</h1>
          <p className="text-gray-600 text-lg">Track your money, reach your goals</p>
        </div>
      </div>
    </div>
  );
}