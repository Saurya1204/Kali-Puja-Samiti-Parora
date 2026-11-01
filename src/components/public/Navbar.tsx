'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/languageContext';
import SamitiLogo from './SamitiLogo';
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
  ChevronDown,
  HelpCircle,
  Vote,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface NavLinkItem {
  href: string;
  labelEn: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary links visible on desktop
  const primaryLinks: NavLinkItem[] = [
    { href: '/', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ', icon: Sparkles },
    { href: '/kabaddi', labelEn: 'Kabaddi', labelHi: 'कबड्डी महाकुंभ', icon: Trophy, highlight: true },
    { href: '/events', labelEn: 'Events', labelHi: 'कार्यक्रम', icon: Calendar },
    { href: '/achievers', labelEn: 'Achievers', labelHi: 'मेधावी छात्र', icon: GraduationCap },
    { href: '/gallery', labelEn: 'Gallery', labelHi: 'गैलरी', icon: ImageIcon },
  ];

  // Secondary links in "More" dropdown
  const moreLinks: NavLinkItem[] = [
    { href: '/register', labelEn: 'Registration', labelHi: 'ऑनलाइन पंजीकरण', icon: FileText },
    { href: '/donations', labelEn: 'Donations', labelHi: 'सहयोग व दान', icon: Heart },
    { href: '/notices', labelEn: 'Notices', labelHi: 'सूचनाएं व विज्ञप्ति', icon: FileText },
    { href: '/about', labelEn: 'About Samiti', labelHi: 'समिति परिचय व इतिहास', icon: Info },
    { href: '/quiz', labelEn: 'Festival Quiz', labelHi: 'काली पूजा प्रश्नोत्तरी', icon: HelpCircle },
    { href: '/vote', labelEn: 'People Choice Vote', labelHi: 'जनता की पसंद वोट', icon: Vote },
  ];

  const allLinks: NavLinkItem[] = [...primaryLinks, ...moreLinks];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#120303]/95 border-b border-amber-600/30 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-2">
          {/* Brand Logo Component - Fully guarded with shrink-0, guaranteed never to be overlapped */}
          <div className="shrink-0 flex items-center pr-1 sm:pr-4">
            <SamitiLogo size="md" />
          </div>

          {/* Desktop Navigation Links (Compact & Tiered so it NEVER crowds or collides with logo) */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-maroon-950 shadow-md font-black'
                      : link.highlight
                      ? 'bg-gradient-to-r from-red-600/30 to-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 shadow-sm'
                      : 'text-stone-200 hover:text-amber-200 hover:bg-maroon-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{t(link.labelEn, link.labelHi)}</span>
                </Link>
              );
            })}

            {/* "More" Interactive Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all whitespace-nowrap ${
                  isMoreOpen
                    ? 'bg-amber-500 text-maroon-950 shadow'
                    : 'text-stone-300 hover:text-amber-200 hover:bg-maroon-900/60'
                }`}
              >
                <span>{t('More', 'और भी')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#190404] border border-amber-500/40 shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {moreLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-amber-500 text-maroon-950 font-bold'
                            : 'text-stone-200 hover:bg-amber-500/20 hover:text-amber-200'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{t(link.labelEn, link.labelHi)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Controls: Language, Donate, Admin */}
          <div className="hidden xl:flex items-center gap-2 xl:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-black/60 border border-amber-600/40 rounded-full p-0.5 text-xs">
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
              className="festive-btn-gold text-xs px-3.5 py-2 flex items-center gap-1.5 font-bold shadow-md whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-red-950" />
              <span>{t('Donate', 'सहयोग')}</span>
            </Link>

            {/* Admin Login Portal */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs text-amber-200/90 hover:text-amber-100 bg-black/50 hover:bg-black/70 border border-amber-500/40 px-3 py-2 rounded-full transition-all whitespace-nowrap"
              title="समिति प्रबंधन लॉगिन"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Admin', 'व्यवस्थापक')}</span>
            </Link>
          </div>

          {/* Mobile menu trigger and fast action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:hidden shrink-0">
            {/* Quick Mobile Language Toggle */}
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="text-[10px] font-bold px-2 py-1 bg-black/60 border border-amber-500/40 rounded-full text-amber-300"
            >
              {lang === 'hi' ? 'EN' : 'हिन्दी'}
            </button>

            {/* Quick Mobile Donate Pill */}
            <Link
              href="/donations"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-maroon-950 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow"
            >
              <Heart className="w-3 h-3 fill-current" />
              <span>दान</span>
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-amber-200 hover:text-white hover:bg-maroon-900 border border-amber-500/40 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - Clean, fully aligned, spacious */}
      {isOpen && (
        <div className="lg:hidden bg-gradient-to-b from-[#190404] via-maroon-950 to-black border-b border-amber-500/40 px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Address & Helpline Pill */}
          <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                स्थान व पिन कोड
              </span>
              <span className="text-stone-200 font-medium">परौरा, बेगूसराय, बिहार - 851217</span>
            </div>
            <a
              href="tel:6203510983"
              className="flex items-center gap-1 text-[11px] text-amber-300 font-mono font-bold bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>6203510983</span>
            </a>
          </div>

          {/* All Navigation Links in 2 Columns */}
          <div className="grid grid-cols-2 gap-2">
            {allLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-maroon-950 font-black shadow-md'
                      : link.highlight
                      ? 'bg-red-950/80 text-amber-300 border border-amber-500/50'
                      : 'text-stone-200 bg-black/40 hover:bg-maroon-900/60 border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t(link.labelEn, link.labelHi)}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Action Footer in Drawer */}
          <div className="pt-2 border-t border-amber-900/60 grid grid-cols-2 gap-2">
            <Link
              href="/donations"
              onClick={() => setIsOpen(false)}
              className="festive-btn-gold text-center text-xs py-2.5 font-bold flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-maroon-950" />
              <span>{t('Donate Online', 'ऑनलाइन दान / चंदा')}</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-black/70 border border-amber-600/50 text-amber-300 py-2.5 rounded-full text-xs font-bold hover:bg-amber-500/10"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Admin Login', 'व्यवस्थापक लॉगिन')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
