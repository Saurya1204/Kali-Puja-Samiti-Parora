'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/languageContext';
import SamitiLogo from './SamitiLogo';
import WhatsAppShareButton from './WhatsAppShareButton';
import { MapPin, Phone, Mail, Trophy, Calendar, ShieldCheck, UserCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-[#150404] via-[#0d0202] to-black border-t border-amber-600/30 text-stone-300 pt-16 pb-12 mt-20 relative overflow-hidden">
      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Heritage */}
          <div className="space-y-4">
            <SamitiLogo size="lg" />
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {t(
                'Parora is the heart of Bihar Kabaddi and Maa Kali devotional fervor. Organizing state-level championships, spiritual ceremonies, and student felicitation since 1984.',
                'परौरा - माँ काली की अगाध भक्ति एवं बिहार कबड्डी का गौरवशाली तीर्थ। वर्ष 1984 से राज्यस्तरीय खेल महाकुंभ, भक्ति जागरण एवं प्रतिभा सम्मान का भव्य आयोजन।'
              )}
            </p>
            <div className="pt-2">
              <WhatsAppShareButton />
            </div>
          </div>

          {/* Col 2: Leadership & Patronage */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3 border-b border-amber-900/60 pb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{t('Samiti Leadership', 'समिति नेतृत्व व संरक्षक')}</span>
            </h4>

            {/* Coach Amarnath Prasad */}
            <div className="p-3 rounded-xl bg-black/50 border border-amber-600/30 space-y-1">
              <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase tracking-wide">
                Chief Patron & Sports Mentor
              </span>
              <div className="font-bold text-stone-100 text-sm">
                श्री अमरनाथ प्रसाद (Amarnath Prasad)
              </div>
              <p className="text-[11px] text-stone-300 leading-tight">
                बिहार कबड्डी के शीर्ष मार्गदर्शक, पूर्व कबड्डी खिलाड़ी, राज्य बॉक्सर एवं कराटे ब्लैक बेल्ट
              </p>
              <div className="text-[11px] text-amber-300 font-mono pt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-400" />
                <a href="tel:6203510983" className="hover:underline font-bold">
                  6203510983
                </a>
              </div>
            </div>

            {/* President Sillu Kumar */}
            <div className="p-3 rounded-xl bg-black/50 border border-amber-600/30 space-y-0.5">
              <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase tracking-wide">
                Current President (अध्यक्ष)
              </span>
              <div className="font-bold text-stone-100 text-sm">
                श्री सिल्लू कुमार (Sillu Kumar)
              </div>
              <p className="text-[11px] text-stone-400">
                अध्यक्ष, श्री श्री काली पूजा समिति परोरा (बेगूसराय)
              </p>
            </div>
          </div>

          {/* Col 3: Festival Dates & Venue */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 border-b border-amber-900/60 pb-2">
              {t('Festival Venue & Dates', 'स्थान एवं तिथि')}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-300">
              <li className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 block">{t('Annual Festival Dates:', 'वार्षिक महोत्सव:')}</strong>
                  <span>9 एवं 10 नवम्बर (कार्तिक अमावस्या - दीपावली पश्चात)</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 block">{t('Venue:', 'आयोजन स्थल:')}</strong>
                  <span>माँ काली मंदिर प्रांगण एवं खेल मैदान, परोरा, बेगूसराय, बिहार - 851217</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 block">{t('Kabaddi Arena:', 'कबड्डी महासंग्राम:')}</strong>
                  <span>फ्लडलाइट्स युक्त आधुनिक मैट कोर्ट, उच्च विद्यालय परोरा</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links & UPI */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 border-b border-amber-900/60 pb-2">
              {t('Quick Links & Seva', 'त्वरित लिंक्स व दान')}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/kabaddi" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 font-semibold text-amber-200">
                  <span>🏆</span>
                  <span>कबड्डी टूर्नामेंट व खिलाड़ी प्रोफाइल</span>
                </Link>
              </li>
              <li>
                <Link href="/achievers" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>🎓</span>
                  <span>परौरा प्रतिभा सम्मान व छात्र सूची</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>📅</span>
                  <span>महोत्सव समय-सारणी व कार्यक्रम</span>
                </Link>
              </li>
              <li>
                <Link href="/donations" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>🙏</span>
                  <span>दान सहयोग एवं आधिकारिक रसीद</span>
                </Link>
              </li>
              <li className="pt-2">
                <div className="bg-maroon-900/60 border border-amber-600/30 rounded-xl p-2.5 text-xs">
                  <span className="text-amber-300 font-bold block mb-1">Official UPI VPA:</span>
                  <code className="text-amber-100 font-mono select-all bg-black/40 px-2 py-0.5 rounded block text-center">
                    samitiparora@sbi
                  </code>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-amber-900/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} श्री श्री काली पूजा समिति परोरा (बेगूसराय, बिहार - 851217). सर्वाधिकार सुरक्षित।</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-amber-300 transition-colors">
              समिति विवरण
            </Link>
            <span>•</span>
            <Link href="/notices" className="hover:text-amber-300 transition-colors">
              नियमावली व आचार संहिता
            </Link>
            <span>•</span>
            <Link href="/login" className="text-amber-400 hover:text-amber-200 transition-colors font-bold">
              व्यवस्थापक लॉगिन (Admin Portal)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
