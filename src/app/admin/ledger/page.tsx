import React from 'react';
import prisma from '@/lib/prisma';
import { formatINR, formatDate } from '@/lib/utils';
import {
  BookOpen,
  Wallet,
  Building,
  TrendingUp,
  TrendingDown,
  Printer,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLedgerPage({
  searchParams,
}: {
  searchParams?: { festivalYear?: string };
}) {
  const reqYear = searchParams?.festivalYear ? parseInt(searchParams.festivalYear) : undefined;

  let festivalYear = reqYear
    ? await prisma.festivalYear.findUnique({ where: { year: reqYear } })
    : await prisma.festivalYear.findFirst({ where: { isActive: true } });

  if (!festivalYear) {
    festivalYear = await prisma.festivalYear.findFirst({ orderBy: { year: 'desc' } });
  }

  const yearId = festivalYear?.id;

  // Fetch Opening Balance
  const openingTxn = await prisma.financialTransaction.findFirst({
    where: { festivalYearId: yearId, referenceType: 'OPENING_BALANCE' },
  });
  const openingBalance = openingTxn?.amount || 0;

  // Fetch all Donations & Income
  const donations = await prisma.donation.findMany({
    where: { festivalYearId: yearId, status: 'CONFIRMED' },
    orderBy: { donationDate: 'asc' },
  });
  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

  // Cash vs Bank Income
  const cashIncome = donations
    .filter((d) => d.paymentMethod === 'CASH')
    .reduce((sum, d) => sum + d.amount, 0);

  const bankIncome = donations
    .filter((d) => d.paymentMethod !== 'CASH')
    .reduce((sum, d) => sum + d.amount, 0);

  // Fetch all Approved Expenses
  const expenses = await prisma.expense.findMany({
    where: { festivalYearId: yearId, approvalStatus: 'APPROVED' },
    include: { category: true, vendor: true },
    orderBy: { billDate: 'asc' },
  });
  const totalExpensesBilled = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesPaid = expenses.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalOutstanding = expenses.reduce((sum, e) => sum + e.outstandingAmount, 0);

  // Cash vs Bank Paid Expenses
  const cashExpenses = expenses
    .filter((e) => e.paymentMethod === 'CASH')
    .reduce((sum, e) => sum + e.paidAmount, 0);

  const bankExpenses = expenses
    .filter((e) => e.paymentMethod !== 'CASH')
    .reduce((sum, e) => sum + e.paidAmount, 0);

  // Closing Balances
  // Opening Balance + Total Income - Total Expenses = Closing Balance
  const totalIncome = openingBalance + totalDonations;
  const closingBalance = totalIncome - totalExpensesPaid;

  const cashBalance = cashIncome - cashExpenses;
  const bankBalance = openingBalance + bankIncome - bankExpenses;

  // Chronological unified ledger entries
  const allTransactions = [
    ...(openingTxn
      ? [
          {
            id: 'open-1',
            date: openingTxn.transactionDate,
            type: 'INCOME',
            desc: openingTxn.description,
            method: openingTxn.paymentMethod,
            amount: openingTxn.amount,
          },
        ]
      : []),
    ...donations.map((d) => ({
      id: d.id,
      date: d.donationDate,
      type: 'INCOME',
      desc: `दान प्राप्ति: ${d.donorName} (${d.receiptNumber}) - ${d.purpose || 'दान'}`,
      method: d.paymentMethod,
      amount: d.amount,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      date: e.billDate,
      type: 'EXPENSE',
      desc: `व्यय भुगतान: ${e.title} (${e.category?.nameHindi || e.category?.name || 'सामान्य व्यय'})${
        e.vendor?.name ? ` - ${e.vendor.name}` : ''
      }`,
      method: e.paymentMethod,
      amount: e.paidAmount,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Running balance calculation
  let running = 0;
  const ledgerRows = allTransactions.map((tx) => {
    if (tx.type === 'INCOME') running += tx.amount;
    else running -= tx.amount;
    return { ...tx, balance: running };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Official Balance Sheet & Audit Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            केंद्रीय वित्तीय लेजर एवं तुलन पत्र (Ledger & Balance Sheet)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            सूत्र: प्रारंभिक शेष + कुल आय - कुल व्यय = अवशेष शेष | महोत्सव वर्ष {festivalYear?.year || 2026}
          </p>
        </div>

        <button
          onClick={() => {}}
          className="bg-black/60 hover:bg-black/80 border border-amber-700/50 text-stone-300 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer no-print"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>प्रिंट लेजर / डाउनलोड</span>
        </button>
      </div>

      {/* BALANCE SHEET SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Opening Balance */}
        <div className="bg-black/50 border border-stone-700/50 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">प्रारंभिक शेष (Opening Balance)</span>
          <div className="text-2xl font-extrabold text-stone-200 font-mono mt-1">
            {formatINR(openingBalance)}
          </div>
          <span className="text-[10px] text-stone-500">गत वर्ष से अंतरित</span>
        </div>

        {/* Total Income */}
        <div className="bg-black/50 border border-emerald-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-emerald-400 block">कुल प्राप्त आय (+ Income)</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {formatINR(totalDonations)}
          </div>
          <span className="text-[10px] text-stone-400">समस्त दान व प्रायोजन</span>
        </div>

        {/* Total Paid Expenses */}
        <div className="bg-black/50 border border-red-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-red-400 block">कुल भुगतान व्यय (- Expenses)</span>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">
            {formatINR(totalExpensesPaid)}
          </div>
          <span className="text-[10px] text-stone-400">वेंडर व समिति खर्च</span>
        </div>

        {/* Closing Net Balance */}
        <div className="bg-gradient-to-br from-amber-950/70 via-black to-maroon-950 border border-amber-500 rounded-2xl p-5 shadow-glow-gold">
          <span className="text-xs text-amber-400 font-bold block uppercase tracking-wider">
            अंतिम अवशेष शेष (= Closing Balance)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono mt-1">
            {formatINR(closingBalance)}
          </div>
          <div className="flex justify-between text-[10px] text-stone-300 mt-1 pt-1 border-t border-amber-900/50">
            <span>बैंक शेष: {formatINR(bankBalance)}</span>
            <span>नकद शेष: {formatINR(cashBalance)}</span>
          </div>
        </div>
      </div>

      {/* DUAL LEDGER ACCOUNTS: CASH VS BANK/UPI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Ledger */}
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 space-y-3 shadow">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
            <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>नकद खाता लेजर (Cash Ledger)</span>
            </h3>
            <span className="font-mono font-bold text-xs text-amber-300">
              अवशेष: {formatINR(cashBalance)}
            </span>
          </div>
          <div className="text-xs space-y-1.5 text-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-400">कुल नकद प्राप्ति (Cash Inflow):</span>
              <span className="font-mono text-emerald-400 font-bold">{formatINR(cashIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">कुल नकद व्यय (Cash Outflow):</span>
              <span className="font-mono text-red-400 font-bold">{formatINR(cashExpenses)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-800">
              <span className="text-stone-300 font-semibold">हाथ में नकद शेष (Cash in Hand):</span>
              <span className="font-mono text-amber-300 font-extrabold">{formatINR(cashBalance)}</span>
            </div>
          </div>
        </div>

        {/* Bank & UPI Ledger */}
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 space-y-3 shadow">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
            <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              <span>बैंक एवं UPI खाता लेजर (Bank/UPI Ledger)</span>
            </h3>
            <span className="font-mono font-bold text-xs text-amber-300">
              अवशेष: {formatINR(bankBalance)}
            </span>
          </div>
          <div className="text-xs space-y-1.5 text-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-400">प्रारंभिक बैंक बैलेंस:</span>
              <span className="font-mono text-stone-300 font-bold">{formatINR(openingBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">कुल डिजिटल आय (Digital Inflow):</span>
              <span className="font-mono text-emerald-400 font-bold">{formatINR(bankIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">बैंक / NEFT व्यय (Digital Outflow):</span>
              <span className="font-mono text-red-400 font-bold">{formatINR(bankExpenses)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-800">
              <span className="text-stone-300 font-semibold">SBI बैंक खाता शेष (Bank Balance):</span>
              <span className="font-mono text-amber-300 font-extrabold">{formatINR(bankBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHRONOLOGICAL AUDIT LEDGER TABLE */}
      <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-amber-900/40 flex items-center justify-between">
          <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>क्रमानुसार वित्तीय जर्नल प्रविष्टियां (General Ledger Audit Trail)</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">
            कुल प्रविष्टियां: {ledgerRows.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">दिनांक (Date)</th>
                <th className="py-3 px-4">विवरण (Description)</th>
                <th className="py-3 px-4 text-center">माध्यम (Mode)</th>
                <th className="py-3 px-4 text-right">जमा राशि / Credit (+)</th>
                <th className="py-3 px-4 text-right">निकासी / Debit (-)</th>
                <th className="py-3 px-4 text-right">क्रमिक शेष (Running Balance)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300 font-mono">
              {ledgerRows.map((tx) => (
                <tr key={tx.id} className="hover:bg-amber-500/5 transition-colors">
                  <td className="py-3 px-4 text-stone-400">{formatDate(tx.date)}</td>
                  <td className="py-3 px-4 font-sans text-stone-200">{tx.desc}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300">
                      {tx.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    {tx.type === 'INCOME' ? formatINR(tx.amount) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-red-400">
                    {tx.type === 'EXPENSE' ? formatINR(tx.amount) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-300">
                    {formatINR(tx.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

