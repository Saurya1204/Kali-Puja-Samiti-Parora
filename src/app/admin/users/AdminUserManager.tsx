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
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
}

const ROLE_DEFINITIONS: Record<
  string,
  { label: string; labelHi: string; color: string; desc: string }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    labelHi: 'सर्वोच्च व्यवस्थापक',
    color: 'bg-red-900/60 text-red-200 border-red-500/50',
    desc: 'समस्त मॉड्यूल, वित्तीय नियंत्रण, सेटिंग्स, यूजर प्रबंधन व ऑडिट लॉग्स का पूर्ण नियंत्रण।',
  },
  PRESIDENT: {
    label: 'President',
    labelHi: 'समिति अध्यक्ष',
    color: 'bg-amber-900/60 text-amber-200 border-amber-500/50',
    desc: 'कार्यकारिणी नेतृत्व, बिल स्वीकृति, मेधावी छात्र पुरस्कार अनुमोदन एवं समस्त मॉड्यूल्स की समीक्षा।',
  },
  SECRETARY: {
    label: 'Secretary',
    labelHi: 'महासचिव',
    color: 'bg-purple-900/60 text-purple-200 border-purple-500/50',
    desc: 'कार्यक्रम प्रबंधन, सूचनाएं, आधिकारिक सर्कुलर, पंजीकरण व समिति संचालन।',
  },
  TREASURER: {
    label: 'Treasurer',
    labelHi: 'कोषाध्यक्ष',
    color: 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50',
    desc: 'व्यय, बिल, भुगतान, बजट आवंटन, दान रसीदें, वेंडर बकाया व वित्तीय लेजर का पूर्ण CRUD।',
  },
  FINANCE_ADMIN: {
    label: 'Finance Admin',
    labelHi: 'वित्त व्यवस्थापक',
    color: 'bg-teal-900/60 text-teal-200 border-teal-500/50',
    desc: 'समस्त वित्तीय लेखा-जोखा, व्यय वाउचर, वेंडर डायरेक्टरी व दान प्रविष्टियां।',
  },
  KABADDI_ADMIN: {
    label: 'Kabaddi Admin',
    labelHi: 'कबड्डी मैच व्यवस्थापक',
    color: 'bg-blue-900/60 text-blue-200 border-blue-500/50',
    desc: 'कबड्डी टीमें, खिलाड़ी, मैच शेड्यूल, फिक्सचर्स, लाइव स्कोरिंग कंसोल व अंक तालिका का पूर्ण नियंत्रण।',
  },
  AWARDS_ADMIN: {
    label: 'Awards Admin',
    labelHi: 'मेधावी छात्र पुरस्कार व्यवस्थापक',
    color: 'bg-yellow-900/60 text-yellow-200 border-yellow-500/50',
    desc: 'छात्र उपलब्धि आवेदन, अंक सत्यापन, प्रमाण-पत्र समीक्षा, पुरस्कार श्रेणीकरण व पब्लिक वॉल ऑफ अचीवर्स।',
  },
  EVENT_MANAGER: {
    label: 'Event Manager',
    labelHi: 'कार्यक्रम समन्वयक',
    color: 'bg-pink-900/60 text-pink-200 border-pink-500/50',
    desc: 'सांस्कृतिक कार्यक्रम, धार्मिक अनुष्ठान, प्रतियोगिताएं, फोटो/वीडियो गैलरी व पब्लिक नोटिस।',
  },
  VOLUNTEER: {
    label: 'Volunteer',
    labelHi: 'सहयोगी / स्वयंसेवक',
    color: 'bg-stone-800 text-stone-300 border-stone-600',
    desc: 'पंजीकरण जांच, उपस्थिति एवं आयोजन सहयोग हेतु सीमित एक्सेस।',
  },
};

