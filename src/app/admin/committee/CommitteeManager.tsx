'use client';

import React, { useState } from 'react';
import { Users, PlusCircle, Phone, CheckCircle2, Shield, HeartHandshake, X } from 'lucide-react';

interface MemberItem {
  id: string;
  name: string;
  nameHindi?: string | null;
  designation: string;
  designationHindi?: string | null;
  roleCategory: string;
  phone?: string | null;
  message?: string | null;
}

interface VolunteerItem {
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
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [memberForm, setMemberForm] = useState({
    name: '',
    nameHindi: '',
    designation: '',
    designationHindi: '',
    roleCategory: 'OFFICE_BEARER',
    phone: '',
    message: '',
  });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/committee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MEMBER',
          memberData: memberForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सहेजने में विफल');

      setMembers([...members, data.member]);
      setIsMemberModalOpen(false);
      setFeedback('समिति सदस्य सफलतापूर्वक जोड़ दिया गया!');
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
    <div className="space-y-8">
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
          onClick={() => setIsMemberModalOpen(true)}
          className="festive-btn-gold text-xs px-4 py-2 flex items-center gap-1.5 font-bold cursor-pointer"
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

      {/* COMMITTEE MEMBERS */}
      <div className="space-y-4">
        <h3 className="font-bold text-amber-300 text-base flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>कार्यकारिणी सदस्य एवं पदाधिकारी (Committee Members)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} className="festive-card p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-sm">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-stone-100 text-sm">{m.nameHindi || m.name}</h4>
                  <span className="text-xs text-amber-400 font-semibold block">
                    {m.designationHindi || m.designation}
                  </span>
                </div>
              </div>
              {m.phone && (
                <div className="flex items-center gap-1.5 text-xs text-stone-400 pt-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{m.phone}</span>
                </div>
              )}
              {m.message && (
                <p className="text-xs text-stone-400 italic bg-black/30 p-2 rounded-lg">
                  "{m.message}"
                </p>
              )}
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
                      className="w-full bg-black/40 border border-amber-800/40 rounded-lg px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        vol.status === 'ASSIGNED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {vol.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-maroon-950 to-black border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 mb-4">
              <h3 className="text-xl font-bold text-amber-300 font-serif">नया समिति सदस्य जोड़ें</h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">नाम (English) *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">नाम (हिंदी में) *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.nameHindi}
                    onChange={(e) => setMemberForm({ ...memberForm, nameHindi: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">पदनाम (Designation) *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Secretary / Vice President"
                    value={memberForm.designation}
                    onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })}
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-amber-200">पदनाम (हिंदी में) *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. सचिव / उपाध्यक्ष"
                    value={memberForm.designationHindi}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, designationHindi: e.target.value })
                    }
                    className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">मोबाइल नंबर</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-amber-200">शुभकामना संदेश</label>
                <textarea
                  rows={2}
                  value={memberForm.message}
                  onChange={(e) => setMemberForm({ ...memberForm, message: e.target.value })}
                  className="w-full bg-black/50 border border-amber-700/50 rounded-xl px-3 py-2 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-amber-900/50">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-300"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="festive-btn-gold px-6 py-2 font-bold cursor-pointer"
                >
                  {loading ? 'सहेजा जा रहा है...' : 'सदस्य जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
