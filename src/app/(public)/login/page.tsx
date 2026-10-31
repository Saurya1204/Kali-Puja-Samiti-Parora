'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import { Lock, Mail, Key, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@kalipujaparora.org');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: 'Super Admin', email: 'admin@kalipujaparora.org', pass: 'admin123', color: 'from-amber-500 to-amber-600' },
    { role: 'Treasurer (कोषाध्यक्ष)', email: 'treasurer@kalipujaparora.org', pass: 'treasurer123', color: 'from-emerald-500 to-emerald-600' },
    { role: 'Secretary (सचिव)', email: 'secretary@kalipujaparora.org', pass: 'secretary123', color: 'from-blue-500 to-blue-600' },
    { role: 'President (अध्यक्ष)', email: 'president@kalipujaparora.org', pass: 'president123', color: 'from-purple-500 to-purple-600' },
    { role: 'Event Manager', email: 'events@kalipujaparora.org', pass: 'events123', color: 'from-rose-500 to-rose-600' },
    { role: 'Volunteer', email: 'volunteer@kalipujaparora.org', pass: 'volunteer123', color: 'from-stone-500 to-stone-600' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'लॉगिन असफल रहा');

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'लॉगिन त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Secure Management Portal
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-serif">
          समिति प्रबंधन एवं प्रशासनिक लॉगिन
        </h1>
        <p className="text-xs sm:text-sm text-stone-300">
          केवल अधिकृत समिति पदाधिकारियों, लेखापाल एवं व्यवस्थापकों हेतु सुरक्षित पोर्टल
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Login Box */}
        <div className="lg:col-span-7 festive-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-amber-900/40 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-lg">प्रशासनिक लॉगिन (Sign In)</h3>
              <span className="text-xs text-stone-400">अपनी आधिकारिक आईडी एवं पासवर्ड दर्ज करें</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold text-amber-200 block">ईमेल पता (Email Address) *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl pl-10 pr-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-amber-200 block">गोपनीय पासवर्ड (Password) *</label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl pl-10 pr-4 py-2.5 text-stone-100 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full festive-btn-gold text-sm py-3 font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>सत्यापित किया जा रहा है...</span>
                ) : (
                  <>
                    <span>सुरक्षित लॉगिन करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-amber-900/40 text-[11px] text-stone-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>256-Bit एन्क्रिप्टेड एवं भूमिका-आधारित पहुंच नियंत्रण (RBAC) सक्रिय।</span>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="lg:col-span-5 bg-black/40 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-amber-300 text-sm">त्वरित डेमो खाते (1-Click Test Access)</h4>
          </div>
          <p className="text-xs text-stone-400">
            परीक्षण हेतु किसी भी भूमिका पर क्लिक करें, क्रेडेंशियल स्वतः भर जाएंगे:
          </p>

          <div className="space-y-2.5 pt-1">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => setDemo(acc.email, acc.pass)}
                className="w-full text-left p-3 rounded-xl bg-maroon-950/80 border border-amber-900/50 hover:border-amber-400 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-amber-200 text-xs block group-hover:text-amber-300">
                    {acc.role}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">{acc.email}</span>
                </div>
                <span className="text-[11px] text-amber-400/80 font-mono bg-black/50 px-2 py-0.5 rounded border border-amber-900/50">
                  Fill
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
