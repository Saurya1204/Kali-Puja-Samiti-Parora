'use client';

import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Phone,
  CheckCircle2,
  Shield,
  HeartHandshake,
  X,
  Edit2,
  Trash2,
  Camera,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';

export interface MemberItem {
  id: string;
  name: string;
  nameHindi?: string | null;
  designation: string;
  designationHindi?: string | null;
  roleCategory: string;
  phone?: string | null;
  message?: string | null;
  photoUrl?: string | null;
  sortOrder?: number;
}

export interface VolunteerItem {
  id: string;
  name: string;
  phone: string;
  village?: string | null;
  preferredRole?: string | null;
  status: string;
  assignedTask?: string | null;
}

export default function CommitteeManager({
  initialMembers,
  initialVolunteers,
  festivalYear,
}: {
  initialMembers: MemberItem[];
  initialVolunteers: VolunteerItem[];
  festivalYear: number;
}) {
  const [members, setMembers] = useState<MemberItem[]>(initialMembers);
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>(initialVolunteers);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [memberForm, setMemberForm] = useState({
    name: '',
    nameHindi: '',
    designation: '',
    designationHindi: '',
    roleCategory: 'OFFICE_BEARER',
    phone: '',
    message: '',
    photoUrl: '',
    sortOrder: 0,
  });

  const openCreateMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      nameHindi: '',
      designation: '',
      designationHindi: '',
      roleCategory: 'OFFICE_BEARER',
      phone: '',
      message: '',
      photoUrl: '',
      sortOrder: members.length + 1,
    });
    setIsMemberModalOpen(true);
  };

  const openEditMember = (m: MemberItem) => {
    setEditingMember(m);
    setMemberForm({
      name: m.name,
      nameHindi: m.nameHindi || m.name,
      designation: m.designation,
      designationHindi: m.designationHindi || m.designation,
      roleCategory: m.roleCategory || 'OFFICE_BEARER',
      phone: m.phone || '',
      message: m.message || '',
      photoUrl: m.photoUrl || '',
      sortOrder: m.sortOrder || 0,
    });
    setIsMemberModalOpen(true);
  };

  // Image Upload with client-side canvas compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज (JPG, PNG, WebP) फाइल चुनें।');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 700;
        const MAX_HEIGHT = 700;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setMemberForm((prev) => ({ ...prev, photoUrl: dataUrl }));
        }
        setIsUploadingPhoto(false);
      };
      img.onerror = () => {
        setIsUploadingPhoto(false);
        alert('इमेज प्रोसेस करने में त्रुटि');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      alert('फाइल पढ़ने में त्रुटि');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        action: editingMember ? 'UPDATE_MEMBER' : 'ADD_MEMBER',
        memberData: {
          ...memberForm,
          ...(editingMember ? { id: editingMember.id } : {}),
        },
      };

      const res = await fetch('/api/admin/committee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहेजने में विफल');

      if (editingMember) {
        setMembers(members.map((m) => (m.id === editingMember.id ? data.member : m)));
        setFeedback('समिति सदस्य का विवरण एवं फोटो सफलतापूर्वक अपडेट हुआ!');
      } else {
        setMembers([...members, data.member]);
        setFeedback('नया समिति सदस्य सफलतापूर्वक जोड़ा गया!');
      }

      setIsMemberModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (m: MemberItem) => {
    if (!confirm(`क्या आप "${m.nameHindi || m.name}" को समिति सूची से हटाना चाहते हैं?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/committee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_MEMBER',
          memberData: { id: m.id },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटाने में विफल');

      setMembers(members.filter((item) => item.id !== m.id));
      setFeedback('समिति सदस्य सफलतापूर्वक हटा दिया गया।');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (volId: string, task: string) => {
    try {
      const res = await fetch('/api/admin/committee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_VOLUNTEER',
          volunteerData: { id: volId, assignedTask: task, status: 'ASSIGNED' },
        }),
      });

      if (!res.ok) throw new Error('टास्क आवंटन विफल');

      setVolunteers(
        volunteers.map((v) => (v.id === volId ? { ...v, assignedTask: task, status: 'ASSIGNED' } : v))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/40 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
            Executive Body & Volunteer Force
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
            समिति कार्यकारिणी एवं वालंटियर प्रबंधन ({festivalYear})
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            समिति पदाधिकारी, सलाहकार मंडल, खेल व शिक्षा संयोजक एवं पंजीकृत स्वयंसेवक दायित्व
          </p>
        </div>

        <button
          onClick={openCreateMember}
          className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold cursor-pointer active:scale-95 shadow"
        >
          <PlusCircle className="w-4 h-4 text-maroon-950" />
          <span>नया समिति सदस्य जोड़ें</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* COMMITTEE MEMBERS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-amber-300 text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>कार्यकारिणी सदस्य एवं पदाधिकारी (Committee Members)</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">कुल सदस्य: {members.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              className="festive-card p-5 space-y-3 relative group hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Photo / Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-maroon-900 border-2 border-amber-500/50 overflow-hidden flex items-center justify-center text-amber-300 font-black text-lg shadow shrink-0">
                      {m.photoUrl ? (
                        <img
                          src={m.photoUrl}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{m.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-stone-100 text-base truncate">
                        {m.nameHindi || m.name}
                      </h4>
                      <span className="text-xs text-amber-400 font-semibold block leading-tight truncate">
                        {m.designationHindi || m.designation}
                      </span>
                      {m.nameHindi && m.nameHindi !== m.name && (
                        <span className="text-[10px] text-stone-400 block font-mono">
                          {m.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Edit / Delete action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditMember(m)}
                      className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-black/40 rounded-lg transition-colors"
                      title="सदस्य संपादित करें"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(m)}
                      className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-black/40 rounded-lg transition-colors"
                      title="सदस्य हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {m.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-stone-300 font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-stone-850">
                    <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{m.phone}</span>
                  </div>
                )}

                {m.message && (
                  <p className="text-xs text-stone-300 italic bg-black/30 p-2.5 rounded-xl border border-stone-850 leading-relaxed">
                    "{m.message}"
                  </p>
                )}
              </div>

              {/* Footer tag */}
              <div className="pt-2 border-t border-amber-900/30 flex items-center justify-between text-[11px] text-stone-400">
                <span className="font-mono text-amber-400/80 uppercase">
                  {m.roleCategory?.replace('_', ' ') || 'OFFICE BEARER'}
                </span>
                {m.photoUrl ? (
                  <span className="text-emerald-400 font-medium">✓ फोटो अपलोड है</span>
                ) : (
                  <span className="text-stone-500">फोटो नहीं</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VOLUNTEER WORKFORCE */}
      <div className="festive-card p-6 space-y-4">
        <h3 className="font-bold text-amber-300 text-base flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-amber-400" />
          <span>पंजीकृत स्वयंसेवक एवं कार्य आवंटन (Volunteers Duty Roster)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-black/40 text-amber-400 uppercase">
                <th className="py-3 px-3">वालंटियर का नाम व गांव</th>
                <th className="py-3 px-3">मोबाइल</th>
                <th className="py-3 px-3">पसंदीदा कार्य</th>
                <th className="py-3 px-3">आवंटित दायित्व (Assigned Task)</th>
                <th className="py-3 px-3 text-center">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {volunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-amber-500/5">
                  <td className="py-3 px-3 font-bold text-stone-100">
                    {vol.name} {vol.village ? `(${vol.village})` : ''}
                  </td>
                  <td className="py-3 px-3 font-mono">{vol.phone}</td>
                  <td className="py-3 px-3 text-stone-400">{vol.preferredRole || 'सामान्य सहयोग'}</td>
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      defaultValue={vol.assignedTask || ''}
                      onBlur={(e) => handleAssignTask(vol.id, e.target.value)}
                      placeholder="दायित्व दर्ज करें (उदा. पार्किंग / भंडारा / सुरक्षा)..."
                      className="w-full px-2 py-1 bg-black/50 border border-stone-850 rounded text-stone-200 text-xs focus:border-amber-500"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        vol.status === 'ASSIGNED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {vol.status === 'ASSIGNED' ? 'दायित्व आवंटित' : 'प्रतीक्षारत'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD / EDIT COMMITTEE MEMBER MODAL --- */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsMemberModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-amber-200 font-serif mb-1">
              {editingMember ? 'समिति सदस्य विवरण संपादित करें' : 'नया समिति सदस्य जोड़ें'}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              पदाधिकारी का नाम, पद, फोन, संदेश एवं उनकी आधिकारिक फोटो अपलोड करें।
            </p>

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">नाम (हिन्दी में) *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.nameHindi}
                    onChange={(e) => setMemberForm({ ...memberForm, nameHindi: e.target.value })}
                    placeholder="उदा. श्री सिल्लू कुमार"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">नाम (English) *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    placeholder="उदा. Sillu Kumar"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">पद (हिन्दी में) *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.designationHindi}
                    onChange={(e) => setMemberForm({ ...memberForm, designationHindi: e.target.value })}
                    placeholder="उदा. अध्यक्ष / मुख्य संरक्षक / सचिव"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">पद (English) *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.designation}
                    onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })}
                    placeholder="उदा. President / Patron / Secretary"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  />
                </div>
              </div>

              {/* MEMBER PHOTO UPLOAD */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  सदस्य की फोटो (Member Photo)
                </label>
                <div className="p-3 rounded-2xl bg-black/60 border border-amber-900/60 space-y-2.5">
                  <div className="flex items-center gap-3">
                    {/* Live Preview Box */}
                    <div className="w-16 h-16 rounded-2xl bg-maroon-900/80 border-2 border-amber-500/50 overflow-hidden flex items-center justify-center shrink-0 shadow">
                      {memberForm.photoUrl ? (
                        <img
                          src={memberForm.photoUrl}
                          alt="सदस्य फोटो"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-amber-400 font-mono text-[10px] text-center px-1">फोटो नहीं</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-maroon-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow transition-all active:scale-95">
                        <Camera className="w-3.5 h-3.5" />
                        <span>गैलरी / कैमरे से फोटो चुनें</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      <p className="text-[10px] text-stone-400">
                        {isUploadingPhoto
                          ? 'फोटो प्रोसेस हो रही है...'
                          : 'मोबाइल गैलरी से फोटो चुनें या सीधे कैमरे से फोटो खींचें'}
                      </p>
                      {memberForm.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setMemberForm({ ...memberForm, photoUrl: '' })}
                          className="text-[10px] text-red-400 hover:text-red-300 underline block"
                        >
                          फोटो हटाएं (Remove Photo)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Or external URL */}
                  <div className="pt-1.5 border-t border-stone-800">
                    <input
                      type="url"
                      value={memberForm.photoUrl}
                      onChange={(e) => setMemberForm({ ...memberForm, photoUrl: e.target.value })}
                      placeholder="अथवा वेब इमेज लिंक (URL) दर्ज करें"
                      className="w-full px-2.5 py-1.5 bg-stone-900/80 border border-stone-800 rounded-lg text-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">मोबाइल नंबर</label>
                  <input
                    type="tel"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">श्रेणी (Category)</label>
                  <select
                    value={memberForm.roleCategory}
                    onChange={(e) => setMemberForm({ ...memberForm, roleCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                  >
                    <option value="OFFICE_BEARER" className="bg-maroon-950">मुख्य पदाधिकारी (Office Bearer)</option>
                    <option value="EXECUTIVE_MEMBER" className="bg-maroon-950">कार्यकारिणी सदस्य (Executive Member)</option>
                    <option value="ADVISORY_BOARD" className="bg-maroon-950">सलाहकार मंडल (Advisory Board)</option>
                    <option value="EVENT_COORDINATOR" className="bg-maroon-950">संयोजक / मार्गदर्शक (Coordinator)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">प्रेरणादायक संदेश / विचार</label>
                <textarea
                  rows={2}
                  value={memberForm.message}
                  onChange={(e) => setMemberForm({ ...memberForm, message: e.target.value })}
                  placeholder="उदा. समिति के प्रत्येक आयोजन में शुचिता, सेवा और जन-सहयोग की भावना ही परोरा का गौरव है।"
                  className="w-full px-3 py-2 bg-black/50 border border-amber-900/50 rounded-xl text-stone-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/40">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-black/60 hover:bg-black/80 text-stone-300 rounded-xl text-xs font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-initial festive-btn-gold px-5 py-2.5 text-xs font-bold"
                >
                  {loading ? 'सहेज रहे हैं...' : editingMember ? 'अपडेट सुरक्षित करें' : 'सदस्य जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
