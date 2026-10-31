'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  HeartHandshake,
  BookOpen,
  Store,
  Calendar,
  Trophy,
  GraduationCap,
  ClipboardList,
  Bell,
  Image as ImageIcon,
  Users,
  FileSpreadsheet,
  Settings,
  History,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export default function AdminSidebar({ userRole = 'SUPER_ADMIN', userName = 'Admin' }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'डैशबोर्ड (Overview)', icon: LayoutDashboard },
    { href: '/admin/expenses', label: 'व्यय व बिल प्रबंधन (Expenses)', icon: Receipt, highlight: true },
    { href: '/admin/budget', label: 'बजट प्रबंधन (Budget)', icon: PieChart },
    { href: '/admin/donations', label: 'दान व आय (Donations)', icon: HeartHandshake },
    { href: '/admin/ledger', label: 'वित्तीय लेजर (Ledger)', icon: BookOpen },
    { href: '/admin/vendors', label: 'वेंडर डायरेक्टरी (Vendors)', icon: Store },
    { href: '/admin/events', label: 'कार्यक्रम प्रबंधन (Events)', icon: Calendar },
    { href: '/admin/kabaddi', label: 'कबड्डी लाइव स्कोर (Kabaddi)', icon: Trophy },
    { href: '/admin/students', label: 'मेधावी छात्र सत्यापन (Awards)', icon: GraduationCap },
    { href: '/admin/registrations', label: 'पंजीकरण सूची (Registrations)', icon: ClipboardList },
    { href: '/admin/notices', label: 'सूचनाएं व अलर्ट (Notices)', icon: Bell },
    { href: '/admin/gallery', label: 'फोटो गैलरी (Gallery)', icon: ImageIcon },
    { href: '/admin/committee', label: 'समिति व वालंटियर (Committee)', icon: Users },
    { href: '/admin/reports', label: 'रिपोर्ट्स व एक्सेल (Reports)', icon: FileSpreadsheet },
    { href: '/admin/settings', label: 'वर्ष व पोर्टल सेटिंग्स (Settings)', icon: Settings },
    { href: '/admin/audit-logs', label: 'ऑडिट लॉग्स (Audit Trail)', icon: History },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-maroon-950 border-r border-amber-600/30 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Branding */}
      <div className="p-4 border-b border-amber-900/40">
        <div className="flex items-center gap-2.5">
          <DiyaAnimation size="sm" />
          <div>
            <h2 className="font-serif text-base font-bold text-amber-300 leading-tight">
              समिति प्रबंधन
            </h2>
            <span className="text-[10px] text-amber-200/70 font-mono">
              Kali Puja Samiti Portal
            </span>
          </div>
        </div>

        {/* User Role Tag */}
        <div className="mt-3 bg-black/50 border border-amber-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-stone-200 block truncate max-w-[130px]">
              {userName}
            </span>
            <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">
              {userRole.replace('_', ' ')}
            </span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-stone-400 hover:text-amber-300 p-1"
            title="सार्वजनिक वेबसाइट देखें"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-amber-500 text-maroon-950 font-bold shadow-md shadow-amber-500/20'
                  : item.highlight
                  ? 'bg-red-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-500/10'
                  : 'text-stone-300 hover:text-amber-200 hover:bg-maroon-900/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout button */}
      <div className="p-3 border-t border-amber-900/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-black/60 hover:bg-red-950/80 text-stone-300 hover:text-red-300 border border-stone-800 hover:border-red-600/50 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>लॉगआउट (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
