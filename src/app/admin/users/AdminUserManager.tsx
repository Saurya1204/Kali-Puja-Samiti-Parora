'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Key,
  Mail,
  Phone,
  X,
  Search,
  Lock,
  Layers,
  Check,
  PlusCircle,
  RotateCcw,
  Sliders,
  Users,
} from 'lucide-react';
import { RoleConfig, AdminSection, ADMIN_SECTIONS } from '@/lib/rolePermissions';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUserManager({
  initialUsers,
  currentUserId,
  initialRoles,
}: {
  initialUsers: UserItem[];
  currentUserId: string;
  initialRoles: RoleConfig[];
}) {
  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES'>('USERS');

  // Users State
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // User Form
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'VOLUNTEER',
    password: '',
    isActive: true,
  });

  // Roles State
  const [roles, setRoles] = useState<RoleConfig[]>(initialRoles);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>(initialRoles[0]?.key || 'SUPER_ADMIN');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);
  const [roleForm, setRoleForm] = useState({
    key: '',
    name: '',
    nameHindi: '',
    description: '',
    color: 'bg-amber-900/60 text-amber-200 border-amber-500/50',
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Current selected role for section visibility checklist
  const selectedRole = roles.find((r) => r.key === selectedRoleKey) || roles[0];

  // Helper to get role display
  const getRoleBadge = (roleKey: string) => {
    const found = roles.find((r) => r.key === roleKey);
    return {
      name: found?.name || roleKey,
      nameHindi: found?.nameHindi || roleKey,
      color: found?.color || 'bg-stone-800 text-stone-300 border-stone-600',
    };
  };

  // --- USER CRUD HANDLERS ---
  const openCreateUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      phone: '',
      role: roles[0]?.key || 'VOLUNTEER',
      password: '',
      isActive: true,
    });
    setIsUserModalOpen(true);
  };

  const openEditUser = (u: UserItem) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      password: '',
      isActive: u.isActive,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { ...userForm };
      if (editingUser) payload.id = editingUser.id;

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'उपयोगकर्ता सहेजने में विफल');

      if (editingUser) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...data.user } : u)));
        setFeedback('उपयोगकर्ता विवरण सफलतापूर्वक अपडेट किया गया!');
      } else {
        setUsers([...users, { ...data.user, createdAt: new Date().toISOString() }]);
        setFeedback('नया व्यवस्थापक सफलतापूर्वक पंजीकृत किया गया!');
      }

      setIsUserModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (u: UserItem) => {
    if (u.id === currentUserId) {
      alert('आप अपना स्वयं का खाता नहीं हटा सकते');
      return;
    }

    if (!confirm(`क्या आप व्यवस्थापक "${u.name}" (${u.email}) को हटाना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटाने में विफल');

      setUsers(users.filter((item) => item.id !== u.id));
      setFeedback('व्यवस्थापक सफलतापूर्वक हटा दिया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ROLE CRUD HANDLERS ---
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      key: '',
      name: '',
      nameHindi: '',
      description: '',
      color: 'bg-amber-900/60 text-amber-200 border-amber-500/50',
    });
    setIsRoleModalOpen(true);
  };

  const openEditRole = (r: RoleConfig) => {
    setEditingRole(r);
    setRoleForm({
      key: r.key,
      name: r.name,
      nameHindi: r.nameHindi,
      description: r.description,
      color: r.color,
    });
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const action = editingRole ? 'UPDATE_ROLE' : 'CREATE_ROLE';
      const roleData = {
        ...roleForm,
        visibleModules: editingRole ? editingRole.visibleModules : ['/admin'],
      };

      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, roleData }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'रोल सहेजने में विफल');

      setRoles(data.roles);
      if (!editingRole) {
        setSelectedRoleKey(roleData.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_'));
      }
      setIsRoleModalOpen(false);
      setFeedback(editingRole ? 'रोल विवरण सफलतापूर्वक अपडेट हुआ!' : 'नया रोल सफलतापूर्वक बनाया गया!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleKey: string) => {
    if (roleKey === 'SUPER_ADMIN') {
      alert('Super Admin रोल को हटाया नहीं जा सकता');
      return;
    }

    if (!confirm(`क्या आप रोल "${roleKey}" को स्थायी रूप से हटाना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_ROLE',
          roleData: { key: roleKey },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'रोल हटाने में विफल');

      setRoles(data.roles);
      setSelectedRoleKey('SUPER_ADMIN');
      setFeedback('रोल सफलतापूर्वक हटा दिया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Section Visibility for Selected Role
  const handleToggleModule = (moduleId: string) => {
    if (!selectedRole || selectedRole.key === 'SUPER_ADMIN') return;

    const currentModules = selectedRole.visibleModules || [];
    const isVisible = currentModules.includes(moduleId);

    const updatedModules = isVisible
      ? currentModules.filter((id) => id !== moduleId)
      : [...currentModules, moduleId];

    setRoles(
      roles.map((r) => (r.key === selectedRole.key ? { ...r, visibleModules: updatedModules } : r))
    );
  };

  const handleSelectAllModules = () => {
    if (!selectedRole || selectedRole.key === 'SUPER_ADMIN') return;
    setRoles(
      roles.map((r) =>
        r.key === selectedRole.key ? { ...r, visibleModules: ADMIN_SECTIONS.map((s) => s.id) } : r
      )
    );
  };

  const handleDeselectAllModules = () => {
    if (!selectedRole || selectedRole.key === 'SUPER_ADMIN') return;
    setRoles(
      roles.map((r) => (r.key === selectedRole.key ? { ...r, visibleModules: ['/admin'] } : r))
    );
  };

  const handleSaveVisibility = async () => {
    if (!selectedRole) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ROLE',
          roleData: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'अनुमतियां सहेजने में विफल');

      setRoles(data.roles);
      setFeedback(`रोल "${selectedRole.name}" हेतु सेक्शन दृश्यता अनुमतियां सुरक्षित हो गईं!`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('क्या आप सभी रोल्स एवं सेक्शन दृश्यता को डिफ़ॉल्ट पर रीसेट करना चाहते हैं?')) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_DEFAULTS' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'रीसेट विफल');

      setRoles(data.roles);
      setFeedback('सभी रोल्स एवं सेक्शन दृश्यता डिफ़ॉल्ट पर रीसेट हो गई!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered users for Tab 1
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-maroon-900 to-black p-5 rounded-2xl border border-amber-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400 bg-black/40 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              Role-Based Access Control (RBAC) & Section Visibility
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-200 font-serif mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            प्रशासक, रोल्स एवं सेक्शन दृश्यता प्रबंधन
          </h1>
          <p className="text-xs text-stone-300 mt-0.5">
            सुपर एडमिन प्रत्येक रोल हेतु अनुमति प्राप्त मॉड्यूल्स/सेक्शन की दृश्यता जोड़, संशोधित व हटा सकते हैं।
          </p>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-amber-500/30 text-xs shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'USERS'
                ? 'bg-amber-500 text-maroon-950 shadow'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>प्रशासक उपयोगकर्ता ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ROLES')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'ROLES'
                ? 'bg-amber-500 text-maroon-950 shadow'
                : 'text-stone-300 hover:text-amber-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>रोल्स एवं सेक्शन दृश्यता ({roles.length})</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2 shadow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: USERS DIRECTORY & CRUD                           */}
      {/* ======================================================== */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-stone-850">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="नाम, ईमेल अथवा मोबाइल से खोजें..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/60 border border-amber-900/40 rounded-xl text-stone-200 text-xs focus:border-amber-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-black/60 border border-amber-900/40 rounded-xl px-3 py-2 text-xs text-amber-200 focus:border-amber-500"
              >
                <option value="">समस्त रोल्स (All Roles)</option>
                {roles.map((r) => (
                  <option key={r.key} value={r.key} className="bg-maroon-950 text-stone-200">
                    {r.nameHindi || r.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateUser}
              className="festive-btn-gold text-xs px-4 py-2 flex items-center justify-center gap-1.5 font-bold shadow active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4 text-maroon-950" />
              <span>नया व्यवस्थापक जोड़ें</span>
            </button>
          </div>

          {/* Users Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const badge = getRoleBadge(u.role);
              const isSelf = u.id === currentUserId;

              return (
                <div
                  key={u.id}
                  className="festive-card p-5 space-y-3 relative group hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-maroon-950 font-bold flex items-center justify-center text-base shadow shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-stone-100 text-base truncate flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono">
                                आप (You)
                              </span>
                            )}
                          </h4>
                          <span
                            className={`inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border mt-0.5 ${badge.color}`}
                          >
                            {badge.nameHindi}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditUser(u)}
                          className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-black/40 rounded-lg transition-colors"
                          title="संपादित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-black/40 rounded-lg transition-colors"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-300 bg-black/40 p-2.5 rounded-xl border border-stone-850">
                      <div className="flex items-center gap-2 font-mono truncate">
                        <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-2 font-mono">
                          <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-900/30 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="font-mono text-stone-500">
                      ID: {u.id.slice(-6)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        u.isActive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {u.isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> सक्रिय (Active)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> निष्क्रिय (Disabled)
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ROLES & SECTION VISIBILITY MANAGER                */}
      {/* ======================================================== */}
      {activeTab === 'ROLES' && (
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/40 p-3.5 rounded-2xl border border-stone-850">
            <div>
              <h3 className="text-base font-bold text-amber-200 font-serif">
                भूमिकाएं एवं सेक्शन अनुमतियां (Roles & Section Visibility)
              </h3>
              <p className="text-xs text-stone-400">
                सुपर एडमिन किसी भी रोल के लिए अनुमति प्राप्त मेनू सेक्शन को टिक/अनटिक कर तुरंत नियंत्रित कर सकते हैं।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetDefaults}
                className="bg-black/60 hover:bg-black/80 text-stone-300 hover:text-white border border-stone-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="सिस्टम डिफ़ॉल्ट पर रीसेट करें"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>डिफ़ॉल्ट रीसेट</span>
              </button>
              <button
                onClick={openCreateRole}
                className="festive-btn-gold text-xs px-3.5 py-2 flex items-center gap-1.5 font-bold shadow active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-maroon-950" />
                <span>नया रोल जोड़ें (Add Role)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Role Selector Pills (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 px-1">
                प्रशासनिक रोल्स सूची ({roles.length})
              </div>

              <div className="space-y-2">
                {roles.map((r) => {
                  const isSelected = selectedRoleKey === r.key;
                  const enabledCount = r.visibleModules?.length || 0;

                  return (
                    <div
                      key={r.key}
                      onClick={() => setSelectedRoleKey(r.key)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/50 shadow-glow-gold'
                          : 'bg-black/40 border-amber-900/40 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-100 text-sm truncate">
                            {r.nameHindi || r.name}
                          </h4>
                          {r.isSystem && (
                            <span className="text-[9px] bg-red-950/80 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-mono">
                              सिस्टम
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                          {r.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${r.color}`}
                          >
                            {r.key}
                          </span>
                          <span className="text-[10px] text-amber-300 font-mono">
                            {enabledCount} / {ADMIN_SECTIONS.length} सेक्शन
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditRole(r)}
                          className="p-1 text-stone-400 hover:text-amber-300 rounded"
                          title="रोल विवरण संपादित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!r.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(r.key)}
                            className="p-1 text-stone-400 hover:text-red-400 rounded"
                            title="रोल हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Section Visibility Checklist (lg:col-span-8) */}
            <div className="lg:col-span-8 bg-gradient-to-b from-maroon-950/80 to-black border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
              {selectedRole && (
                <>
                  {/* Selected Role Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/50 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                          सेक्शन दृश्यता अनुमति संपादक
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${selectedRole.color}`}
                        >
                          {selectedRole.key}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-amber-100 font-serif mt-0.5">
                        {selectedRole.nameHindi} ({selectedRole.name})
                      </h3>
                      <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                        {selectedRole.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleSaveVisibility}
                        disabled={loading}
                        className="festive-btn-gold text-xs px-5 py-2.5 flex items-center gap-1.5 font-bold shadow-lg"
                      >
                        <Check className="w-4 h-4 text-maroon-950" />
                        <span>अनुमतियां सुरक्षित करें (Save)</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Select / Deselect Bar */}
                  <div className="flex items-center justify-between text-xs bg-black/50 p-3 rounded-xl border border-stone-850">
                    <span className="text-stone-300">
                      सक्रिय अनुमतियां: <strong className="text-amber-300 font-mono">{selectedRole.visibleModules?.length || 0}</strong> / {ADMIN_SECTIONS.length}
                    </span>
                    {selectedRole.key !== 'SUPER_ADMIN' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSelectAllModules}
                          className="text-amber-400 hover:text-amber-300 underline font-semibold"
                        >
                          सभी चुनें (All)
                        </button>
                        <span className="text-stone-600">|</span>
                        <button
                          onClick={handleDeselectAllModules}
                          className="text-stone-400 hover:text-stone-200 underline font-semibold"
                        >
                          हटाएं (Clear)
                        </button>
                      </div>
                    ) : (
                      <span className="text-amber-400 font-bold text-[11px]">
                        ★ सुपर एडमिन को समस्त 18 मॉड्यूल्स का सर्वाधिकार प्राप्त है
                      </span>
                    )}
                  </div>

                  {/* Checklist of all 18 Sections */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                    {ADMIN_SECTIONS.map((sec) => {
                      const isChecked = selectedRole.visibleModules?.includes(sec.id);
                      const isSuperAdmin = selectedRole.key === 'SUPER_ADMIN';

                      return (
                        <label
                          key={sec.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'bg-amber-500/10 border-amber-500/50 text-stone-100'
                              : 'bg-black/40 border-stone-850 text-stone-400 opacity-75'
                          } ${isSuperAdmin ? 'cursor-not-allowed' : 'hover:border-amber-400'}`}
                        >
                          <div className="min-w-0 flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isSuperAdmin}
                              onChange={() => handleToggleModule(sec.id)}
                              className="w-4 h-4 rounded border-amber-600 text-amber-500 focus:ring-amber-500 focus:ring-offset-0 bg-black cursor-pointer"
                            />
                            <div>
                              <div className="font-bold text-xs text-stone-200">
                                {sec.label}
                              </div>
                              <span className="text-[10px] text-stone-500 font-mono block">
                                {sec.id}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                              isChecked
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-stone-800 text-stone-500'
                            }`}
                          >
                            {isChecked ? 'दृश्य (Visible)' : 'अदृश्य (Hidden)'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT USER                                   */}
      {/* ======================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1">
              {editingUser ? 'व्यवस्थापक विवरण संपादित करें' : 'नया प्रशासनिक उपयोगकर्ता जोड़ें'}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              प्रशासक का नाम, ईमेल, भूमिका (Role) एवं गोपनीय पासवर्ड निर्धारित करें।
            </p>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="उदा. अमरनाथ प्रसाद"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">ईमेल पता (Login Email) *</label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingUser)}
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="admin@kalipujaparora.org"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">मोबाइल नंबर</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="6203510983"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">प्रशासनिक भूमिका (Assigned Role) *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-amber-200 font-bold"
                >
                  {roles.map((r) => (
                    <option key={r.key} value={r.key} className="bg-maroon-950 text-stone-200">
                      {r.nameHindi || r.name} ({r.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  {editingUser ? 'पासवर्ड बदलें (वैकल्पिक - छोड़ दें यदि समान रखना हो)' : 'गोपनीय पासवर्ड *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="न्यूनतम 6 वर्ण..."
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                  className="rounded border-amber-600 text-amber-500"
                />
                <label htmlFor="userActiveCheck" className="text-stone-300 font-semibold cursor-pointer">
                  खाता सक्रिय रखें (Account Active)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-black/60 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-initial festive-btn-gold px-5 py-2.5 font-bold"
                >
                  {loading ? 'सहेज रहे हैं...' : editingUser ? 'अपडेट सुरक्षित करें' : 'उपयोगकर्ता बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT ROLE METADATA                         */}
      {/* ======================================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1">
              {editingRole ? 'रोल विवरण संपादित करें' : 'नया प्रशासनिक रोल बनाएं'}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              रोल का कोड, हिन्दी व अंग्रेजी नाम एवं संक्षिप्त विवरण दर्ज करें।
            </p>

            <form onSubmit={handleSaveRole} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  रोल कोड / Key (उदा. MEDIA_ADMIN) *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingRole)}
                  value={roleForm.key}
                  onChange={(e) => setRoleForm({ ...roleForm, key: e.target.value })}
                  placeholder="MEDIA_HEAD"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 font-mono uppercase disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">रोल नाम (हिन्दी में) *</label>
                <input
                  type="text"
                  required
                  value={roleForm.nameHindi}
                  onChange={(e) => setRoleForm({ ...roleForm, nameHindi: e.target.value })}
                  placeholder="उदा. मीडिया एवं प्रचार प्रमुख"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">रोल नाम (English) *</label>
                <input
                  type="text"
                  required
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="उदा. Media & PR Head"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">संक्षिप्त विवरण (Description)</label>
                <textarea
                  rows={2}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="उदा. प्रेस विज्ञप्ति, सोशल मीडिया एवं फोटोग्राफी गैलरी प्रबंधन दायित्व।"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-black/60 text-stone-300 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-initial festive-btn-gold px-5 py-2.5 font-bold"
                >
                  {loading ? 'सहेज रहे हैं...' : editingRole ? 'अपडेट सुरक्षित करें' : 'रोल बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
