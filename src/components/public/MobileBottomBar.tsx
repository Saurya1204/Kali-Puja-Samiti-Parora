'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/languageContext';
import { Sparkles, Trophy, FileText, Heart, Phone } from 'lucide-react';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      href: '/',
      labelEn: 'Darshan',
      labelHi: 'दर्शन',
      icon: Sparkles,
      exact: true,
    },
    {
      href: '/kabaddi',
      labelEn: 'Kabaddi',
      labelHi: 'कबड्डी',
      icon: Trophy,
      liveBadge: true,
    },
    {
      href: '/register',
      labelEn: 'Register',
      labelHi: 'पंजीकरण',
      icon: FileText,
    },
    {
      href: '/donations',
      labelEn: 'Donate',
      labelHi: 'सहयोग',
      icon: Heart,
    },
    {
      href: 'tel:6203510983',
      labelEn: 'Help',
      labelHi: 'कॉल',
      icon: Phone,
      isExternal: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-gradient-to-t from-black via-[#160404]/95 to-black/95 backdrop-blur-xl border-t border-amber-500/40 shadow-[0_-5px_25px_rgba(0,0,0,0.9)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center py-1.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && !item.isExternal;

          const content = (
            <div
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-90 relative ${
                isActive
                  ? 'text-amber-400 font-extrabold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {/* Active Indicator Top Glow */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-glow-gold" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-amber-400' : ''
                  }`}
                />
                {item.liveBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>

              {/* Text Label */}
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {t(item.labelEn, item.labelHi)}
              </span>
            </div>
          );

          if (item.isExternal) {
            return (
              <a
                key={item.href}
                href={item.href}
                className="select-none focus:outline-none"
                title="कोच अमरनाथ प्रसाद हेल्पलाइन"
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="select-none focus:outline-none"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

