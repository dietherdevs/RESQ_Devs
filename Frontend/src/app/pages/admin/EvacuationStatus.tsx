import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Save, X, CheckCircle, AlertTriangle, XCircle, MapPin, Phone, Trash2 } from 'lucide-react';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

type Status = 'open' | 'full' | 'closed';

const statusConfig = {
  open: { label: 'Open', color: '#22C55E', bg: '#DCFCE7', icon: <CheckCircle size={14} /> },
  full: { label: 'Full', color: ORANGE, bg: '#FFEDD5', icon: <AlertTriangle size={14} /> },
  closed: { label: 'Closed', color: '#6B7280', bg: '#F3F4F6', icon: <XCircle size={14} /> },
};

interface EvacCenter {
  id: number;
  name: string;
  location: string;
  contact: string[];
  capacity: number;
  current: number;
  status: Status;
}

interface EditForm {
  id: number | null;
  name: string;
  location: string;
  contact: string;
  capacity: number;
  current: number;
  status: Status;
}

const empty: EditForm = { id: null, name: '', location: '', contact: '', capacity: 200, current: 0, status: 'open' };

export function EvacuationStatus() {
  const [centers, setCenters] = useState<EvacCenter[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EditForm>(empty);
  const [deleteTarget, setDeleteTarget] = useState<EvacCenter | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch from Laravel
  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/admin/evacuation-centers', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        // Convert Laravel contact string back to array for UI
        const mapped = result.data.map((c: any) => ({
          ...c,
          contact: c.contact ? c.contact.split(',').map((s: string) => s.trim()) : []
        }));
        setCenters(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch centers", error);
    }
  };

  const handleEdit = (c: EvacCenter) => {
    setForm({ id: c.id, name: c.name, location: c.location, contact: c.contact.join(', '), capacity: c.capacity, current: c.current, status: c.status });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleAdd = () => {
    setForm(empty);
    setEditId(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const url = editId 
        ? `http://localhost:8000/api/admin/evacuation-centers/${editId}` 
        : 'http://localhost:8000/api/admin/evacuation-centers';
        
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          contact: form.contact,
          capacity: form.capacity,
          current: form.current,
          status: form.status
        })
      });

      if (response.ok) {
        await fetchCenters(); // Refresh list
        setShowForm(false);
        setEditId(null);
      }
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/admin/evacuation-centers/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        setCenters(prev => prev.filter(c => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  // Auto-save status changes directly to API
  const handleStatusChange = async (id: number, status: Status) => {
    const center = centers.find(c => c.id === id);
    if (!center) return;
    
    const newCurrent = status === 'closed' ? 0 : center.current;
    
    // Optimistic UI update
    setCenters(prev => prev.map(c => c.id === id ? { ...c, status, current: newCurrent } : c));

    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`http://localhost:8000/api/admin/evacuation-centers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: JSON.stringify({ ...center, status, current: newCurrent, contact: center.contact.join(',') })
      });
    } catch (error) {
      fetchCenters(); // Revert on fail
    }
  };

  // Auto-save occupancy inline
  const handleOccupancyBlur = async (id: number, newCurrent: number) => {
    const center = centers.find(c => c.id === id);
    if (!center) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`http://localhost:8000/api/admin/evacuation-centers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: JSON.stringify({ ...center, current: newCurrent, contact: center.contact.join(',') })
      });
    } catch (error) {
      fetchCenters();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black text-2xl" style={{ color: NAVY }}>Evacuation Status</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and update evacuation center information</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}
        >
          <Plus size={16} /> Add Center
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        {(['open', 'full', 'closed'] as Status[]).map(s => {
          const count = centers.filter(c => c.status === s).length;
          const sc = statusConfig[s];
          return (
            <div key={s} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: sc.bg, color: sc.color }}>
                {sc.icon}
              </div>
              <p className="font-black text-2xl" style={{ color: sc.color }}>{count}</p>
              <p className="text-xs text-gray-400 font-medium capitalize">{sc.label} Centers</p>
            </div>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {centers.map(center => {
          const sc = statusConfig[center.status];
          const pct = center.status === 'closed' ? 0 : Math.round((center.current / center.capacity) * 100);
          const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? ORANGE : '#22C55E';

          return (
            <div key={center.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-2">
                  <h3 className="font-bold text-sm" style={{ color: NAVY }}>{center.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-gray-400" />
                    <p className="text-xs text-gray-400 truncate">{center.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(center)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    title="Edit Center"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(center)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                    title="Delete Center"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Capacity */}
              {center.status !== 'closed' && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 font-medium">Capacity</span>
                    <span className="font-bold" style={{ color: barColor }}>{center.current}/{center.capacity} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                </div>
              )}

              {/* Current occupancy edit */}
              <div className="mb-3">
                <label className="text-xs text-gray-400 font-medium block mb-1">Current Occupancy</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={center.current}
                    min={0}
                    max={center.capacity}
                    onChange={e => setCenters(prev => prev.map(c => c.id === center.id ? { ...c, current: Math.min(+e.target.value, c.capacity) } : c))}
                    onBlur={e => handleOccupancyBlur(center.id, Math.min(+e.target.value, center.capacity))}
                    disabled={center.status === 'closed'}
                    className="w-full px-3 py-1.5 rounded-lg border text-sm font-semibold focus:outline-none disabled:opacity-40"
                    style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  />
                  <span className="text-xs text-gray-400 flex-shrink-0">/ {center.capacity}</span>
                </div>
              </div>

              {/* Status Buttons */}
              <div>
                <p className="text-xs text-gray-400 font-medium mb-2">Status</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['open', 'full', 'closed'] as Status[]).map(s => {
                    const sc2 = statusConfig[s];
                    const isActive = center.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(center.id, s)}
                        className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{
                          backgroundColor: isActive ? sc2.bg : 'transparent',
                          color: isActive ? sc2.color : '#9CA3AF',
                          border: `1px solid ${isActive ? sc2.color + '40' : 'rgba(0,0,0,0.08)'}`,
                        }}
                      >
                        {sc2.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Add Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-lg" style={{ color: NAVY }}>
                {editId !== null ? 'Edit Evacuation Center' : 'Add Evacuation Center'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Center Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  placeholder="e.g. Marikina Sports Center" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location *</label>
                <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  placeholder="Full address" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Contact Numbers (comma-separated)</label>
                <input value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
                  placeholder="(02) 8646-3651, 09171234567" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Capacity</label>
                  <input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: +e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Current Occupancy</label>
                  <input type="number" value={form.current} onChange={e => setForm(p => ({ ...p, current: +e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['open', 'full', 'closed'] as Status[]).map(s => {
                    const sc = statusConfig[s];
                    return (
                      <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                        className="py-2 rounded-xl text-sm font-bold transition-all"
                        style={{ backgroundColor: form.status === s ? sc.bg : '#F9FAFB', color: form.status === s ? sc.color : '#9CA3AF', border: `1px solid ${form.status === s ? sc.color + '40' : 'transparent'}` }}>
                        {sc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}>
                {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={14} />} 
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FEE2E2' }}>
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-black text-lg mb-1" style={{ color: NAVY }}>Delete Center</h3>
              <p className="text-gray-500 text-sm">
                Are you sure you want to delete <span className="font-bold" style={{ color: NAVY }}>{deleteTarget.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ backgroundColor: '#EF4444' }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}