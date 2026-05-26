import { useState, useEffect } from 'react'; 
import {
  X, Bell, Clock, ShieldCheck, Eye, EyeOff,
  Pencil, Check, KeyRound, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import resqLogo from '../../../imports/resq111.png';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';

function fieldClass(editing: boolean) {
  return `w-full px-3 py-2.5 rounded-lg text-sm border transition-colors focus:outline-none ${
    editing
      ? 'text-white border-orange-400/60 focus:border-orange-400'
      : 'text-white/80 border-white/10 cursor-default'
  }`;
}

export function ProfileModal() {
  const { showProfile, setShowProfile, user, logout, refreshUser } = useApp();
  
  // EXACT 1:1 DB MAPPING
  const [isApproved, setIsApproved] = useState(() => {
    const initial = user?.is_approved ?? false;
    return initial === true || initial === 1 || initial === "1";
  });

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState({
    firstName: user?.firstName ?? (user?.name?.split(' ')[0] ?? ''),
    lastName:  user?.lastName  ?? (user?.name?.split(' ').slice(1).join(' ') ?? ''),
    phone:     user?.phone     ?? '',
    address:   user?.address   ?? '',
  });
  const [editDraft, setEditDraft] = useState({ ...fields });

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (showProfile) {
      refreshUser();
    }
  }, [showProfile, refreshUser]);

  useEffect(() => {
    if (user) {
      // EXACT 1:1 DB MAPPING
      const current = user.is_approved ?? false;
      setIsApproved(current === true || current === 1 || current === "1");
      
      setFields({
        firstName: user.firstName ?? (user.name?.split(' ')[0] ?? ''),
        lastName:  user.lastName  ?? (user.name?.split(' ').slice(1).join(' ') ?? ''),
        phone:     user.phone     ?? '',
        address:   user.address   ?? '',
      });
    }
  }, [user]);

  if (!showProfile || !user) return null;

  const isNewUser = !user.verified;
  const initials = `${fields.firstName[0] ?? ''}${fields.lastName[0] ?? ''}`.toUpperCase() || user.name[0].toUpperCase();

  const roleColors: Record<string, { bg: string; text: string }> = {
    superadmin: { bg: ORANGE, text: 'white' },
    admin:      { bg: '#FFB800', text: NAVY },
    staff:      { bg: '#6366F1', text: 'white' },
    user:       { bg: '#22C55E', text: NAVY },
  };
  const rc = roleColors[user.role] ?? roleColors.user;

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...editDraft })
      });

      if (response.ok) {
        setFields({ ...editDraft });
        setEditing(false);
        setSaved(true);
        refreshUser(); 
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error("Profile update failed", e);
    }
  };

  const handleEditCancel = () => {
    setEditDraft({ ...fields });
    setEditing(false);
  };

  const toggleSms = async () => {
    const newValue = !isApproved;
    setIsApproved(newValue); // Optimistic UI update

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // SENDING EXACT DB COLUMN NAME
        body: JSON.stringify({ is_approved: newValue }) 
      });

      if (!response.ok) throw new Error("Failed to sync toggle with database");
      
      await response.json(); 
      refreshUser(); 
    } catch (e) {
      setIsApproved(!newValue); 
      console.error("SMS Toggle failed", e);
    }
  };

  const handlePwChange = (k: keyof typeof pwForm, v: string) => {
    setPwForm(prev => ({ ...prev, [k]: v }));
    setPwError('');
  };

  const handlePwSave = () => {
    if (!pwForm.current) { setPwError('Please enter your current password.'); return; }
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match.'); return; }
    setPwSaving(true);
    setTimeout(() => {
      setPwSaving(false);
      setPwSaved(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => { setPwSaved(false); setPwOpen(false); }, 2500);
    }, 1200);
  };

  const inStyle = (active: boolean) => ({
    backgroundColor: active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
  });

  const formatDob = (dob?: string) => {
    if (!dob) return '—';
    const d = new Date(dob);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatGender = (g?: string) => {
    if (!g) return '—';
    const map: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other', 'prefer-not': 'Prefer not to say' };
    return map[g] ?? g;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: NAVY, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div className="px-6 pt-6 pb-5 border-b border-white/10" style={{ background: 'linear-gradient(135deg, #0D1B2A, #132236)' }}>
          <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>

          <div className="mb-4">
            <img src={resqLogo} alt="RESQ" className="h-7 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #ff8c5a)` }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold text-lg leading-tight truncate">
                {fields.firstName} {fields.lastName}
              </h2>
              {user.username && (
                <p className="text-white/40 text-xs mt-0.5">@{user.username}</p>
              )}
              <p className="text-white/50 text-xs truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase"
                  style={{ backgroundColor: rc.bg, color: rc.text }}
                >
                  {user.role}
                </span>
                {isNewUser ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(255,184,0,0.15)', color: '#FFB800' }}>
                    <Clock size={10} /> Pending Verification
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Account Details ─────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: ORANGE }}>
                Account Details
              </h3>
              {!editing ? (
                <button
                  onClick={() => { setEditDraft({ ...fields }); setEditing(true); }}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: `${ORANGE}18`, color: ORANGE }}
                >
                  <Pencil size={11} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditCancel}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/20 text-white/60 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg text-white transition-all"
                    style={{ backgroundColor: ORANGE }}
                  >
                    <Check size={11} /> Save
                  </button>
                </div>
              )}
            </div>

            {saved && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <Check size={13} className="text-green-400" />
                <span className="text-xs font-semibold text-green-400">Changes saved successfully!</span>
              </div>
            )}

            <div className="rounded-xl overflow-hidden border border-white/10 divide-y divide-white/5">
              <div className="px-4 py-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">First Name</p>
                {editing ? (
                  <input
                    value={editDraft.firstName}
                    onChange={e => setEditDraft(d => ({ ...d, firstName: e.target.value }))}
                    className={fieldClass(true)}
                    style={inStyle(true)}
                    placeholder="First name"
                  />
                ) : (
                  <p className="text-sm text-white font-semibold">{fields.firstName || '—'}</p>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Last Name</p>
                {editing ? (
                  <input
                    value={editDraft.lastName}
                    onChange={e => setEditDraft(d => ({ ...d, lastName: e.target.value }))}
                    className={fieldClass(true)}
                    style={inStyle(true)}
                    placeholder="Last name"
                  />
                ) : (
                  <p className="text-sm text-white font-semibold">{fields.lastName || '—'}</p>
                )}
              </div>
              {user.username && (
                <div className="px-4 py-3" style={{ backgroundColor: 'transparent' }}>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Username</p>
                  <p className="text-sm text-white/60 font-semibold">@{user.username}</p>
                </div>
              )}
              <div className="px-4 py-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sm text-white/60 font-semibold">{user.email || '—'}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Phone Number</p>
                {editing ? (
                  <input
                    value={editDraft.phone}
                    onChange={e => setEditDraft(d => ({ ...d, phone: e.target.value }))}
                    className={fieldClass(true)}
                    style={inStyle(true)}
                    placeholder="09XXXXXXXXX"
                    type="tel"
                  />
                ) : (
                  <p className="text-sm text-white font-semibold">{fields.phone || '—'}</p>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-sm text-white/60 font-semibold">{formatDob(user.dob)}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Gender</p>
                <p className="text-sm text-white/60 font-semibold">{formatGender(user.gender)}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Home Address</p>
                {editing ? (
                  <input
                    value={editDraft.address}
                    onChange={e => setEditDraft(d => ({ ...d, address: e.target.value }))}
                    className={fieldClass(true)}
                    style={inStyle(true)}
                    placeholder="Barangay, Marikina City"
                  />
                ) : (
                  <p className="text-sm text-white font-semibold">{fields.address || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Change Password ─────────────────────────────── */}
          <div>
            <button
              onClick={() => { setPwOpen(o => !o); setPwError(''); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 transition-all hover:border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ORANGE}18` }}>
                  <KeyRound size={15} style={{ color: ORANGE }} />
                </div>
                <span className="text-sm font-semibold text-white">Change Password</span>
              </div>
              {pwOpen ? <ChevronUp size={15} className="text-white/40" /> : <ChevronDown size={15} className="text-white/40" />}
            </button>

            {pwOpen && (
              <div className="mt-2 rounded-xl border border-white/10 px-4 py-4 space-y-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                {[
                  { key: 'current' as const, label: 'Current Password', placeholder: 'Enter current password' },
                  { key: 'next'    as const, label: 'New Password',      placeholder: 'At least 8 characters' },
                  { key: 'confirm' as const, label: 'Confirm New Password', placeholder: 'Re-enter new password' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <div className="relative">
                      <input
                        type={showPw[f.key] ? 'text' : 'password'}
                        value={pwForm[f.key]}
                        onChange={e => handlePwChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400/60 focus:outline-none transition-colors"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(s => ({ ...s, [f.key]: !s[f.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPw[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwError && <p className="text-xs text-red-400 font-medium">{pwError}</p>}
                {pwSaved && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <Check size={13} className="text-green-400" />
                    <span className="text-xs font-semibold text-green-400">Password changed successfully!</span>
                  </div>
                )}

                <button
                  onClick={handlePwSave}
                  disabled={pwSaving}
                  className="w-full py-2.5 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}
                >
                  {pwSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Saving…
                    </span>
                  ) : 'Update Password'}
                </button>
              </div>
            )}
          </div>

          {/* ── SMS Alert Toggle ─────────────────────────────── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: ORANGE }}>
              Alert Settings
            </h3>
            <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mt-0.5" style={{ backgroundColor: 'rgba(255,107,43,0.15)' }}>
                    <Bell size={16} style={{ color: ORANGE }} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">SMS Flood Alerts</p>
                    <p className="text-white/40 text-xs mt-0.5">Receive SMS notifications for flood warnings and evacuation orders.</p>
                  </div>
                </div>

                {isNewUser ? (
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(255,184,0,0.15)', color: '#FFB800' }}>
                      <Clock size={11} /> Awaiting Verification
                    </div>
                    <p className="text-white/30 text-[10px] mt-1 text-right">Admin approval required</p>
                  </div>
                ) : (
                  <button
                    onClick={toggleSms}
                    className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                    style={{ backgroundColor: isApproved ? '#22C55E' : 'rgba(255,255,255,0.2)' }}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isApproved ? 'left-7' : 'left-1'}`} />
                  </button>
                )}
              </div>

              {!isNewUser && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isApproved ? 'bg-green-400' : 'bg-white/20'}`} />
                    <span className="text-xs text-white/50">
                      SMS Alerts are currently{' '}
                      <span className={`font-semibold ${isApproved ? 'text-green-400' : 'text-white/70'}`}>
                        {isApproved ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setShowProfile(false)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-white/20 text-white/70 hover:bg-white/5 transition-all"
            >
              Close
            </button>
            <button
              onClick={() => logout()}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 