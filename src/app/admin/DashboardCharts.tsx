'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatINR } from '@/lib/utils';

const COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

interface ChartsProps {
  categoryData: { name: string; amount: number }[];
  incomeVsExpense: { name: string; income: number; expense: number }[];
  budgetData: { category: string; allocated: number; spent: number }[];
}

export default function DashboardCharts({
  categoryData,
  incomeVsExpense,
  budgetData,
}: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Category-wise Expense Breakdown */}
      <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 space-y-4 shadow-xl">
        <h4 className="font-bold text-amber-300 text-sm flex items-center justify-between">
          <span>मदवार व्यय विवरण (Category-wise Expenses)</span>
          <span className="text-xs text-stone-400 font-normal">शीर्ष व्यय श्रेणियां</span>
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" tickFormatter={(val) => `₹${val / 1000}k`} stroke="#78716c" fontSize={11} />
              <YAxis dataKey="name" type="category" width={110} stroke="#a8a29e" fontSize={10} tickLine={false} />
              <Tooltip
                formatter={(value: any) => [formatINR(Number(value)), 'व्यय']}
                contentStyle={{ backgroundColor: '#1c1917', borderColor: '#d97706', borderRadius: '10px' }}
              />
              <Bar dataKey="amount" fill="#f59e0b" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Income vs Expense Comparison */}
      <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 space-y-4 shadow-xl">
        <h4 className="font-bold text-amber-300 text-sm flex items-center justify-between">
          <span>आय बनाम व्यय तुलना (Income vs Expense)</span>
          <span className="text-xs text-stone-400 font-normal">वित्तीय संतुलन</span>
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeVsExpense} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} />
              <YAxis tickFormatter={(val) => `₹${val / 1000}k`} stroke="#78716c" fontSize={11} />
              <Tooltip
                formatter={(value: any) => [formatINR(Number(value)), 'राशि']}
                contentStyle={{ backgroundColor: '#1c1917', borderColor: '#d97706', borderRadius: '10px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="income" name="कुल प्राप्ति (Income)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="कुल व्यय (Expense)" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

