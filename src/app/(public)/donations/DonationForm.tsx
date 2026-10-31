'use client';

import React, { useState } from 'react';
import { Heart, Send, CheckCircle2, AlertCircle, Printer, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function DonationForm() {
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    donorAddressOrVillage: 'Parora',
    amount: 1100,
    paymentMethod: 'UPI' as 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE',
    transactionRef: '',
    purpose: 'Kali Puja Utsav & Bhandara Seva',
    remarks: '',
    isPubliclyVisible: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    receiptNumber: string;
    donorName: string;
    amount: number;
    donationDate: string;
    purpose: string;
  } | null>(null);

  const quickAmounts = [251, 501, 1100, 2100, 5100, 11000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहयोग विवरण दर्ज करने में त्रुटि हुई');

      setReceipt({
        receiptNumber: data.receiptNumber,
        donorName: data.donorName,
        amount: data.amount,
        donationDate: data.donationDate,
        purpose: data.purpose,
      });
    } catch (err: any) {
      setError(err.message || 'त्रुटि उत्पन्न हुई।');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (receipt) {
    return (
      <div className="bg-gradient-to-b from-maroon-950 via-[#150404] to-black border-2 border-amber-500 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden printable-area">
        {/* Printable Official Receipt */}
        <div className="border-4 border-double border-amber-600/60 p-6 sm:p-8 rounded-2xl bg-black/50">
          <div className="flex items-center justify-between border-b border-amber-700/50 pb-4 mb-4">
            <div className="text-left">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                Official Donation Receipt
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-200 font-serif">
                श्री श्री 108 काली पूजा समिति, परोरा
              </h2>
              <span className="text-[10px] text-stone-400">Reg No: BR-PUR-2012/KP-042 | Purnea, Bihar</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-serif text-xs font-bold text-center leading-none">
              ॐ माँ काली
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 my-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-stone-400 block text-[10px]">रसीद क्रमांक (Receipt No):</span>
              <span className="text-base font-extrabold text-amber-300 font-mono tracking-wider">
                {receipt.receiptNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-stone-400 block text-[10px]">दिनांक (Date):</span>
              <span className="font-bold text-stone-200">
                {new Date(receipt.donationDate).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          <div className="text-left space-y-2.5 text-xs text-stone-300 py-2">
            <div className="flex justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-400">श्रद्धालु / दानदाता का नाम:</span>
              <strong className="text-stone-100 text-sm">{receipt.donorName}</strong>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-400">समर्पित सहयोग राशि:</span>
              <strong className="text-amber-300 text-lg font-mono font-extrabold">
                {formatINR(receipt.amount)}
              </strong>
            </div>
            <div className="flex justify-between border-b border-stone-800 pb-1.5">
              <span className="text-stone-400">सहयोग का उद्देश्य:</span>
              <span className="text-stone-200 font-medium">{receipt.purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">स्थिति:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>सत्यापित एवं जमा (Confirmed)</span>
              </span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-amber-700/50 flex items-end justify-between text-[11px] text-stone-400">
            <div>
              <span className="block font-serif text-amber-300">काली पूजा समिति परोरा</span>
              <span>अधिकृत डिजिटल पावती</span>
            </div>
            <div className="text-center">
              <div className="font-serif italic text-amber-400 text-xs mb-1">Manoj Sharma</div>
              <div className="border-t border-stone-600 pt-0.5 text-[9px] uppercase tracking-wider">
                हस्ताक्षर (कोषाध्यक्ष / Secretary)
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 no-print">
          <button
            onClick={handlePrint}
            className="festive-btn-gold text-xs sm:text-sm px-6 py-2.5 flex items-center gap-2 font-bold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>रसीद प्रिंट / डाउनलोड करें (Print Receipt)</span>
          </button>
          <button
            onClick={() => setReceipt(null)}
            className="bg-black/60 hover:bg-black/80 text-stone-300 px-6 py-2.5 rounded-full border border-amber-700/50 text-xs font-semibold"
          >
            अन्य सहयोग दर्ज करें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-maroon-950/80 to-[#120303] border-2 border-amber-600/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold uppercase border border-red-500/30">
          <Heart className="w-4 h-4 fill-current text-red-500" />
          <span>Devotee Offering Portal</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif">
          सहयोग राशि का विवरण दर्ज करें
        </h2>
        <p className="text-xs sm:text-sm text-stone-300">
          यदि आपने UPI अथवा बैंक खाते में धनराशि प्रेषित कर दी है या नकद सहयोग किया है, तो नीचे विवरण दर्ज कर तत्काल आधिकारिक रसीद प्राप्त करें।
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl mb-6 bg-red-950/80 border border-red-500 text-red-200 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        {/* Quick Amount Buttons */}
        <div className="space-y-2">
          <label className="font-semibold text-amber-200 block">
            सहयोग राशि चुनें अथवा दर्ज करें (Donation Amount) *
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {quickAmounts.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setFormData({ ...formData, amount: amt })}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer font-mono ${
                  formData.amount === amt
                    ? 'bg-amber-500 text-maroon-950 border-amber-400 shadow'
                    : 'bg-black/40 text-stone-300 border-amber-800/40 hover:border-amber-500'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-base">
              ₹
            </span>
            <input
              type="number"
              required
              min="11"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl pl-9 pr-4 py-3 text-stone-100 font-mono text-base font-bold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Donor Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              श्रद्धालु / दानदाता का पूरा नाम *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. श्री राधेश्याम सिंह"
              value={formData.donorName}
              onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              मोबाइल नंबर (10 अंकों का फोन)
            </label>
            <input
              type="tel"
              placeholder="9876543210"
              value={formData.donorPhone}
              onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              गांव / शहर अथवा पता
            </label>
            <input
              type="text"
              placeholder="उदा. परोरा / पूर्णिया / पटना"
              value={formData.donorAddressOrVillage}
              onChange={(e) => setFormData({ ...formData, donorAddressOrVillage: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              भुगतान माध्यम (Payment Method) *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
            >
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
              <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
              <option value="CASH">नकद (Cash to Committee Member)</option>
              <option value="CHEQUE">चेक / ड्राफ्ट (Cheque)</option>
            </select>
          </div>
        </div>

        {/* Transaction Reference Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              UPI UTR / बैंक लेनदेन संदर्भ संख्या (Ref / UTR No)
            </label>
            <input
              type="text"
              placeholder="उदा. 429182910481 या UPI Ref #"
              value={formData.transactionRef}
              onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
              className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-amber-200 block">
              सहयोग का उद्देश्य (Purpose)
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full bg-maroon-950 border border-amber-700/50 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
            >
              <option value="Kali Puja Utsav & Bhandara Seva">काली पूजा महोत्सव एवं महाप्रसाद भंडारा सेवा</option>
              <option value="Kabaddi Tournament Sponsorship">कबड्डी प्रतियोगिता प्रायोजन एवं पुरस्कार</option>
              <option value="Meritorious Student Recognition">मेधावी छात्र सम्मान एवं शील्ड</option>
              <option value="Temple Illumination & Decoration">मंडप एवं विद्युत प्रकाश सज्जा</option>
              <option value="General Festival Chanda">सामान्य महोत्सव चंदा</option>
            </select>
          </div>
        </div>

        {/* Privacy consent checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isPubliclyVisible"
            checked={formData.isPubliclyVisible}
            onChange={(e) => setFormData({ ...formData, isPubliclyVisible: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
          />
          <label htmlFor="isPubliclyVisible" className="text-xs text-stone-300 cursor-pointer">
            मेरा नाम एवं सहयोग राशि वेबसाइट के दानदाता सम्मान दीवार (Donors Wall) पर प्रदर्शित करने की अनुमति है।
          </label>
        </div>

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="festive-btn-gold text-sm sm:text-base px-8 py-3.5 inline-flex items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>रसीद तैयार हो रही है...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>सहयोग विवरण सबमिट करें एवं रसीद पाएं</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
