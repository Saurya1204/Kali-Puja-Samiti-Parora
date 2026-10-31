'use client';

import React, { useState } from 'react';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Store,
  PlusCircle,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Trash2,
} from 'lucide-react';

interface VendorItem {
  id: string;
  name: string;
  businessName?: string | null;
  phone: string;
  altPhone?: string | null;
  address?: string | null;
  serviceCategory: string;
  upiId?: string | null;
  bankAccountNumber?: string | null;
  ifscCode?: string | null;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  notes?: string | null;
  expenses?: any[];
}

export default function VendorManager({
  initialVendors,
}: {
  initialVendors: VendorItem[];
}) {
  const [vendors, setVendors] = useState<VendorItem[]>(initialVendors);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedVendorForBills, setSelectedVendorForBills] = useState<VendorItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    altPhone: '',
    address: '',
    serviceCategory: 'Tent, Stage & Pandal',
    upiId: '',
    bankAccountNumber: '',
    ifscCode: '',
    notes: '',
  });

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.businessName && v.businessName.toLowerCase().includes(search.toLowerCase())) ||
      v.serviceCategory.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = vendors.reduce((sum, v) => sum + v.outstandingBalance, 0);

  const openAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      businessName: '',
      phone: '',
      altPhone: '',
      address: 'Purnea, Bihar',
      serviceCategory: 'Tent, Stage & Pandal',
      upiId: '',
      bankAccountNumber: '',
      ifscCode: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (v: VendorItem) => {
    setEditingVendor(v);
    setFormData({
      name: v.name,
      businessName: v.businessName || '',
      phone: v.phone,
      altPhone: v.altPhone || '',
      address: v.address || '',
      serviceCategory: v.serviceCategory,
      upiId: v.upiId || '',
      bankAccountNumber: v.bankAccountNumber || '',
      ifscCode: v.ifscCode || '',
      notes: v.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...(editingVendor ? { id: editingVendor.id } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहेजने में विफल');

      const updated = editingVendor
        ? vendors.map((item) => (item.id === data.vendor.id ? { ...item, ...data.vendor } : item))
        : [data.vendor, ...vendors];

      setVendors(updated);
      setIsModalOpen(false);
      setFeedback('वेंडर विवरण सफलतापूर्वक अद्यतन किया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Vendor Directory & Ledger History
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            वेंडर एवं आपूर्तिकर्ता डायरेक्टरी (Vendors)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            पंडाल, लाइट, साउंड, कैटरिंग, खेल सामग्री व फ्लेक्स प्रिटिंग वेंडरों का खाता, भुगतान एवं बकाया
          </p>
        </div>

        <button
          onClick={openAdd}
          className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-maroon-950" />
          <span>नया वेंडर पंजीकृत करें</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल पंजीकृत वेंडर (Registered)</span>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-1">
            {vendors.length}
          </div>
        </div>

        <div className="bg-black/50 border border-emerald-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल भुगतान किया गया (Total Paid)</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {formatINR(vendors.reduce((s, v) => s + v.totalPaid, 0))}
          </div>
        </div>

        <div className="bg-black/50 border border-red-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल वेंडर बकाया देयता (Total Due)</span>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">
            {formatINR(totalOutstanding)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-black/40 border border-amber-900/40 rounded-2xl p-3">
        <input
          type="text"
          placeholder="वेंडर का नाम, फर्म का नाम अथवा सेवा श्रेणी खोजें..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-maroon-950 border border-amber-800/50 rounded-xl px-4 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="festive-card p-5 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {v.serviceCategory}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(v)}
                    className="text-stone-400 hover:text-amber-300 p-1"
                    title="संशोधित करें"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`क्या आप वेंडर "${v.name}" को हटाना चाहते हैं?`)) return;
                      try {
                        const res = await fetch(`/api/admin/vendors?id=${v.id}`, { method: 'DELETE' });
                        if (!res.ok) throw new Error('हटाने में विफल');
                        setVendors(vendors.filter((item) => item.id !== v.id));
                        setFeedback('वेंडर रिकॉर्ड सफलतापूर्वक हटा दिया गया।');
                        setTimeout(() => setFeedback(null), 3000);
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                    className="text-stone-400 hover:text-red-400 p-1"
                    title="वेंडर हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-stone-100 text-base">{v.name}</h3>
                {v.businessName && (
                  <p className="text-xs text-amber-300/80 font-medium">{v.businessName}</p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-stone-300 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <a href={`tel:${v.phone}`} className="hover:text-amber-300 font-mono">
                    {v.phone}
                  </a>
                </div>
                {v.address && (
                  <div className="flex items-center gap-2 text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{v.address}</span>
                  </div>
                )}
                {v.upiId && (
                  <div className="flex items-center gap-2 text-stone-400">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-mono">{v.upiId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Status Box */}
            <div className="pt-3 border-t border-amber-900/40 bg-black/40 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">कुल बिल (Billed):</span>
                <span className="font-mono font-bold text-stone-200">{formatINR(v.totalBilled)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">भुगतान (Paid):</span>
                <span className="font-mono font-bold text-emerald-400">{formatINR(v.totalPaid)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-stone-800">
                <span className="text-stone-300 font-semibold">बकाया देयता (Due):</span>
                <span className="font-mono font-bold text-red-400">{formatINR(v.outstandingBalance)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD/EDIT VENDOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
              <h3 className="text-xl font-bold text-amber-300 font-serif">
                {editingVendor ? 'वेंडर विवरण संशोधित करें' : 'नया वेंडर पंजीकृत करें'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-amber-200">वेंडर / संचालक का नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. रमेश कुमार शर्मा"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">व्यापारिक प्रतिष्ठान / फर्म का नाम</label>
                <input
                  type="text"
                  placeholder="उदा. माँ दुर्गा टेंट एवं लाइट हाउस"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">सेवा श्रेणी *</label>
                  <select
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  >
                    <option value="Tent, Stage & Pandal">टेंट, मंच एवं पंडाल</option>
                    <option value="Sound & Audio Systems">साउंड एवं डीजे सिस्टम</option>
                    <option value="Decoration & Lighting">विद्युत एवं मंडप सज्जा</option>
                    <option value="Food, Prasad & Catering">प्रसाद, मिठाई व कैटरिंग</option>
                    <option value="Printing & Banners">फ्लेक्स, बैनर व छपाई</option>
                    <option value="Sports & Trophies">खेल सामग्री व शील्ड</option>
                    <option value="Transport & Vehicles">परिवहन व वाहन</option>
                    <option value="Other Service">अन्य सेवा</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">पता (Address)</label>
                <input
                  type="text"
                  placeholder="उदा. मेन रोड कस्बा, पूर्णिया"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">UPI ID</label>
                  <input
                    type="text"
                    placeholder="vendor@upi"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">बैंक खाता संख्या</label>
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-amber-900/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-300"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-6 py-2 font-bold cursor-pointer"
                >
                  {loading ? 'सहेजा जा रहा है...' : 'वेंडर सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

