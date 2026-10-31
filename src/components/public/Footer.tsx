'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/languageContext';
import DiyaAnimation from './DiyaAnimation';
import WhatsAppShareButton from './WhatsAppShareButton';
import { MapPin, Phone, Mail, Heart, Calendar, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-[#150404] via-[#0d0202] to-black border-t border-amber-600/30 text-stone-300 pt-16 pb-12 mt-20 relative overflow-hidden">
      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: About Samiti */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <DiyaAnimation size="sm" />
              <h4 className="font-serif text-lg font-bold text-amber-300">
                {t('Kali Puja Samiti Parora', 'काली पूजा समिति परोरा')}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              {t(
                'Organizing the historic Kali Puja festival, All-Bihar Kabaddi Tournament, cultural programs, and student felicitation since 1984 in Parora, Purnea (Bihar).',
                'वर्ष 1984 से परोरा, पूर्णिया (बिहार) में ऐतिहासिक काली पूजा महोत्सव, अखिल बिहार कबड्डी प्रतियोगिता, सांस्कृतिक संध्या एवं मेधावी छात्र सम्मान का गौरवशाली आयोजन।'
              )}
            </p>
            <div className="pt-2">
              <WhatsAppShareButton />
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 border-b border-amber-900/60 pb-2">
              {t('Quick Navigation', 'मुख्य लिंक्स')}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/events" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>✦</span>
                  <span>{t('Events & Schedule', 'कार्यक्रम समय-सारणी')}</span>
                </Link>
              </li>
              <li>
                <Link href="/kabaddi" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>✦</span>
                  <span>{t('Kabaddi Scoreboard', 'कबड्डी लाइव स्कोर व अंक')}</span>
                </Link>
              </li>
              <li>
                <Link href="/achievers" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>✦</span>
                  <span>{t('Wall of Achievers', 'मेधावी छात्र सम्मान दीवार')}</span>
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>✦</span>
                  <span>{t('Online Registration', 'प्रतियोगिता पंजीकरण')}</span>
                </Link>
              </li>
              <li>
                <Link href="/donations" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>✦</span>
                  <span>{t('Donations & Receipts', 'दान सहयोग एवं रसीद')}</span>
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>✦</span>
                  <span>{t('Photo & Video Gallery', 'महोत्सव फोटो व वीडियो')}</span>
                </Link>
              </li>
            </ul>
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
                  <span>9th & 10th November 2026 (कार्तिक अमावस्या एवं प्रतिपदा)</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 block">{t('Venue:', 'आयोजन स्थल:')}</strong>
                  <span>Maa Kali Mandir Parisar & High School Ground, Parora, Purnea, Bihar - 854301</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-400">Govt Reg No: BR-PUR-2012/KP-042</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 border-b border-amber-900/60 pb-2">
              {t('Contact & Helpline', 'संपर्क एवं सहायता')}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 94312 88491 / +91 97714 55321</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>contact@kalipujaparora.org</span>
              </li>
              <li className="pt-2">
                <div className="bg-maroon-900/60 border border-amber-600/30 rounded-xl p-3 text-xs">
                  <span className="text-amber-300 font-bold block mb-1">Official UPI VPA:</span>
                  <code className="text-amber-100 font-mono select-all bg-black/40 px-2 py-0.5 rounded">
                    samitiparora@sbi
                  </code>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-amber-900/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Kali Puja Samiti Parora. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-amber-300 transition-colors">
              About Committee
            </Link>
            <span>•</span>
            <Link href="/notices" className="hover:text-amber-300 transition-colors">
              Rules & Code of Conduct
            </Link>
            <span>•</span>
            <Link href="/login" className="text-amber-400 hover:text-amber-200 transition-colors font-semibold">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