export default function AdminUserManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserItem[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'VOLUNTEER',
    password: '',
    isActive: true,
  });

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'KABADDI_ADMIN',
      password: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      password: '', // Blank unless updating password
      isActive: u.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        role: form.role,
        isActive: form.isActive,
      };

      if (editingUser) {
        payload.id = editingUser.id;
        if (form.password) payload.password = form.password;
      } else {
        if (!form.password) throw new Error('कृपया पासवर्ड दर्ज करें');
        payload.password = form.password;
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'उपयोगकर्ता सहेजने में विफल');

      if (editingUser) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...data.user } : u)));
        setFeedback('उपयोगकर्ता विवरण व रोल सफलतापूर्वक अपडेट किया गया!');
      } else {
        setUsers([data.user, ...users]);
        setFeedback('नया व्यवस्थापक खाता सफलतापूर्वक बनाया गया!');
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (u: UserItem) => {
    if (u.id === currentUserId) {
      alert('आप अपना स्वयं का खाता नहीं हटा सकते!');
      return;
    }
    if (!confirm(`क्या आप व्यवस्थापक "${u.name}" (${u.role}) का खाता हटाना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटाने में विफल');

      setUsers(users.filter((item) => item.id !== u.id));
      setFeedback('उपयोगकर्ता खाता सफलतापूर्वक हटा दिया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Role-Based Access Control (RBAC) & Accounts
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
            व्यवस्थापक एवं भूमिका प्रबंधन (Admin Users & Roles)
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            कबड्डी, मेधावी छात्र पुरस्कार, वित्त (खर्च/बिल), व कार्यक्रम व्यवस्थापकों के अधिकार प्रबंधित करें
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="festive-btn-gold flex items-center gap-2 text-xs shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>नया व्यवस्थापक जोड़ें (Add Admin)</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Role Matrix Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(ROLE_DEFINITIONS).map(([roleKey, meta]) => {
          const count = users.filter((u) => u.role === roleKey).length;
          return (
            <div
              key={roleKey}
              onClick={() => setRoleFilter(roleFilter === roleKey ? '' : roleKey)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                meta.color
              } ${roleFilter === roleKey ? 'ring-2 ring-amber-400 scale-[1.02]' : 'opacity-85 hover:opacity-100'}`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{meta.labelHi}</span>
                <span className="text-xs px-2 py-0.5 bg-black/40 rounded-full font-mono">
                  {count}
                </span>
              </div>
              <div className="text-[10px] opacity-75 font-mono mt-0.5">{meta.label}</div>
              <div className="text-[10px] mt-1 line-clamp-2 leading-relaxed opacity-90">
                {meta.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-black/40 p-3 rounded-xl border border-amber-900/30">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
          <input
            type="text"
            placeholder="नाम, ईमेल या फोन खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-maroon-950/80 border border-amber-900/50 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-maroon-950/80 border border-amber-900/50 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-400"
          >
            <option value="">समस्त रोल्स (All Roles)</option>
            {Object.entries(ROLE_DEFINITIONS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.labelHi} ({meta.label})
              </option>
            ))}
          </select>
          {roleFilter && (
            <button
              onClick={() => setRoleFilter('')}
              className="text-xs text-stone-400 hover:text-amber-300 underline"
            >
              रीसेट
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-maroon-950/40 border border-amber-600/30 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-maroon-950/80 text-amber-300 font-serif border-b border-amber-900/40 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">व्यवस्थापक (Name & Contact)</th>
                <th className="p-3">भूमिका (Assigned Role)</th>
                <th className="p-3">एक्सेस अनुमति (Module Access)</th>
                <th className="p-3">स्थिति (Status)</th>
                <th className="p-3 text-right">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/20 text-stone-200">
              {filtered.map((u) => {
                const meta = ROLE_DEFINITIONS[u.role] || {
                  label: u.role,
                  labelHi: u.role,
                  color: 'bg-stone-800 text-stone-200 border-stone-700',
                  desc: '',
                };

                return (
                  <tr key={u.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-stone-100 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.id === currentUserId && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                            (आप स्वयं)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-400/80" />
                          {u.email}
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-amber-400/80" />
                            {u.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.color}`}
                      >
                        {meta.labelHi}
                      </span>
                      <span className="block text-[10px] text-stone-400 font-mono mt-0.5">
                        {meta.label}
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                        {meta.desc}
                      </p>
                    </td>

                    <td className="p-3">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> सक्रिय (Active)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> निष्क्रिय (Inactive)
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg transition-all"
                          title="रोल व विवरण संपादित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUserId && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg transition-all"
                            title="व्यवस्थापक हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400 text-xs">
                    कोई व्यवस्थापक नहीं मिला।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-maroon-950 border border-amber-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              {editingUser ? 'व्यवस्थापक विवरण व रोल संपादित करें' : 'नया व्यवस्थापक खाता बनाएं'}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              संबंधित भूमिका (Role) का चयन करें। उसी आधार पर डैशबोर्ड और मॉड्यूल्स का एक्सेस उपलब्ध होगा।
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="उदा. राहुल कुमार"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">ईमेल पता (Email) *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@kalipujaparora.org"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">मोबाइल नंबर (Phone)</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  भूमिका एवं अधिकार (Role & Permissions) *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                >
                  {Object.entries(ROLE_DEFINITIONS).map(([key, meta]) => (
                    <option key={key} value={key} className="bg-maroon-950 text-stone-200">
                      {meta.labelHi} — ({meta.label})
                    </option>
                  ))}
                </select>
                <div className="mt-1.5 p-2 bg-black/40 border border-amber-900/40 rounded-lg text-[11px] text-stone-300">
                  <span className="font-semibold text-amber-300">अधिकार विवरण: </span>
                  {ROLE_DEFINITIONS[form.role]?.desc}
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1 flex items-center justify-between">
                  <span>पासवर्ड (Password) {editingUser ? '(बदलने हेतु ही भरें)' : '*'}</span>
                  <Lock className="w-3.5 h-3.5 text-stone-500" />
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingUser ? 'यथावत रखने हेतु खाली छोड़ें' : 'न्यूनतम 6 वर्ण...'}
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-amber-600 text-amber-500 focus:ring-0"
                />
                <label htmlFor="isActiveToggle" className="text-stone-300 font-semibold cursor-pointer">
                  खाता सक्रिय रखें (Allow login access)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-black/50 hover:bg-stone-900 text-stone-300 rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-5 py-2 cursor-pointer text-xs"
                >
                  {loading ? 'सहेज रहे हैं...' : editingUser ? 'अपडेट सुरक्षित करें' : 'खाता बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

