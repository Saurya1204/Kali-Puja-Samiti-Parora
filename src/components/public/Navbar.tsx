'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/languageContext';
import DiyaAnimation from './DiyaAnimation';
import {
  Menu,
  X,
  Lock,
  Heart,
  Trophy,
  Calendar,
  GraduationCap,
  Image as ImageIcon,
  FileText,
  Info,
  Sparkles,
  HelpCircle,
  Vote,
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { href: '/', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ', icon: Sparkles },
    { href: '/events', labelEn: 'Events', labelHi: 'कार्यक्रम', icon: Calendar },
    { href: '/kabaddi', labelEn: 'Kabaddi', labelHi: 'कबड्डी महाकुंभ', icon: Trophy },
    { href: '/achievers', labelEn: 'Achievers', labelHi: 'मेधावी छात्र', icon: GraduationCap },
    { href: '/register', labelEn: 'Register', labelHi: 'पंजीकरण', icon: FileText },
    { href: '/gallery', labelEn: 'Gallery', labelHi: 'गैलरी', icon: ImageIcon },
    { href: '/donations', labelEn: 'Donate', labelHi: 'सहयोग व दान', icon: Heart },
    { href: '/notices', labelEn: 'Notices', labelHi: 'सूचनाएं', icon: FileText },
    { href: '/quiz', labelEn: 'Quiz', labelHi: 'क्विज', icon: HelpCircle },
    { href: '/vote', labelEn: 'Vote', labelHi: 'वोटिंग', icon: Vote },
    { href: '/about', labelEn: 'About', labelHi: 'समिति परिचय', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-maroon-950/95 border-b border-amber-600/30 transition-all shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="shrink-0">
              <DiyaAnimation size="sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-amber-300 group-hover:text-amber-200 transition-colors">
                {t('Kali Puja Samiti Parora', 'काली पूजा समिति परोरा')}
              </span>
              <span className="text-[11px] sm:text-xs text-amber-200/70 font-medium tracking-wider">
                {t('Annual Festival & Kabaddi Utsav', 'वार्षिक महोत्सव एवं खेल महाकुंभ')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-stone-200 hover:text-amber-300 hover:bg-maroon-900/60'
                  }`}
                >
                  {t(link.labelEn, link.labelHi)}
                </Link>
              );
            })}
          </nav>

          {/* Controls: Language, Donate, Admin */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-maroon-900/80 border border-amber-600/40 rounded-full p-0.5 text-xs">
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-full transition-all font-bold ${
                  lang === 'hi' ? 'bg-amber-500 text-maroon-950 shadow' : 'text-stone-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full transition-all font-bold ${
                  lang === 'en' ? 'bg-amber-500 text-maroon-950 shadow' : 'text-stone-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Donate CTA */}
            <Link
              href="/donations"
              className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-red-900" />
              <span>{t('Donate', 'दान सहयोग')}</span>
            </Link>

            {/* Admin Login Portal */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs text-amber-200/80 hover:text-amber-300 bg-black/40 hover:bg-black/60 border border-amber-700/50 px-3 py-1.5 rounded-full transition-all"
              title="Admin & Committee Login"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Admin', 'प्रशासन')}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center bg-maroon-900/80 border border-amber-600/40 rounded-full p-0.5 text-[11px] sm:hidden">
              <button
                onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
                className="px-2 py-0.5 font-bold text-amber-300"
              >
                {lang === 'hi' ? 'EN' : 'हिन्दी'}
              </button>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-amber-200 hover:text-white hover:bg-maroon-900 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-maroon-950 border-b border-amber-600/40 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-stone-200 hover:bg-maroon-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t(link.labelEn, link.labelHi)}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-amber-900/60 flex items-center justify-between gap-3">
            <Link
              href="/donations"
              onClick={() => setIsOpen(false)}
              className="flex-1 festive-btn-gold text-center text-xs py-2.5"
            >
              {t('Donate / Chanda', 'दान / सहयोग करें')}
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1 bg-black/50 border border-amber-600/40 text-amber-300 px-4 py-2.5 rounded-full text-xs font-medium"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('Admin', 'लॉगिन')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

