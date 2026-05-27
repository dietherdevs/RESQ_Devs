import { useState, useEffect } from 'react';
import {
  ShieldCheck, Plus, Pencil, Trash2, X, Save, Search,
  ShieldAlert, CheckCircle, XCircle, User, Phone, MapPin,
  Lock, Crown,
} from 'lucide-react';
import { AdminUser } from '../../data/mockData'; 
import { useApp } from '../../context/AppContext';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

type AdminRole = 'admin' | 'superadmin';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  barangay: '',
  role: 'admin' as AdminRole,
  active: true,
};

const barangays = [
  'All', 'Sto. Niño', 'Parang', 'Nangka', 'Tumana',
  'Concepcion Uno', 'Concepcion Dos', 'Jesus de la Peña',
  'Kalumpang', 'Malanday', 'Marikina Heights', 'Sta. Elena',
];

const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('token') || '';

export function ManageAdmins() {
  const { user: currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  // SPEED HACK: Instantly load cached admins
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const cached = localStorage.getItem('manage_admins_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Error and Success states for UI feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/admin/manage-admins`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
        localStorage.setItem('manage_admins_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#FEF2F2' }}>
          <Lock size={36} className="text-red-400" />
        </div>
        <h2 className="font-black text-2xl mb-2" style={{ color: NAVY }}>Super Admin Only</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          This section is restricted to Super Admins only. You do not have permission to manage admin accounts.
        </p>
      </div>
    );
  }

  const filtered = admins.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.barangay?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setError('');
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (a: AdminUser) => {
    setError('');
    setForm({ name: a.name, email: a.email, phone: a.phone || '', barangay: a.barangay || '', role: a.role as AdminRole, active: a.active });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
        setError("Name and Email are required.");
        return;
    }

    setIsSaving(true);
    setError('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const url = editId !== null ? `${apiUrl}/admin/manage-admins/${editId}` : `${apiUrl}/admin/manage-admins`;
      const method = editId !== null ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        if (editId !== null) {
          const updatedAdmins = admins.map(a => a.id === editId ? data : a);
          setAdmins(updatedAdmins);
          localStorage.setItem('manage_admins_cache', JSON.stringify(updatedAdmins));
          setSuccess('Admin updated successfully.');
        } 
        else {
          const updatedAdmins = [...admins, data.admin];
          setAdmins(updatedAdmins);
          localStorage.setItem('manage_admins_cache', JSON.stringify(updatedAdmins));
          setSuccess(data.message); 
        }
        
        setShowForm(false);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Failed to save admin. Email might already exist.');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
      console.error('Error saving admin:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/admin/manage-admins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const updatedAdmins = admins.filter(a => a.id !== id);
        setAdmins(updatedAdmins);
        localStorage.setItem('manage_admins_cache', JSON.stringify(updatedAdmins));
        setDeleteConfirm(null);
        setSuccess('Admin removed successfully.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const toggleActive = async (id: number) => {
    const admin = admins.find(a => a.id === id);
    if (!admin) return;

    // Optimistic UI + Cache Update
    const updatedAdmins = admins.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setAdmins(updatedAdmins);
    localStorage.setItem('manage_admins_cache', JSON.stringify(updatedAdmins));

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      await fetch(`${apiUrl}/admin/manage-admins/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ active: !admin.active })
      });
    } catch (error) {
      console.error('Error toggling status:', error);
      fetchAdmins(); // Revert on fail
    }
  };

  const superAdminCount = admins.filter(a => a.role === 'superadmin').length;
  const adminCount = admins.filter(a => a.role === 'admin').length;
  const activeCount = admins.filter(a => a.active).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-black text-2xl" style={{ color: NAVY }}>Manage Admins</h1>
            <span
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: `${ORANGE}15`, color: ORANGE }}
            >
              <Crown size={11} /> Super Admin Only
            </span>
          </div>
          <p className="text-gray-500 text-sm">Add, remove, or modify staff and admin accounts</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
          <CheckCircle size={20} className="text-green-500" />
          <p className="text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Super Admins', value: superAdminCount, color: ORANGE, bg: '#FFEDD5', icon: <Crown size={16} /> },
          { label: 'Admins', value: adminCount, color: YELLOW, bg: '#FEF9C3', icon: <ShieldCheck size={16} /> },
          { label: 'Active Accounts', value: activeCount, color: '#22C55E', bg: '#DCFCE7', icon: <CheckCircle size={16} /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Security Notice */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4 border"
        style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}
      >
        <ShieldAlert size={20} style={{ color: YELLOW }} className="flex-shrink-0" />
        <div>
          <p className="font-bold text-sm" style={{ color: '#92400E' }}>Strict Access Control Zone</p>
          <p className="text-xs text-yellow-700 mt-0.5">
            This page is accessible only to Super Admins. All changes are logged. Avoid creating duplicate accounts or revoking access without authorization.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
        <Search size={15} className="text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or barangay..."
          className="flex-1 text-sm focus:outline-none"
          style={{ color: NAVY }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ backgroundColor: '#F9FAFB' }}>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Admin</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Barangay</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                        style={{ background: a.role === 'superadmin' ? `linear-gradient(135deg, ${ORANGE}, #e85a1a)` : `linear-gradient(135deg, ${YELLOW}, #e0a000)` }}
                      >
                        {a.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm" style={{ color: NAVY }}>{a.name}</p>
                          {a.id === parseInt(currentUser?.id || '0') && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: '#F0FDF4', color: '#166534' }}>
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{a.phone || 'N/A'}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin size={11} className="text-gray-400" />
                      {a.barangay || 'N/A'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{a.createdAt || 'N/A'}</td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: a.role === 'superadmin' ? `${ORANGE}15` : `${YELLOW}20`,
                        color: a.role === 'superadmin' ? ORANGE : '#92400E',
                      }}
                    >
                      {a.role === 'superadmin' ? <Crown size={10} /> : <ShieldCheck size={10} />}
                      {a.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleActive(a.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all"
                      style={{
                        backgroundColor: a.active ? '#DCFCE7' : '#F3F4F6',
                        color: a.active ? '#166534' : '#6B7280',
                      }}
                    >
                      {a.active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {a.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
                        title="Edit admin"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(a.id)}
                        disabled={a.role === 'superadmin' && superAdminCount <= 1}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={a.role === 'superadmin' && superAdminCount <= 1 ? 'Cannot delete the last super admin' : 'Delete admin'}
                      >
                        <Trash2 size={13} />
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
          {filtered.map(a => (
            <div key={a.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: a.role === 'superadmin' ? ORANGE : YELLOW }}
                  >
                    {a.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: NAVY }}>{a.name}</p>
                    <p className="text-xs text-gray-400">{a.email}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-blue-50 text-blue-400">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setDeleteConfirm(a.id)} className="p-1.5 rounded-lg bg-red-50 text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: a.role === 'superadmin' ? `${ORANGE}15` : `${YELLOW}20`, color: a.role === 'superadmin' ? ORANGE : '#92400E' }}
                >
                  {a.role === 'superadmin' ? <Crown size={10} /> : <ShieldCheck size={10} />}
                  {a.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: a.active ? '#DCFCE7' : '#F3F4F6', color: a.active ? '#166534' : '#6B7280' }}
                >
                  {a.active ? 'Active' : 'Inactive'}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400 px-2">
                  <MapPin size={10} />{a.barangay || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ShieldCheck size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-gray-400 text-sm">No admins found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ORANGE}15` }}>
                  <ShieldCheck size={16} style={{ color: ORANGE }} />
                </div>
                <h3 className="font-bold text-lg" style={{ color: NAVY }}>
                  {editId !== null ? 'Edit Admin Account' : 'Add Admin Account'}
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              
              {/* Form Level Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-red-600">
                  <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  placeholder="e.g. Admin Cruz"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  placeholder="admin@resq.gov.ph"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                    placeholder="09170000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Barangay</label>
                  <select
                    value={form.barangay}
                    onChange={e => setForm(p => ({ ...p, barangay: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  >
                    <option value="">Select</option>
                    {barangays.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['admin', 'superadmin'] as AdminRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, role: r }))}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border"
                      style={{
                        backgroundColor: form.role === r
                          ? (r === 'superadmin' ? `${ORANGE}15` : `${YELLOW}20`)
                          : '#F9FAFB',
                        color: form.role === r
                          ? (r === 'superadmin' ? ORANGE : '#92400E')
                          : '#9CA3AF',
                        borderColor: form.role === r
                          ? (r === 'superadmin' ? `${ORANGE}40` : `${YELLOW}60`)
                          : 'transparent',
                      }}
                    >
                      {r === 'superadmin' ? <Crown size={14} /> : <ShieldCheck size={14} />}
                      {r === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </button>
                  ))}
                </div>
                {form.role === 'superadmin' && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1.5">
                    <ShieldAlert size={11} />
                    Super Admins have full system access including this Manage Admins page.
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100" style={{ backgroundColor: '#F9FAFB' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: NAVY }}>Account Active</p>
                  <p className="text-xs text-gray-400">Allow this admin to log in</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                  className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                  style={{ backgroundColor: form.active ? '#22C55E' : '#D1D5DB' }}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.active ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !form.name.trim() || !form.email.trim()}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}
              >
                {isSaving ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : <Save size={14} />}
                {editId !== null ? 'Save Changes' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg mb-1" style={{ color: NAVY }}>Remove Admin?</h3>
            <p className="text-gray-500 text-sm mb-2">
              You are about to remove{' '}
              <span className="font-bold" style={{ color: NAVY }}>
                {admins.find(a => a.id === deleteConfirm)?.name}
              </span>{' '}
              from the admin team.
            </p>
            <p className="text-xs text-gray-400 mb-6">This action cannot be undone and will immediately revoke their access.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm bg-red-500 flex items-center justify-center gap-2"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}