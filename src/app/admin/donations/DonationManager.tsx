'use client';

import React, { useState } from 'react';
import { formatINR, formatDate, generateReceiptNumber } from '@/lib/utils';
import { exportToExcel } from '@/lib/exportUtils';
import {
  Heart,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  Search,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

interface DonationItem {
  id: string;
  receiptNumber: string;
  donorName: string;
  donorPhone?: string | null;
  donorEmail?: string | null;
  donorAddressOrVillage?: string | null;
  amount: number;
  donationDate: string;
  paymentMethod: string;
  transactionRef?: string | null;
  purpose?: string | null;
  remarks?: string | null;
  isPubliclyVisible: boolean;
  status: string;
}

export default function DonationManager({
  initialDonations,
  festivalYear,
}: {
  initialDonations: DonationItem[];
  festivalYear: number;
}) {
  const [donations, setDonations] = useState<DonationItem[]>(initialDonations);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationItem | null>(null);

  // New Donation form
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorAddressOrVillage: 'Parora',
    amount: 1100,
    paymentMethod: 'CASH',
    transactionRef: '',
    purpose: 'Kali Puja Utsav Seva',
    remarks: '',
    isPubliclyVisible: true,
  });

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  const filtered = donations.filter((d) => {
    const matchesSearch =
      d.donorName.toLowerCase().includes(search.toLowerCase()) ||
      d.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      (d.donorAddressOrVillage && d.donorAddressOrVillage.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = !methodFilter || d.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'दान दर्ज करने में त्रुटि');

      const newDonation: DonationItem = {
        id: data.receiptNumber,
        receiptNumber: data.receiptNumber,
        donorName: formData.donorName,
        donorPhone: formData.donorPhone,
        donorAddressOrVillage: formData.donorAddressOrVillage,
        amount: formData.amount,
        donationDate: new Date().toISOString(),
        paymentMethod: formData.paymentMethod,
        transactionRef: formData.transactionRef,
        purpose: formData.purpose,
        remarks: formData.remarks,
        isPubliclyVisible: formData.isPubliclyVisible,
        status: 'CONFIRMED',
      };

      setDonations([newDonation, ...donations]);
      setIsModalOpen(false);
      setSelectedReceipt(newDonation);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filtered.map((d) => ({
      'रसीद क्रमांक (Receipt No)': d.receiptNumber,
      'दानदाता का नाम (Donor Name)': d.donorName,
      'मोबाइल (Phone)': d.donorPhone || '',
      'गांव / पता (Address)': d.donorAddressOrVillage || '',
      'राशि (Amount)': d.amount,
      'दिनांक (Date)': formatDate(d.donationDate),
      'माध्यम (Payment Method)': d.paymentMethod,
      'संदर्भ / UTR No': d.transactionRef || '',
      'उद्देश्य (Purpose)': d.purpose || '',
      'सार्वजनिक प्रदर्शन (Public)': d.isPubliclyVisible ? 'हाँ' : 'नहीं',
    }));

    exportToExcel(exportData, `Kali_Puja_Parora_Donations_${festivalYear}`);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Devotional Contributions & Income Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            दान एवं आय प्रबंधन (Donations & Income)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            सभी दानदाताओं की सूची, रसीद संधारण, बैंक/UPI लेनदेन एवं सार्वजनिक प्रदर्शन नियंत्रण
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-maroon-950" />
            <span>नया दान / चंदा दर्ज करें</span>
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
            <span>प्रिंट रसीद सूची</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-black/50 border border-emerald-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">कुल प्राप्त दान राशि (Total Donations)</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {formatINR(totalAmount)}
          </div>
          <span className="text-[10px] text-stone-400">कुल रसीदें: {donations.length}</span>
        </div>

        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">UPI व बैंक अंतरण (Bank/UPI)</span>
          <div className="text-2xl font-extrabold text-amber-300 font-mono mt-1">
            {formatINR(
              donations
                .filter((d) => d.paymentMethod === 'UPI' || d.paymentMethod === 'BANK_TRANSFER')
                .reduce((sum, d) => sum + d.amount, 0)
            )}
          </div>
          <span className="text-[10px] text-stone-400">सीधे बैंक खाते में प्राप्त</span>
        </div>

        <div className="bg-black/50 border border-amber-600/30 rounded-2xl p-5 shadow">
          <span className="text-xs text-stone-400 block">नकद संग्रह (Cash Collection)</span>
          <div className="text-2xl font-extrabold text-stone-200 font-mono mt-1">
            {formatINR(
              donations.filter((d) => d.paymentMethod === 'CASH').reduce((sum, d) => sum + d.amount, 0)
            )}
          </div>
          <span className="text-[10px] text-stone-400">कोषाध्यक्ष / रसीद बुक द्वारा</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-black/40 border border-amber-900/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="दानदाता का नाम, रसीद क्रमांक अथवा गांव खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-maroon-950 border border-amber-800/50 rounded-xl pl-9 pr-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="bg-maroon-950 border border-amber-800/50 rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
        >
          <option value="">सभी भुगतान माध्यम (All Methods)</option>
          <option value="UPI">UPI</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CASH">Cash</option>
          <option value="CHEQUE">Cheque</option>
        </select>
      </div>

      {/* DONATION TABLE */}
      <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">रसीद # व दिनांक</th>
                <th className="py-3.5 px-4">दानदाता का नाम व विवरण</th>
                <th className="py-3.5 px-4 text-right">सहयोग राशि</th>
                <th className="py-3.5 px-4 text-center">माध्यम व संदर्भ</th>
                <th className="py-3.5 px-4">उद्देश्य (Purpose)</th>
                <th className="py-3.5 px-4 text-center">सार्वजनिक</th>
                <th className="py-3.5 px-4 text-center no-print">रसीद</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-amber-500/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-amber-300 block">{d.receiptNumber}</span>
                    <span className="text-[10px] text-stone-400">{formatDate(d.donationDate)}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-100">{d.donorName}</div>
                    <span className="text-[11px] text-stone-400">
                      {d.donorAddressOrVillage || 'परोरा'}{d.donorPhone ? ` • ${d.donorPhone}` : ''}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                    {formatINR(d.amount)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                      {d.paymentMethod}
                    </span>
                    {d.transactionRef && (
                      <span className="block text-[10px] text-stone-400 font-mono mt-0.5">
                        {d.transactionRef}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-stone-300 text-xs">
                    {d.purpose || 'सामान्य दान'}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {d.isPubliclyVisible ? (
                      <span className="text-emerald-400 font-bold text-[10px]">प्रदर्शित</span>
                    ) : (
                      <span className="text-stone-500 text-[10px]">निजी</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center no-print">
                    <button
                      onClick={() => setSelectedReceipt(d)}
                      className="festive-btn-gold text-[10px] px-3 py-1 font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>रसीद देखें</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW DONATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
              <h3 className="text-xl font-bold text-amber-300 font-serif">नया दान / चंदा प्रविष्टि</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-amber-200">दानदाता का नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. श्री राधेश्याम सिंह"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">सहयोग राशि (₹) *</label>
                  <input
                    type="number"
                    required
                    min="11"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">भुगतान माध्यम *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  >
                    <option value="CASH">नकद (Cash)</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">चेक (Cheque)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">फोन नंबर</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.donorPhone}
                    onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">गांव / टोला / पता</label>
                  <input
                    type="text"
                    value={formData.donorAddressOrVillage}
                    onChange={(e) => setFormData({ ...formData, donorAddressOrVillage: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">उद्देश्य</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pub"
                  checked={formData.isPubliclyVisible}
                  onChange={(e) => setFormData({ ...formData, isPubliclyVisible: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="pub" className="text-xs text-stone-300 cursor-pointer">
                  सार्वजनिक दानदाता दीवार पर प्रदर्शित करें
                </label>
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
                  {loading ? 'दर्ज हो रहा है...' : 'दान रसीद बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-maroon-950 via-[#150404] to-black border-2 border-amber-500 rounded-3xl p-8 max-w-xl w-full shadow-2xl relative printable-area">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white no-print"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Receipt Box */}
            <div className="border-4 border-double border-amber-600/60 p-6 rounded-2xl bg-black/50 text-center space-y-4">
              <div className="border-b border-amber-700/50 pb-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Official Donation Receipt
                </span>
                <h3 className="text-xl font-extrabold text-amber-200 font-serif">
                  श्री श्री 108 काली पूजा समिति, परोरा
                </h3>
                <span className="text-[10px] text-stone-400">Reg No: BR-PUR-2012/KP-042 | Purnea (Bihar)</span>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">रसीद क्रमांक:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    {selectedReceipt.receiptNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px]">दिनांक:</span>
                  <span className="font-mono text-stone-200 font-semibold">
                    {formatDate(selectedReceipt.donationDate)}
                  </span>
                </div>
              </div>

              <div className="text-left space-y-2 text-xs py-2">
                <div className="flex justify-between border-b border-stone-800 pb-1">
                  <span className="text-stone-400">दानदाता:</span>
                  <strong className="text-stone-100">{selectedReceipt.donorName}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-800 pb-1">
                  <span className="text-stone-400">सहयोग राशि:</span>
                  <strong className="text-amber-300 text-base font-mono font-extrabold">
                    {formatINR(selectedReceipt.amount)}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-stone-800 pb-1">
                  <span className="text-stone-400">माध्यम:</span>
                  <span className="text-stone-200">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">उद्देश्य:</span>
                  <span className="text-stone-200">{selectedReceipt.purpose}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-700/50 flex justify-between items-end text-[10px] text-stone-400">
                <div>काली पूजा समिति परोरा</div>
                <div className="text-center">
                  <div className="font-serif italic text-amber-400 mb-0.5">Manoj Sharma</div>
                  <div className="border-t border-stone-600 pt-0.5">हस्ताक्षर कोषाध्यक्ष</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="festive-btn-gold text-xs px-6 py-2.5 font-bold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिंट रसीद</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
