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
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  highlight?: boolean;
  allowedRoles: string[];
}

export default function AdminSidebar({ userRole = 'SUPER_ADMIN', userName = 'Admin' }: SidebarProps) {
  const pathname = usePathname();

  const allNavItems: NavItem[] = [
    {
      href: '/admin',
      label: 'डैशबोर्ड (Overview)',
      icon: LayoutDashboard,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'TREASURER', 'FINANCE_ADMIN', 'KABADDI_ADMIN', 'AWARDS_ADMIN', 'EVENT_MANAGER', 'VOLUNTEER'],
    },
    {
      href: '/admin/kabaddi',
      label: 'कबड्डी मैच व स्कोर (Kabaddi)',
      icon: Trophy,
      highlight: userRole === 'KABADDI_ADMIN',
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'KABADDI_ADMIN', 'EVENT_MANAGER'],
    },
    {
      href: '/admin/students',
      label: 'मेधावी छात्र व पुरस्कार (Awards)',
      icon: GraduationCap,
      highlight: userRole === 'AWARDS_ADMIN',
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'AWARDS_ADMIN'],
    },
    {
      href: '/admin/expenses',
      label: 'व्यय व बिल प्रबंधन (Expenses)',
      icon: Receipt,
      highlight: userRole === 'TREASURER' || userRole === 'FINANCE_ADMIN',
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'TREASURER', 'FINANCE_ADMIN'],
    },
    {
      href: '/admin/budget',
      label: 'बजट आवंटन (Budget)',
      icon: PieChart,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'TREASURER', 'FINANCE_ADMIN'],
    },
    {
      href: '/admin/donations',
      label: 'दान व रसीदें (Donations)',
      icon: HeartHandshake,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'TREASURER', 'FINANCE_ADMIN'],
    },
    {
      href: '/admin/ledger',
      label: 'वित्तीय लेजर (Ledger)',
      icon: BookOpen,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'TREASURER', 'FINANCE_ADMIN'],
    },
    {
      href: '/admin/vendors',
      label: 'वेंडर डायरेक्टरी (Vendors)',
      icon: Store,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'TREASURER', 'FINANCE_ADMIN'],
    },
    {
      href: '/admin/reports',
      label: 'वित्तीय रिपोर्ट्स (Reports)',
      icon: FileSpreadsheet,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'TREASURER', 'FINANCE_ADMIN'],
    },
    {
      href: '/admin/events',
      label: 'कार्यक्रम प्रबंधन (Events)',
      icon: Calendar,
      highlight: userRole === 'EVENT_MANAGER',
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'EVENT_MANAGER'],
    },
    {
      href: '/admin/registrations',
      label: 'पंजीकरण सूची (Registrations)',
      icon: ClipboardList,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'KABADDI_ADMIN', 'AWARDS_ADMIN', 'EVENT_MANAGER', 'VOLUNTEER'],
    },
    {
      href: '/admin/notices',
      label: 'सूचनाएं व अलर्ट (Notices)',
      icon: Bell,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'EVENT_MANAGER', 'KABADDI_ADMIN', 'AWARDS_ADMIN'],
    },
    {
      href: '/admin/gallery',
      label: 'फोटो गैलरी (Gallery)',
      icon: ImageIcon,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'EVENT_MANAGER'],
    },
    {
      href: '/admin/committee',
      label: 'समिति व वालंटियर (Committee)',
      icon: Users,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY'],
    },
    {
      href: '/admin/users',
      label: 'व्यवस्थापक व रोल्स (Admin Users)',
      icon: ShieldCheck,
      highlight: true,
      allowedRoles: ['SUPER_ADMIN'],
    },
    {
      href: '/admin/settings',
      label: 'वार्षिक सत्र व सेटिंग्स (Settings)',
      icon: Settings,
      allowedRoles: ['SUPER_ADMIN'],
    },
    {
      href: '/admin/audit-logs',
      label: 'ऑडिट लॉग्स (Audit Trail)',
      icon: History,
      allowedRoles: ['SUPER_ADMIN', 'PRESIDENT'],
    },
  ];

  // Filter items by role
  const filteredNavItems = allNavItems.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'KABADDI_ADMIN':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'AWARDS_ADMIN':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'FINANCE_ADMIN':
      case 'TREASURER':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'PRESIDENT':
      case 'SECRETARY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'EVENT_MANAGER':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      default:
        return 'bg-stone-500/20 text-stone-300 border-stone-500/40';
    }
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
          <div className="min-w-0 pr-2">
            <span className="font-bold text-stone-200 block truncate">
              {userName}
            </span>
            <span
              className={`inline-block text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border mt-0.5 ${getRoleBadgeStyle(
                userRole
              )}`}
            >
              {userRole.replace('_', ' ')}
            </span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-stone-400 hover:text-amber-300 p-1 shrink-0"
            title="सार्वजनिक वेबसाइट देखें"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs">
        <div className="text-[10px] font-bold text-stone-500 uppercase px-3 py-1">
          अधिकृत मेनू (Permitted Modules)
        </div>
        {filteredNavItems.map((item) => {
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
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
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
