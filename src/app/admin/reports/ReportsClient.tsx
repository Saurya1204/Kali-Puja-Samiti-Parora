'use client';

import React, { useState } from 'react';
import { formatINR, formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Wallet,
  TrendingDown,
  TrendingUp,
  Store,
  GraduationCap,
  Trophy,
  ClipboardList,
} from 'lucide-react';

interface ReportData {
  festivalYear: number;
  totalIncome: number;
  totalExpenses: number;
  totalPaid: number;
  totalDue: number;
  closingBalance: number;
  categoryExpenses: { name: string; amount: number; count: number }[];
  vendorBalances: { name: string; category: string; billed: number; paid: number; due: number }[];
  donations: { receiptNumber: string; donorName: string; amount: number; method: string; date: string }[];
  achievers: { name: string; category: string; marks: string; prize: string }[];
  registrations: { regNo: string; name: string; type: string; status: string; event: string }[];
}

export default function ReportsClient({ data }: { data: ReportData }) {
  const [activeTab, setActiveTab] = useState<
    'FINANCIAL_SUMMARY' | 'CATEGORY_EXPENSE' | 'VENDOR_DUES' | 'DONATIONS' | 'ACHIEVERS' | 'REGISTRATIONS'
  >('FINANCIAL_SUMMARY');

  const handleExportCurrent = () => {
    if (activeTab === 'CATEGORY_EXPENSE') {
      const rows = data.categoryExpenses.map((c) => ({
        'मद / श्रेणी (Category)': c.name,
        'व्यय राशि (Amount)': c.amount,
        'बिल संख्या (Bills Count)': c.count,
      }));
      exportToExcel(rows, `Category_Expense_Report_${data.festivalYear}`);
    } else if (activeTab === 'VENDOR_DUES') {
      const rows = data.vendorBalances.map((v) => ({
        'वेंडर का नाम (Vendor)': v.name,
        'सेवा श्रेणी (Category)': v.category,
        'कुल बिल (Total Billed)': v.billed,
        'भुगतान राशि (Total Paid)': v.paid,
        'बकाया देयता (Outstanding Due)': v.due,
      }));
      exportToExcel(rows, `Vendor_Dues_Report_${data.festivalYear}`);
    } else if (activeTab === 'DONATIONS') {
      const rows = data.donations.map((d) => ({
        'रसीद क्रमांक (Receipt #)': d.receiptNumber,
        'दानदाता (Donor Name)': d.donorName,
        'सहयोग राशि (Amount)': d.amount,
        'माध्यम (Payment Method)': d.method,
        'दिनांक (Date)': formatDate(d.date),
      }));
      exportToExcel(rows, `Donations_Report_${data.festivalYear}`);
    } else if (activeTab === 'ACHIEVERS') {
      const rows = data.achievers.map((a) => ({
        'विद्यार्थी (Student)': a.name,
        'श्रेणी (Category)': a.category,
        'उपलब्धि / अंक (Marks/Rank)': a.marks,
        'आवंटित पुरस्कार (Prize)': a.prize,
      }));
      exportToExcel(rows, `Awardees_Report_${data.festivalYear}`);
    } else if (activeTab === 'REGISTRATIONS') {
      const rows = data.registrations.map((r) => ({
        'पंजीकरण क्रमांक (Reg #)': r.regNo,
        'आवेदक (Name)': r.name,
        'प्रकार (Type)': r.type,
        'कार्यक्रम (Event)': r.event,
        'स्थिति (Status)': r.status,
      }));
      exportToExcel(rows, `Registrations_Report_${data.festivalYear}`);
    } else {
      const rows = [
        { 'वित्तीय विवरण (Metric)': 'कुल प्राप्त आय (Total Income)', 'राशि (INR)': data.totalIncome },
        { 'वित्तीय विवरण (Metric)': 'कुल स्वीकृत व्यय (Total Expenses)', 'राशि (INR)': data.totalExpenses },
        { 'वित्तीय विवरण (Metric)': 'कुल भुगतान व्यय (Paid Expenses)', 'राशि (INR)': data.totalPaid },
        { 'वित्तीय विवरण (Metric)': 'कुल वेंडर बकाया देयता (Outstanding Dues)', 'राशि (INR)': data.totalDue },
        { 'वित्तीय विवरण (Metric)': 'अंतिम अवशेष शुद्ध बचत (Closing Balance)', 'राशि (INR)': data.closingBalance },
      ];
      exportToExcel(rows, `Annual_Financial_Summary_${data.festivalYear}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Annual Audited Financial Statements
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            वार्षिक लेखा रिपोर्ट एवं विवरण (Official Reports)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            काली पूजा समिति परोरा - वित्तीय वर्ष {data.festivalYear} की प्रमाणित रिपोर्ट
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCurrent}
            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>वर्तमान रिपोर्ट Excel में डाउनलोड</span>
          </button>

          <button
            onClick={() => window.print()}
            className="bg-black/60 hover:bg-black/80 border border-amber-700/50 text-stone-300 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>प्रिंट / PDF सेव करें</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-amber-900/40 pb-3 no-print">
        {[
          { key: 'FINANCIAL_SUMMARY', label: 'वार्षिक वित्तीय सारांश' },
          { key: 'CATEGORY_EXPENSE', label: 'मदवार व्यय विवरण' },
          { key: 'VENDOR_DUES', label: 'वेंडर बकाया भुगतान' },
          { key: 'DONATIONS', label: 'दान एवं प्राप्ति सूची' },
          { key: 'ACHIEVERS', label: 'मेधावी छात्र पुरस्कार' },
          { key: 'REGISTRATIONS', label: 'प्रतियोगिता पंजीकरण' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-amber-500 text-maroon-950 shadow font-extrabold'
                : 'bg-black/40 text-stone-300 hover:bg-maroon-900 border border-amber-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FINANCIAL SUMMARY */}
      {activeTab === 'FINANCIAL_SUMMARY' && (
        <div className="space-y-6 printable-area">
          <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="text-center border-b border-amber-900/50 pb-4">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                Annual Financial Statement
              </span>
              <h2 className="text-2xl font-extrabold text-amber-200 font-serif">
                श्री श्री 108 काली पूजा समिति परोरा (पूर्णिया, बिहार)
              </h2>
              <span className="text-xs text-stone-400">
                महोत्सव सत्र: {data.festivalYear} | तुलन पत्र एवं आय-व्यय विवरण
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-maroon-950/60 p-4 rounded-xl space-y-2 border border-emerald-500/30">
                <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>कुल प्राप्तियां (Total Income)</span>
                </h4>
                <div className="text-2xl font-extrabold text-emerald-300 font-mono">
                  {formatINR(data.totalIncome)}
                </div>
                <p className="text-[11px] text-stone-400">प्रारंभिक शेष, व्यक्तिगत दान, चंदा एवं प्रायोजन</p>
              </div>

              <div className="bg-maroon-950/60 p-4 rounded-xl space-y-2 border border-red-500/30">
                <h4 className="font-bold text-red-400 text-sm flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  <span>कुल स्वीकृत व्यय (Total Expenditure)</span>
                </h4>
                <div className="text-2xl font-extrabold text-red-400 font-mono">
                  {formatINR(data.totalExpenses)}
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>भुगतान: {formatINR(data.totalPaid)}</span>
                  <span className="text-amber-400">वेंडर बकाया: {formatINR(data.totalDue)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-950/60 via-black to-maroon-950/60 border border-amber-500/50 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                  अवशेष शुद्ध संचित शेष (Net Closing Balance)
                </span>
                <span className="text-xs text-stone-400">बैंक खाता एवं नकद शेष का योग</span>
              </div>
              <div className="text-3xl font-extrabold text-amber-300 font-mono">
                {formatINR(data.closingBalance)}
              </div>
            </div>

            <div className="pt-6 border-t border-amber-900/50 flex items-end justify-between text-xs text-stone-400">
              <div>
                <p>प्रमाणित किया जाता है कि उपरोक्त विवरण समिति के वास्तविक लेजर से लिया गया है।</p>
              </div>
              <div className="text-center">
                <div className="font-serif italic text-amber-400 mb-1">Manoj Sharma</div>
                <div className="border-t border-stone-600 pt-0.5 text-[10px] uppercase">
                  हस्ताक्षर कोषाध्यक्ष
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY-WISE EXPENSE */}
      {activeTab === 'CATEGORY_EXPENSE' && (
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">मद / श्रेणी (Category)</th>
                <th className="py-3 px-4 text-center">बिल संख्या (Bills)</th>
                <th className="py-3 px-4 text-right">कुल खर्च राशि (Total Amount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {data.categoryExpenses.map((c, idx) => (
                <tr key={idx} className="hover:bg-amber-500/5">
                  <td className="py-3 px-4 font-bold text-stone-100">{c.name}</td>
                  <td className="py-3 px-4 text-center font-mono">{c.count}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-300">
                    {formatINR(c.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: VENDOR DUES */}
      {activeTab === 'VENDOR_DUES' && (
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3 px-4">वेंडर का नाम (Vendor)</th>
                <th className="py-3 px-4">सेवा श्रेणी</th>
                <th className="py-3 px-4 text-right">कुल बिल (Billed)</th>
                <th className="py-3 px-4 text-right">भुगतान राशि (Paid)</th>
                <th className="py-3 px-4 text-right font-bold text-red-400">बकाया देयता (Due)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300 font-mono">
              {data.vendorBalances.map((v, idx) => (
                <tr key={idx} className="hover:bg-amber-500/5">
                  <td className="py-3 px-4 font-sans font-bold text-stone-100">{v.name}</td>
                  <td className="py-3 px-4 font-sans text-stone-300">{v.category}</td>
                  <td className="py-3 px-4 text-right font-bold text-stone-200">{formatINR(v.billed)}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatINR(v.paid)}</td>
                  <td className="py-3 px-4 text-right font-bold text-red-400">{formatINR(v.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: DONATIONS */}
      {activeTab === 'DONATIONS' && (
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3 px-4">रसीद # व दिनांक</th>
                <th className="py-3 px-4">दानदाता का नाम</th>
                <th className="py-3 px-4 text-center">माध्यम</th>
                <th className="py-3 px-4 text-right">सहयोग राशि</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {data.donations.map((d, idx) => (
                <tr key={idx} className="hover:bg-amber-500/5">
                  <td className="py-3 px-4 font-mono text-amber-400">
                    {d.receiptNumber} ({formatDate(d.date)})
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-100">{d.donorName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {d.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                    {formatINR(d.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: ACHIEVERS */}
      {activeTab === 'ACHIEVERS' && (
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3 px-4">विद्यार्थी का नाम</th>
                <th className="py-3 px-4">उपलब्धि श्रेणी</th>
                <th className="py-3 px-4">अंक / रैंक</th>
                <th className="py-3 px-4">आवंटित पुरस्कार</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {data.achievers.map((a, idx) => (
                <tr key={idx} className="hover:bg-amber-500/5">
                  <td className="py-3 px-4 font-bold text-stone-100">{a.name}</td>
                  <td className="py-3 px-4 text-amber-300">{a.category}</td>
                  <td className="py-3 px-4 font-mono">{a.marks}</td>
                  <td className="py-3 px-4 font-semibold text-amber-200">{a.prize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: REGISTRATIONS */}
      {activeTab === 'REGISTRATIONS' && (
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3 px-4">पंजीकरण #</th>
                <th className="py-3 px-4">आवेदक का नाम</th>
                <th className="py-3 px-4">प्रकार</th>
                <th className="py-3 px-4">कार्यक्रम</th>
                <th className="py-3 px-4 text-center">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {data.registrations.map((r, idx) => (
                <tr key={idx} className="hover:bg-amber-500/5">
                  <td className="py-3 px-4 font-mono text-amber-400 font-bold">{r.regNo}</td>
                  <td className="py-3 px-4 font-bold text-stone-100">{r.name}</td>
                  <td className="py-3 px-4 text-stone-300">{r.type}</td>
                  <td className="py-3 px-4 text-stone-300">{r.event}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-400">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

