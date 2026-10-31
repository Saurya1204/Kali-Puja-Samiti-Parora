'use client';

import React, { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Users,
  Clock,
  Printer,
} from 'lucide-react';

interface RegistrationItem {
  id: string;
  registrationNumber: string;
  applicantName: string;
  guardianName?: string | null;
  phone: string;
  email?: string | null;
  village?: string | null;
  registrationType: string;
  detailsJson?: string | null;
  status: string;
  adminRemarks?: string | null;
  createdAt: string;
  event: {
    title: string;
    titleHindi?: string | null;
  };
}

export default function RegistrationManager({
  initialRegistrations,
  festivalYear,
}: {
  initialRegistrations: RegistrationItem[];
  festivalYear: number;
}) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(initialRegistrations);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      r.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      (r.village && r.village.toLowerCase().includes(search.toLowerCase()));

    const matchesType = !typeFilter || r.registrationType === typeFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const updateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/registrations/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          adminRemarks: `Status updated to ${newStatus} by Admin`,
        }),
      });

      if (!res.ok) throw new Error('स्टेटस अपडेट विफल');

      setRegistrations(
        registrations.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((r) => ({
      'पंजीकरण क्रमांक (Reg No)': r.registrationNumber,
      'आवेदक का नाम (Name)': r.applicantName,
      'मोबाइल (Phone)': r.phone,
      'गांव (Village)': r.village || '',
      'पंजीकरण श्रेणी (Type)': r.registrationType,
      'संबंधित कार्यक्रम (Event)': r.event.titleHindi || r.event.title,
      'पंजीकरण दिनांक (Date)': formatDate(r.createdAt),
      'स्थिति (Status)': r.status,
      'समिति टिप्पणी (Remarks)': r.adminRemarks || '',
    }));

    exportToExcel(exportData, `Kali_Puja_Parora_Registrations_${festivalYear}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Participation & Volunteer Applications
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            ऑनलाइन पंजीकरण प्रबंधन (Registrations)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            कबड्डी टीमों, व्यक्तिगत प्रतियोगिताओं, सांस्कृतिक कार्यक्रमों एवं स्वयंसेवकों के आवेदनों की जांच व स्वीकृति
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <span>प्रिंट सूची</span>
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-black/40 border border-amber-900/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="आवेदक का नाम, पंजीकरण क्रमांक अथवा फोन खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-maroon-950 border border-amber-800/50 rounded-xl pl-9 pr-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-maroon-950 border border-amber-800/50 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
        >
          <option value="">सभी श्रेणियां (All Types)</option>
          <option value="INDIVIDUAL">व्यक्तिगत प्रतियोगिता</option>
          <option value="TEAM">कबड्डी टीम (TEAM)</option>
          <option value="CULTURAL">सांस्कृतिक प्रस्तुति</option>
          <option value="VOLUNTEER">स्वयंसेवक (VOLUNTEER)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-maroon-950 border border-amber-800/50 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
        >
          <option value="">सभी स्थिति (All Status)</option>
          <option value="PENDING">लंबित (PENDING)</option>
          <option value="APPROVED">स्वीकृत (APPROVED)</option>
          <option value="REJECTED">अस्वीकृत (REJECTED)</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">पंजीकरण # व दिनांक</th>
                <th className="py-3.5 px-4">आवेदक / कप्तान विवरण</th>
                <th className="py-3.5 px-4">प्रकार (Type)</th>
                <th className="py-3.5 px-4">संबंधित कार्यक्रम</th>
                <th className="py-3.5 px-4 text-center">वर्तमान स्थिति</th>
                <th className="py-3.5 px-4 text-center no-print">स्वीकृति / अस्वीकृति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-amber-500/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-amber-300 block">{r.registrationNumber}</span>
                    <span className="text-[10px] text-stone-400">{formatDate(r.createdAt)}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-100">{r.applicantName}</div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {r.phone} {r.village ? ` • ${r.village}` : ''}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {r.registrationType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-stone-200">
                    {r.event.titleHindi || r.event.title}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : r.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center no-print">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => updateStatus(r.id, 'APPROVED')}
                        disabled={loadingId === r.id || r.status === 'APPROVED'}
                        className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-800 disabled:opacity-40 cursor-pointer"
                        title="स्वीकृत करें"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, 'REJECTED')}
                        disabled={loadingId === r.id || r.status === 'REJECTED'}
                        className="p-1.5 rounded-lg bg-red-950 border border-red-500/40 text-red-400 hover:bg-red-800 disabled:opacity-40 cursor-pointer"
                        title="अस्वीकृत करें"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
