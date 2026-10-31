'use client';

import React, { useState } from 'react';
import { formatINR } from '@/lib/utils';
import { PieChart, AlertTriangle, CheckCircle2, TrendingUp, Edit2, Check, X } from 'lucide-react';

interface CategoryBudgetItem {
  categoryId: string;
  categoryName: string;
  categoryNameHindi?: string | null;
  allocated: number;
  spent: number;
}

export default function BudgetManager({
  initialAllocations,
  festivalYear,
}: {
  initialAllocations: CategoryBudgetItem[];
  festivalYear: number;
}) {
  const [items, setItems] = useState<CategoryBudgetItem[]>(initialAllocations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const totalAllocated = items.reduce((sum, i) => sum + i.allocated, 0);
  const totalSpent = items.reduce((sum, i) => sum + i.spent, 0);
  const remainingBudget = totalAllocated - totalSpent;
  const overallPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const handleEdit = (catId: string, currentVal: number) => {
    setEditingId(catId);
    setEditValue(currentVal);
  };

  const handleSave = async (catId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: catId,
          allocatedAmount: editValue,
          festivalYear,
        }),
      });

      if (!res.ok) throw new Error('बजट अपडेट विफल रहा');

      setItems(items.map((i) => (i.categoryId === catId ? { ...i, allocated: editValue } : i)));
      setEditingId(null);
      setFeedback('बजट आवंटन सफलतापूर्वक सहेज लिया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-900/40 pb-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
          Budget Allocation & Control
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
          वार्षिक बजट एवं व्यय नियंत्रण ({festivalYear})
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          प्रत्येक मद के लिए निर्धारित बजट, वास्तविक खर्च, अवशेष बजट एवं अति-व्यय (Over-budget) चेतावनी
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल आवंटित बजट (Allocated)</span>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-1">
            {formatINR(totalAllocated)}
          </div>
          <span className="text-[10px] text-stone-400">समिति द्वारा स्वीकृत</span>
        </div>

        <div className="bg-black/50 border border-red-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल वास्तविक व्यय (Actual Spent)</span>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">
            {formatINR(totalSpent)}
          </div>
          <span className="text-[10px] text-stone-400">वर्तमान में स्वीकृत बिल</span>
        </div>

        <div className="bg-black/50 border border-emerald-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">अवशेष बजट (Remaining)</span>
          <div
            className={`text-2xl font-extrabold font-mono mt-1 ${
              remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-500'
            }`}
          >
            {formatINR(remainingBudget)}
          </div>
          <span className="text-[10px] text-stone-400">
            {remainingBudget < 0 ? 'चेतावनी: बजट सीमा पार!' : 'उपलब्ध आवंटन'}
          </span>
        </div>

        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">बजट उपयोगिता (Utilization %)</span>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-1">
            {overallPercentage}%
          </div>
          <div className="w-full bg-stone-800 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                overallPercentage > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORY-WISE BUDGET TABLE */}
      <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">मद / श्रेणी (Expense Category)</th>
                <th className="py-3.5 px-4 text-right">आवंटित बजट (Allocated)</th>
                <th className="py-3.5 px-4 text-right">वास्तविक व्यय (Spent)</th>
                <th className="py-3.5 px-4 text-right">शेष बजट (Remaining)</th>
                <th className="py-3.5 px-4 text-center">उपयोगिता ग्राफ (%)</th>
                <th className="py-3.5 px-4 text-center">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {items.map((item) => {
                const rem = item.allocated - item.spent;
                const util = item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0;
                const isOverBudget = item.spent > item.allocated && item.allocated > 0;
                const isEditing = editingId === item.categoryId;

                return (
                  <tr
                    key={item.categoryId}
                    className={`hover:bg-amber-500/5 transition-colors ${
                      isOverBudget ? 'bg-red-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-stone-100">
                      {item.categoryNameHindi || item.categoryName}
                      {isOverBudget && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-red-600/30 text-red-400 px-2 py-0.5 rounded-full border border-red-500/40">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Over Budget</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className="w-24 bg-black border border-amber-500 rounded px-2 py-1 text-right text-amber-300 font-mono text-xs focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="text-amber-300">{formatINR(item.allocated)}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-red-400">
                      {formatINR(item.spent)}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold ${
                        rem >= 0 ? 'text-emerald-400' : 'text-red-500'
                      }`}
                    >
                      {formatINR(rem)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="w-28 mx-auto space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-stone-400">
                          <span>{util}%</span>
                        </div>
                        <div className="w-full bg-stone-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                            }`}
                            style={{ width: `${Math.min(util, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSave(item.categoryId)}
                            disabled={loading}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(item.categoryId, item.allocated)}
                          className="p-1.5 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
                          title="बजट संशोधित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

