'use client';

import React, { useState } from 'react';
import { formatINR, formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';
import {
  PlusCircle,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  FileText,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameHindi?: string | null;
}

interface Vendor {
  id: string;
  name: string;
  businessName?: string | null;
  phone: string;
}

interface ExpenseItem {
  id: string;
  title: string;
  categoryId: string;
  vendorId?: string | null;
  eventId?: string | null;
  billNumber?: string | null;
  billDate: string;
  paymentDate?: string | null;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  approvalStatus: string;
  description?: string | null;
  billFileUrl?: string | null;
  category: Category;
  vendor?: Vendor | null;
}

export default function ExpenseManager({
  initialExpenses,
  categories,
  vendors,
  festivalYear,
}: {
  initialExpenses: ExpenseItem[];
  categories: Category[];
  vendors: Vendor[];
  festivalYear: number;
}) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    categoryId: categories[0]?.id || '',
    vendorId: '',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paidAmount: 0,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    description: '',
    billFileUrl: '',
    approvalStatus: 'APPROVED',
  });

  // Calculate totals
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = expenses.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalOutstanding = expenses.reduce((sum, e) => sum + e.outstandingAmount, 0);

  // Filtered expenses
  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.billNumber && e.billNumber.toLowerCase().includes(search.toLowerCase())) ||
      (e.vendor && e.vendor.name.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = !selectedCategory || e.categoryId === selectedCategory;
    const matchesStatus = !selectedStatus || e.paymentStatus === selectedStatus;
    const matchesVendor = !selectedVendor || e.vendorId === selectedVendor;

    return matchesSearch && matchesCat && matchesStatus && matchesVendor;
  });

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      categoryId: categories[0]?.id || '',
      vendorId: '',
      billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
      billDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 5000,
      paidAmount: 5000,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      description: '',
      billFileUrl: '',
      approvalStatus: 'APPROVED',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title,
      categoryId: exp.categoryId,
      vendorId: exp.vendorId || '',
      billNumber: exp.billNumber || '',
      billDate: new Date(exp.billDate).toISOString().split('T')[0],
      paymentDate: exp.paymentDate ? new Date(exp.paymentDate).toISOString().split('T')[0] : '',
      amount: exp.amount,
      paidAmount: exp.paidAmount,
      paymentMethod: exp.paymentMethod,
      paymentStatus: exp.paymentStatus,
      description: exp.description || '',
      billFileUrl: exp.billFileUrl || '',
      approvalStatus: exp.approvalStatus,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const payload = {
        ...formData,
        ...(editingExpense ? { id: editingExpense.id } : {}),
      };

      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहेजने में त्रुटि');

      // Refresh list
      const updatedExpenses = editingExpense
        ? expenses.map((item) => (item.id === data.expense.id ? { ...item, ...data.expense } : item))
        : [data.expense, ...expenses];

      setExpenses(updatedExpenses);
      setIsModalOpen(false);
      setFeedback({ type: 'success', message: 'व्यय एवं बिल विवरण सफलतापूर्वक अद्यतन किया गया।' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`क्या आप वाकई "${title}" व्यय रिकॉर्ड को हटाना चाहते हैं?`)) return;

    try {
      const res = await fetch(`/api/admin/expenses?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('डिलीट करने में त्रुटि');

      setExpenses(expenses.filter((e) => e.id !== id));
      setFeedback({ type: 'success', message: `व्यय रिकॉर्ड सफलतापूर्वक हटा दिया गया।` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((e) => ({
      'शीर्षक (Title)': e.title,
      'मद / श्रेणी (Category)': e.category.nameHindi || e.category.name,
      'वेंडर (Vendor)': e.vendor?.name || 'N/A',
      'बिल क्रमांक (Bill No)': e.billNumber || 'N/A',
      'बिल दिनांक (Bill Date)': formatDate(e.billDate),
      'कुल राशि (Amount)': e.amount,
      'भुगतान राशि (Paid)': e.paidAmount,
      'बकाया राशि (Outstanding)': e.outstandingAmount,
      'माध्यम (Payment Method)': e.paymentMethod,
      'भुगतान स्थिति (Status)': e.paymentStatus,
      'स्वीकृति (Approval)': e.approvalStatus,
      'विवरण (Notes)': e.description || '',
    }));

    exportToExcel(exportData, `Kali_Puja_Parora_Expenses_${festivalYear}`);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Financial Expenditure & Bill Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            व्यय एवं बिल प्रबंधन (Expenses & Bills)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            सभी 19 श्रेणियों के वाउचर, बिल नंबर, वेंडर भुगतान व बकाया राशि का संपूर्ण रिकॉर्ड
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-maroon-950" />
            <span>नया व्यय / बिल जोड़ें</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel एक्सपोर्ट</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-black/60 hover:bg-black/80 border border-amber-700/50 text-stone-300 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>प्रिंट रिपोर्ट</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
              : 'bg-red-950/80 border border-red-500 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल व्यय राशि (Total Incurred)</span>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-1">
            {formatINR(totalAmount)}
          </div>
          <span className="text-[10px] text-stone-400">कुल बिल: {expenses.length}</span>
        </div>

        <div className="bg-black/50 border border-emerald-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल भुगतान राशि (Total Paid)</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {formatINR(totalPaid)}
          </div>
          <span className="text-[10px] text-emerald-400/80">नकद, बैंक एवं UPI द्वारा</span>
        </div>

        <div className="bg-black/50 border border-red-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल बकाया राशि (Outstanding Dues)</span>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">
            {formatINR(totalOutstanding)}
          </div>
          <span className="text-[10px] text-red-400/80">वेंडरों को देय शेष राशि</span>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-black/40 border border-amber-900/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="व्यय शीर्षक, बिल नंबर अथवा वेंडर खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-maroon-950 border border-amber-800/50 rounded-xl pl-9 pr-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-maroon-950 border border-amber-800/50 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
        >
          <option value="">सभी श्रेणियां (All 19 Categories)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameHindi || c.name}
            </option>
          ))}
        </select>

        {/* Vendor filter */}
        <select
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="bg-maroon-950 border border-amber-800/50 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
        >
          <option value="">सभी वेंडर (All Vendors)</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* Payment status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-maroon-950 border border-amber-800/50 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
        >
          <option value="">सभी भुगतान स्थिति</option>
          <option value="PAID">पूर्ण भुगतान (PAID)</option>
          <option value="PARTIAL">आंशिक भुगतान (PARTIAL)</option>
          <option value="UNPAID">अदत्त (UNPAID)</option>
        </select>
      </div>

      {/* EXPENSE TABLE */}
      <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">दिनांक व बिल #</th>
                <th className="py-3.5 px-4">व्यय शीर्षक व श्रेणी</th>
                <th className="py-3.5 px-4">वेंडर / आपूर्तिकर्ता</th>
                <th className="py-3.5 px-4 text-right">कुल राशि</th>
                <th className="py-3.5 px-4 text-right">भुगतान राशि</th>
                <th className="py-3.5 px-4 text-right">बकाया राशि</th>
                <th className="py-3.5 px-4 text-center">माध्यम व स्थिति</th>
                <th className="py-3.5 px-4 text-center no-print">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500">
                    कोई व्यय रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-200">{formatDate(exp.billDate)}</div>
                      <span className="text-[10px] text-amber-400/90 font-mono">
                        #{exp.billNumber || 'N/A'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-100">{exp.title}</div>
                      <span className="text-[11px] text-stone-400">
                        {exp.category.nameHindi || exp.category.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {exp.vendor ? (
                        <div>
                          <div className="font-semibold text-stone-200">{exp.vendor.name}</div>
                          <span className="text-[10px] text-stone-400">{exp.vendor.phone}</span>
                        </div>
                      ) : (
                        <span className="text-stone-500 italic">प्रत्यक्ष खरीद (Direct)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-100">
                      {formatINR(exp.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatINR(exp.paidAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-red-400">
                      {formatINR(exp.outstandingAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          exp.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : exp.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {exp.paymentStatus}
                      </span>
                      <span className="block text-[10px] text-stone-400 mt-0.5 font-mono">
                        {exp.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
                          title="संशोधित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="p-1.5 rounded-lg bg-black/40 hover:bg-red-500/20 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="डिलीट करें"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-maroon-950 via-[#150404] to-black border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-5">
              <h3 className="text-xl font-bold text-amber-300 font-serif">
                {editingExpense ? 'व्यय रिकॉर्ड संशोधित करें' : 'नया व्यय एवं बिल दर्ज करें'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-amber-200">व्यय शीर्षक (Expense Title) *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. वॉटरप्रूफ पंडाल किराया व वीआईपी कुर्सियां"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">व्यय श्रेणी (Category) *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-none"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameHindi || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendor */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">वेंडर / आपूर्तिकर्ता (Vendor)</label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-none"
                  >
                    <option value="">-- प्रत्यक्ष खरीद / कोई वेंडर नहीं --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.businessName || 'वेंडर'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bill / Invoice # */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">बिल / इनवॉइस नंबर</label>
                  <input
                    type="text"
                    placeholder="उदा. MDT-2026/102"
                    value={formData.billNumber}
                    onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 font-mono focus:outline-none"
                  />
                </div>

                {/* Bill Date */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">बिल दिनांक *</label>
                  <input
                    type="date"
                    required
                    value={formData.billDate}
                    onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 font-mono focus:outline-none"
                  />
                </div>

                {/* Total Amount */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">कुल बिल राशि (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 font-mono font-bold focus:outline-none"
                  />
                </div>

                {/* Paid Amount */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">भुगतान की गई राशि (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={formData.amount}
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 font-mono font-bold focus:outline-none text-emerald-400"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">भुगतान माध्यम *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-none"
                  >
                    <option value="CASH">नकद (Cash)</option>
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                    <option value="CHEQUE">चेक (Cheque)</option>
                    <option value="OTHER">अन्य</option>
                  </select>
                </div>

                {/* Approval status */}
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">स्वीकृति स्थिति *</label>
                  <select
                    value={formData.approvalStatus}
                    onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value })}
                    className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-none"
                  >
                    <option value="APPROVED">स्वीकृत (APPROVED)</option>
                    <option value="PENDING">सत्यापन हेतु लंबित (PENDING)</option>
                    <option value="REJECTED">अस्वीकृत (REJECTED)</option>
                  </select>
                </div>
              </div>

              {/* Outstanding calculation preview */}
              <div className="p-3 bg-black/60 border border-amber-900/60 rounded-xl flex items-center justify-between text-xs">
                <span className="text-stone-400">स्वतः परिकलित बकाया राशि:</span>
                <span className="font-mono font-bold text-red-400 text-sm">
                  {formatINR(Math.max(0, formData.amount - formData.paidAmount))}
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-amber-200">व्यय विवरण / टिप्पणी</label>
                <textarea
                  rows={2}
                  placeholder="व्यय से संबंधित विवरण अथवा वाउचर टिप्पणी..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              {/* Bill photo / attachment URL */}
              <div className="space-y-1">
                <label className="font-semibold text-amber-200">
                  बिल फोटो / स्कैन वाउचर URL (Cloudinary / Drive)
                </label>
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/... या https://drive.google.com/..."
                  value={formData.billFileUrl}
                  onChange={(e) => setFormData({ ...formData, billFileUrl: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3.5 py-2 text-stone-100 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-amber-900/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-6 py-2 font-bold cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'सहेजा जा रहा है...' : 'व्यय रिकॉर्ड सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

