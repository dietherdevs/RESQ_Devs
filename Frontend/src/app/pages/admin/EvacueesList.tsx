import { useState, useRef, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Search, X, Save, Accessibility, HeartPulse, Baby, UserCheck, Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

interface Evacuee {
  id: number;
  head: string;
  phone: string;
  address: string;
  total: number;
  pwd: number;
  seniors: number;
  pregnant: number;
  babies: number;
  center: string;
}

interface Center {
  id: number;
  name: string;
  capacity: number;
  current: number;
  status: string;
}

const emptyForm: Omit<Evacuee, 'id'> = {
  head: '', phone: '', address: '', total: 1, pwd: 0, seniors: 0, pregnant: 0, babies: 0, center: '',
};

const tags = [
  { key: 'pwd' as const, label: 'PWD', icon: <Accessibility size={13} />, color: '#6366F1', bg: '#EEF2FF' },
  { key: 'seniors' as const, label: 'Senior', icon: <UserCheck size={13} />, color: '#0EA5E9', bg: '#E0F2FE' },
  { key: 'pregnant' as const, label: 'Pregnant', icon: <HeartPulse size={13} />, color: '#EC4899', bg: '#FCE7F3' },
  { key: 'babies' as const, label: 'Baby', icon: <Baby size={13} />, color: '#F59E0B', bg: '#FEF3C7' },
];

export function EvacueesList() {
  const [evacuees, setEvacuees] = useState<Evacuee[]>([]);
  const [centersList, setCentersList] = useState<Center[]>([]); // Updated to hold full center objects
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Evacuee, 'id'>>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [saving, setSaving] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    Promise.all([fetchEvacuees(), fetchCentersList()]);
  }, []);

  const fetchEvacuees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiUrl}/admin/evacuees`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        setEvacuees(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch evacuees", error);
    }
  };

  const fetchCentersList = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiUrl}/admin/evacuation-centers`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        // Filter out closed or full centers, keeping only 'open' ones for the dropdown
        const available = result.data.filter((c: Center) => c.status === 'open');
        setCentersList(available);
      }
    } catch (error) {
      console.error("Failed to fetch centers list", error);
    }
  };

  const filtered = evacuees.filter(e =>
    e.head.toLowerCase().includes(search.toLowerCase()) ||
    e.address.toLowerCase().includes(search.toLowerCase()) ||
    (e.phone && e.phone.includes(search))
  );

  const totals = evacuees.reduce((acc, e) => ({
    people: acc.people + e.total,
    pwd: acc.pwd + e.pwd,
    seniors: acc.seniors + e.seniors,
    pregnant: acc.pregnant + e.pregnant,
    babies: acc.babies + e.babies,
  }), { people: 0, pwd: 0, seniors: 0, pregnant: 0, babies: 0 });

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  
  const openEdit = (e: Evacuee) => {
    setForm({ head: e.head, phone: e.phone, address: e.address, total: e.total, pwd: e.pwd, seniors: e.seniors, pregnant: e.pregnant, babies: e.babies, center: e.center });
    setEditId(e.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.head.trim() || !form.center.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = editId 
        ? `${apiUrl}/admin/evacuees/${editId}` 
        : `${apiUrl}/admin/evacuees`;

      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        await fetchEvacuees();
        // Also refresh the centers list so the "Available" count updates in the dropdown next time
        await fetchCentersList(); 
        setShowForm(false);
      }
    } catch (error) {
      console.error("Save error", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiUrl}/admin/evacuees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (response.ok) {
        setEvacuees(prev => prev.filter(e => e.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  // ── Export to Excel ──────────────────────────────────────────────────────
  const exportExcel = () => {
    const data = evacuees.map((e, i) => ({
      '#': i + 1,
      'Head of Family': e.head,
      'Phone': e.phone,
      'Address': e.address,
      'Evacuation Center': e.center,
      'Total Members': e.total,
      'PWD': e.pwd,
      'Senior Citizens': e.seniors,
      'Pregnant': e.pregnant,
      'Infants/Babies': e.babies,
    }));

    data.push({
      '#': 0,
      'Head of Family': '── TOTALS ──',
      'Phone': '',
      'Address': '',
      'Evacuation Center': '',
      'Total Members': totals.people,
      'PWD': totals.pwd,
      'Senior Citizens': totals.seniors,
      'Pregnant': totals.pregnant,
      'Infants/Babies': totals.babies,
    });

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 4 }, { wch: 24 }, { wch: 14 }, { wch: 30 }, { wch: 28 },
      { wch: 14 }, { wch: 6 }, { wch: 14 }, { wch: 10 }, { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Evacuees List');
    XLSX.writeFile(wb, `RESQ_Evacuees_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setShowExport(false);
  };

  // ── Export to PDF ────────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFillColor(13, 27, 42);
    doc.rect(0, 0, 297, 22, 'F');
    doc.setTextColor(255, 107, 43);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESQ — Real-Time Emergency System & Quick Alerts', 14, 10);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Marikina City Flood Evacuation — Evacuees List', 14, 17);
    doc.text(`Generated: ${new Date().toLocaleString('en-PH')}`, 220, 17);

    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Total Families: ${evacuees.length}   |   Total People: ${totals.people}   |   PWD: ${totals.pwd}   |   Seniors: ${totals.seniors}   |   Pregnant: ${totals.pregnant}   |   Babies: ${totals.babies}`, 14, 28);

    autoTable(doc, {
      startY: 32,
      head: [['#', 'Head of Family', 'Phone', 'Address', 'Evacuation Center', 'Total', 'PWD', 'Senior', 'Pregnant', 'Baby']],
      body: evacuees.map((e, i) => [
        i + 1,
        e.head,
        e.phone || '—',
        e.address,
        e.center,
        e.total,
        e.pwd || '—',
        e.seniors || '—',
        e.pregnant || '—',
        e.babies || '—',
      ]),
      foot: [['', 'TOTALS', '', '', '', totals.people, totals.pwd, totals.seniors, totals.pregnant, totals.babies]],
      headStyles: { fillColor: [13, 27, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [255, 107, 43], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        5: { halign: 'center', cellWidth: 12 },
        6: { halign: 'center', cellWidth: 10 },
        7: { halign: 'center', cellWidth: 14 },
        8: { halign: 'center', cellWidth: 14 },
        9: { halign: 'center', cellWidth: 10 },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(`RESQ_Evacuees_${new Date().toISOString().slice(0, 10)}.pdf`);
    setShowExport(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-black text-2xl" style={{ color: NAVY }}>Evacuees List</h1>
          <p className="text-gray-500 text-sm mt-1">{evacuees.length} family records · {totals.people} total people</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all hover:bg-gray-50"
              style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}
            >
              <Download size={15} />
              Export
              <ChevronDown size={13} className={`transition-transform ${showExport ? 'rotate-180' : ''}`} />
            </button>
            {showExport && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20">
                  <button
                    onClick={exportExcel}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                      <FileSpreadsheet size={14} style={{ color: '#16A34A' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Excel (.xlsx)</p>
                      <p className="text-xs text-gray-400">Spreadsheet format</p>
                    </div>
                  </button>
                  <div className="h-px bg-gray-50 mx-4" />
                  <button
                    onClick={exportPDF}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-red-50 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                      <FileText size={14} style={{ color: '#DC2626' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">PDF (.pdf)</p>
                      <p className="text-xs text-gray-400">Printable report</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}
          >
            <Plus size={16} /> Add Record
          </button>
        </div>
      </div>

      {/* Summary Tags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tags.map(tag => (
          <div key={tag.key} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tag.bg, color: tag.color }}>
              {tag.icon}
            </div>
            <div>
              <p className="font-black text-xl" style={{ color: tag.color }}>{totals[tag.key]}</p>
              <p className="text-xs text-gray-400">{tag.label}s</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
        <Search size={16} className="text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, address, or phone..."
          className="flex-1 text-sm focus:outline-none"
          style={{ color: NAVY }}
        />
        {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>}
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100" style={{ backgroundColor: '#F9FAFB' }}>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Head of Family</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Address</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">PWD</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Senior</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Pregnant</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Baby</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-sm" style={{ color: NAVY }}>{e.head}</p>
                    <p className="text-xs text-gray-400">{e.center}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{e.phone}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 max-w-[160px] truncate">{e.address}</td>
                  <td className="px-3 py-3.5 text-center">
                    <span className="font-bold text-sm" style={{ color: NAVY }}>{e.total}</span>
                  </td>
                  {tags.map(tag => (
                    <td key={tag.key} className="px-3 py-3.5 text-center">
                      {e[tag.key] > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: tag.bg, color: tag.color }}>
                          {e[tag.key]}
                        </span>
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Footer */}
            <tfoot>
              <tr style={{ backgroundColor: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
                <td className="px-5 py-3 text-xs font-black uppercase tracking-wider" style={{ color: NAVY }} colSpan={3}>
                  TOTALS — {evacuees.length} families
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="font-black text-sm" style={{ color: ORANGE }}>{totals.people}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="font-black text-sm" style={{ color: '#6366F1' }}>{totals.pwd}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="font-black text-sm" style={{ color: '#0EA5E9' }}>{totals.seniors}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="font-black text-sm" style={{ color: '#EC4899' }}>{totals.pregnant}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="font-black text-sm" style={{ color: '#F59E0B' }}>{totals.babies}</span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-50">
          {filtered.map(e => (
            <div key={e.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-sm" style={{ color: NAVY }}>{e.head}</p>
                  <p className="text-xs text-gray-400">{e.phone} · {e.address}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg bg-blue-50 text-blue-400"><Pencil size={12} /></button>
                  <button onClick={() => setDeleteConfirm(e.id)} className="p-1.5 rounded-lg bg-red-50 text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{e.total} people</span>
                {tags.map(tag => e[tag.key] > 0 && (
                  <span key={tag.key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: tag.bg, color: tag.color }}>
                    {tag.icon} {e[tag.key]} {tag.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-gray-400 text-sm">No records found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg" style={{ color: NAVY }}>{editId !== null ? 'Edit Evacuee Record' : 'Add Evacuee Record'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Head of Family *</label>
                <input value={form.head} onChange={e => setForm(p => ({ ...p, head: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }} placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }} placeholder="09171234567" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Members</label>
                  <input type="number" min={1} value={form.total} onChange={e => setForm(p => ({ ...p, total: +e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Address</label>
                <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }} placeholder="Barangay, Marikina City" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Evacuation Center *</label>
                <select value={form.center} onChange={e => setForm(p => ({ ...p, center: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none" style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY }}>
                  <option value="" disabled>Select center</option>
                  {centersList.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Available: {c.capacity - c.current})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vulnerability Counters</label>
                <div className="grid grid-cols-2 gap-2">
                  {tags.map(tag => (
                    <div key={tag.key} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: tag.bg }}>
                      <span style={{ color: tag.color }}>{tag.icon}</span>
                      <span className="text-xs font-semibold flex-1" style={{ color: tag.color }}>{tag.label}</span>
                      <input type="number" min={0} value={(form as any)[tag.key]}
                        onChange={e => setForm(p => ({ ...p, [tag.key]: +e.target.value }))}
                        className="w-14 px-2 py-1 rounded-lg border text-xs text-center font-bold focus:outline-none"
                        style={{ borderColor: tag.color + '40', color: tag.color }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.center} className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}>
                {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={14} />} 
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg mb-1" style={{ color: NAVY }}>Delete Record?</h3>
            <p className="text-gray-500 text-sm mb-5">This will permanently remove this evacuee record. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm bg-red-500">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}