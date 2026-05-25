import { useState, useEffect } from 'react'; // Added useEffect
import {
  UserCog, CheckCircle, XCircle, Clock, Eye, Search, X,
  ChevronDown, User, Phone, MapPin, Calendar, Image, ShieldOff,
} from 'lucide-react';
import { RegisteredUser } from '../../data/mockData'; 
import { useApp } from '../../context/AppContext';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

const REJECTION_REASONS = [
  'Invalid or unreadable ID',
  'ID photo does not match registration details',
  'Suspected duplicate account',
  'Incomplete registration information',
  'Fraudulent or tampered document',
  'Other (specify below)',
];

export function ManageUsers() {
  const { user: currentUser } = useApp();
  const isStaff = currentUser?.role === 'staff';

  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewId, setViewId] = useState<RegisteredUser | null>(null);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCustom, setRejectCustom] = useState('');
  const [approving, setApproving] = useState<number | null>(null);

  // ─── UPDATED: Fetch ALL users from Laravel for the History Tabs ────────────
  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/admin/users/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Map Laravel User model to your RegisteredUser interface
        const mapped = data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          address: u.address || 'N/A',
          registeredAt: new Date(u.created_at).toLocaleDateString(),
          status: u.status,
          smsEnabled: u.status === 'approved',
          idImage: u.id_image_path ? u.id_image_path.split('/').pop() : 'id-card.jpg',
          idImageUrl: u.id_image_url 
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchTab =
      tab === 'all' ||
      u.status === tab;
    return matchSearch && matchTab;
  });

  const counts = {
    all: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  };

  const handleApprove = async (id: number) => {
    setApproving(id);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/admin/users/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'approved', smsEnabled: true } : u));
      }
    } catch (err) {
      console.error("Approval failed:", err);
    } finally {
      setApproving(null);
    }
  };

  // ─── UPDATED: Reject Logic now updates status instead of removing user ─────
  const handleReject = async () => {
    if (rejectTarget === null) return;
    
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/admin/users/${rejectTarget}/reject`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Move the user to the rejected tab instead of filtering them out
        setUsers(prev => prev.map(u => u.id === rejectTarget ? { ...u, status: 'rejected', smsEnabled: false } : u));
      }
    } catch (err) {
      console.error("Rejection failed:", err);
    } finally {
      setRejectTarget(null);
      setRejectReason('');
      setRejectCustom('');
    }
  };

  const statusBadge = (status: RegisteredUser['status']) => {
    const cfg = {
      approved: { label: 'Approved', color: '#166534', bg: '#DCFCE7', icon: <CheckCircle size={11} /> },
      pending: { label: 'Pending', color: '#92400E', bg: '#FEF3C7', icon: <Clock size={11} /> },
      rejected: { label: 'Rejected', color: '#991B1B', bg: '#FEE2E2', icon: <XCircle size={11} /> },
    };
    const c = cfg[status];
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ backgroundColor: c.bg, color: c.color }}
      >
        {c.icon}{c.label}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div>
        <h1 className="font-black text-2xl" style={{ color: NAVY }}>Manage Users</h1>
        <p className="text-gray-500 text-sm mt-1">Review registrations, approve IDs, and manage user access</p>
        {isStaff && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: '#FFF7ED', color: '#FF6B2B', border: '1px solid #FFEDD5' }}>
            <ShieldOff size={13} />
            Staff Mode — View only. Approve/Reject actions are restricted.
          </div>
        )}
      </div>

      {/* Pending Alert Banner */}
      {counts.pending > 0 && (
        <div
          className="rounded-2xl p-4 flex items-center gap-4 border cursor-pointer"
          style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}
          onClick={() => setTab('pending')}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
            <Clock size={20} style={{ color: YELLOW }} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: '#92400E' }}>
              {counts.pending} Registration{counts.pending > 1 ? 's' : ''} Awaiting Approval
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Review submitted government IDs and approve or reject new user registrations.
            </p>
          </div>
          <ChevronDown size={16} style={{ color: YELLOW }} className="-rotate-90" />
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex bg-white rounded-xl border border-gray-100 shadow-sm p-1 gap-0.5">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
              style={{
                backgroundColor: tab === t
                  ? t === 'pending' ? YELLOW : t === 'approved' ? '#22C55E' : t === 'rejected' ? '#EF4444' : NAVY
                  : 'transparent',
                color: tab === t ? (t === 'pending' ? NAVY : 'white') : '#9CA3AF',
              }}
            >
              {t === 'pending' && counts.pending > 0 && tab !== 'pending' && (
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              )}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="text-[10px] opacity-70">({counts[t]})</span>
            </button>
          ))}
        </div>

        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Search size={15} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="flex-1 text-sm focus:outline-none"
            style={{ color: NAVY }}
          />
          {search && <button onClick={() => setSearch('')} className="text-gray-400"><X size={13} /></button>}
        </div>
      </div>

      {/* Pending Registrations Section */}
      {tab === 'pending' && (
        <div className="space-y-4">
          <h2 className="font-bold text-base" style={{ color: NAVY }}>Pending ID Verification</h2>
          {filtered.map(u => (
            <div key={u.id} className="bg-white rounded-2xl p-5 shadow-sm border border-yellow-100">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}
                  >
                    {u.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-base" style={{ color: NAVY }}>{u.name}</p>
                      {statusBadge(u.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11} />{u.phone}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} />{u.address}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={11} />Registered: {u.registeredAt}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setViewId(u)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all hover:bg-gray-50"
                    style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  >
                    <Image size={14} />
                    View ID
                  </button>
                  {!isStaff && (
                    <>
                      <button
                        onClick={() => handleApprove(u.id)}
                        disabled={approving === u.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-70"
                        style={{ backgroundColor: '#22C55E' }}
                      >
                        {approving === u.id ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : <CheckCircle size={14} />}
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(u.id)}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-sm transition-all"
                        style={{ backgroundColor: '#EF4444' }}
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </>
                  )}
                  {isStaff && (
                    <span className="text-xs text-gray-400 italic px-3 py-2 rounded-xl bg-gray-50">
                      Approval restricted to admins
                    </span>
                  )}
                </div>
              </div>

              {/* ID Image Display */}
              <div className="mt-4 p-4 rounded-xl border border-dashed border-yellow-200 bg-yellow-50 flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                  {/* Shows the physical image if available, else the icon */}
                  {u.idImageUrl ? (
                    <img src={u.idImageUrl} alt="ID" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Image size={20} style={{ color: YELLOW }} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#92400E' }}>Uploaded ID: {u.idImage}</p>
                  <p className="text-xs text-yellow-700 mt-0.5">Government-issued photo ID — click "View ID" to inspect</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-300" />
              <p className="text-gray-400 text-sm">No pending registrations</p>
            </div>
          )}
        </div>
      )}

      {/* All Users Table */}
      {tab !== 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100" style={{ backgroundColor: '#F9FAFB' }}>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Address</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Registered</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">SMS</th>
                  <th className="text-center px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ backgroundColor: ORANGE }}
                        >
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: NAVY }}>{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{u.phone}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-[160px] truncate">{u.address}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{u.registeredAt}</td>
                    <td className="px-5 py-4 text-center">{statusBadge(u.status)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs font-bold ${u.smsEnabled ? 'text-green-600' : 'text-gray-300'}`}>
                        {u.smsEnabled ? '● ON' : '○ OFF'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {u.status === 'pending' && !isStaff && (
                          <>
                            <button
                              onClick={() => handleApprove(u.id)}
                              disabled={approving === u.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                              style={{ backgroundColor: '#22C55E' }}
                            >
                              {approving === u.id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => setRejectTarget(u.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                              style={{ backgroundColor: '#EF4444' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setViewId(u)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition-colors"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-50">
            {filtered.map(u => (
              <div key={u.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: ORANGE }}>
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: NAVY }}>{u.name}</p>
                      <p className="text-xs text-gray-400">{u.phone}</p>
                    </div>
                  </div>
                  {statusBadge(u.status)}
                </div>
                {u.status === 'pending' && !isStaff && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleApprove(u.id)} className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: '#22C55E' }}>Approve</button>
                    <button onClick={() => setRejectTarget(u.id)} className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: '#EF4444' }}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <User size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-gray-400 text-sm">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* View ID Modal */}
      {viewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewId(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="font-bold text-lg" style={{ color: NAVY }}>Uploaded ID</h3>
                <p className="text-xs text-gray-400">{viewId.name}</p>
              </div>
              <button onClick={() => setViewId(null)} className="text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-6">
              {/* ID Preview */}
              <div
                className="w-full h-48 rounded-xl flex flex-col items-center justify-center border-2 border-dashed overflow-hidden"
                style={{ backgroundColor: '#F9FAFB', borderColor: 'rgba(0,0,0,0.1)' }}
              >
                {viewId.idImageUrl ? (
                   <img src={viewId.idImageUrl} alt="ID Large" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <Image size={40} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400 font-medium">{viewId.idImage}</p>
                    <p className="text-xs text-gray-300 mt-1">Government-issued photo ID</p>
                  </>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: NAVY }}>{viewId.name}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: NAVY }}>{viewId.phone}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 col-span-2">
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: NAVY }}>{viewId.address}</p>
                </div>
              </div>

              {viewId.status === 'pending' && !isStaff && (
                <div className="flex gap-3 mt-5">
                  <button onClick={() => { setViewId(null); handleApprove(viewId.id); }}
                    className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#22C55E' }}>
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button onClick={() => { setViewId(null); setRejectTarget(viewId.id); }}
                    className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#EF4444' }}>
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-lg" style={{ color: NAVY }}>Reject Registration</h3>
              <button onClick={() => setRejectTarget(null)} className="text-gray-400"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <XCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {users.find(u => u.id === rejectTarget)?.name} — Registration will be rejected
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Reason for Rejection *
                </label>
                <div className="space-y-2">
                  {REJECTION_REASONS.map(reason => (
                    <label key={reason} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="reason"
                        value={reason}
                        checked={rejectReason === reason}
                        onChange={() => setRejectReason(reason)}
                        className="mt-0.5 accent-red-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {rejectReason === 'Other (specify below)' && (
                <div>
                  <textarea
                    value={rejectCustom}
                    onChange={e => setRejectCustom(e.target.value)}
                    rows={3}
                    placeholder="Please specify the reason for rejection..."
                    className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none"
                    style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => setRejectTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button
                onClick={handleReject}
                disabled={!rejectReason || (rejectReason === 'Other (specify below)' && !rejectCustom.trim())}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#EF4444' }}
              >
                <XCircle size={14} /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}