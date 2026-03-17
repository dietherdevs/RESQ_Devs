import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Edit, Trash2, FileDown, FileSpreadsheet, Calendar, X, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

// --- IMPORT EXPORT LIBRARIES ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const evacuationCenters = [
  { id: '2', name: 'Civic Center' },
  { id: '3', name: 'Nangka Elementary School' },
  { id: '4', name: 'St. Mary Elementary School' },
];

const nangkaStreets = [
  'Street 1, Nangka, Marikina',
  'Street 2, Nangka, Marikina',
  'Street 3, Nangka, Marikina',
  'Street 4, Nangka, Marikina',
  'Street 5, Nangka, Marikina',
  'Street 6, Nangka, Marikina',
  'Street 7, Nangka, Marikina',
  'Street 8, Nangka, Marikina',
  'Barangay Road, Nangka, Marikina',
  'Nangka Street, Nangka, Marikina',
];

interface Evacuee {
  id: number;
  headOfFamily: string;
  phoneNumber: string;
  address: string;
  totalMembers: number;
  pwdCount: number;
  seniorCount: number;
  pregnantCount: number;
  babyCount: number;
  evacuationCenter: string;
  centerId: string;
  dateRegistered: string;
  rawDate: string;
}

export function EvacueesListPage() {
  const [evacuees, setEvacuees] = useState<Evacuee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvacuee, setEditingEvacuee] = useState<Evacuee | null>(null);
  
  // --- DATE RANGE FILTERS ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [formData, setFormData] = useState({
    headOfFamily: '',
    phoneNumber: '',
    address: '',
    totalMembers: 1,
    pwdCount: 0,
    seniorCount: 0,
    pregnantCount: 0,
    babyCount: 0,
    evacuationCenter: '', 
  });

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      const response = await axios.get('/evacuees');
      
      const mappedData = response.data.map((record: any) => ({
        id: record.id,
        headOfFamily: record.manual_head_family || `${record.resident?.last_name || ''}, ${record.resident?.first_name || ''}`,
        phoneNumber: record.phone_number || '',
        address: record.address || '',
        totalMembers: record.member_count || 1,
        pwdCount: record.pwd_count || 0,
        seniorCount: record.senior_count || 0,
        pregnantCount: record.pregnant_count || 0,
        babyCount: record.baby_count || 0,
        evacuationCenter: record.center?.name || 'Unknown', 
        centerId: record.center_id?.toString() || '',
        dateRegistered: new Date(record.arrival_time).toLocaleDateString(),
        rawDate: record.arrival_time, 
      }));

      setEvacuees(mappedData);
    } catch (error) {
      console.error("Failed to load data");
    }
  };

  const filteredEvacuees = evacuees.filter(evacuee => {
    const recordDate = new Date(evacuee.rawDate).toISOString().split('T')[0];
    if (startDate && recordDate < startDate) return false;
    if (endDate && recordDate > endDate) return false;
    return true;
  });

  const resetForm = () => {
    setFormData({
      headOfFamily: '',
      phoneNumber: '',
      address: '',
      totalMembers: 1,
      pwdCount: 0,
      seniorCount: 0,
      pregnantCount: 0,
      babyCount: 0,
      evacuationCenter: '',
    });
    setEditingEvacuee(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (evacuee: Evacuee) => {
    setEditingEvacuee(evacuee);
    setFormData({
      headOfFamily: evacuee.headOfFamily,
      phoneNumber: evacuee.phoneNumber,
      address: evacuee.address,
      totalMembers: evacuee.totalMembers,
      pwdCount: evacuee.pwdCount,
      seniorCount: evacuee.seniorCount,
      pregnantCount: evacuee.pregnantCount,
      babyCount: evacuee.babyCount,
      evacuationCenter: evacuee.centerId, 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Check out this family?')) {
        try {
            await axios.put(`/evacuees/${id}/checkout`);
            setEvacuees(evacuees.filter(e => e.id !== id));
            toast.success('Family Checked Out');
        } catch (error) {
            toast.error('Failed to check out');
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.headOfFamily || !formData.evacuationCenter) {
      toast.error('Please fill in required fields');
      return;
    }

    const payload = {
        manual_head_family: formData.headOfFamily,
        center_id: formData.evacuationCenter,
        member_count: formData.totalMembers,
        pwd_count: formData.pwdCount,
        senior_count: formData.seniorCount,
        pregnant_count: formData.pregnantCount,
        baby_count: formData.babyCount,
        phone_number: formData.phoneNumber,
        address: formData.address
    };

    try {
        if (editingEvacuee) {
            toast.info("Editing details is not yet connected.");
        } else {
            await axios.post('/evacuees', payload);
            toast.success('Evacuee record added');
            fetchRealData(); 
        }

        setIsDialogOpen(false);
        resetForm();
    } catch (error) {
        toast.error('Failed to save. Ensure server is running.');
    }
  };

  // --- EXPORTS ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    const dataToExport = filteredEvacuees; 

    doc.setFontSize(16);
    doc.text("R.E.S.Q - Evacuees List", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
     
    if (startDate || endDate) {
        doc.text(`Period: ${startDate || 'Start'} to ${endDate || 'Present'}`, 14, 28);
    }

    const tableData = dataToExport.map(e => [
        e.headOfFamily,
        e.totalMembers,
        e.evacuationCenter,
        e.address,
        e.phoneNumber,
        e.pwdCount > 0 ? e.pwdCount : '-',
        e.seniorCount > 0 ? e.seniorCount : '-',
        e.pregnantCount > 0 ? e.pregnantCount : '-',
        e.babyCount > 0 ? e.babyCount : '-',
        e.dateRegistered
    ]);

    autoTable(doc, {
        head: [['Head of Family', 'Members', 'Center', 'Address', 'Contact', 'PWD', 'Senior', 'Pregnant', 'Baby', 'Date']],
        body: tableData,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
    });

    const fileName = `RESQ_Evacuees_${startDate || 'start'}_to_${endDate || 'end'}.pdf`;
    doc.save(fileName);
    toast.success("PDF Exported Successfully");
  };

  const exportToExcel = () => {
    const dataToExport = filteredEvacuees; 

    const excelData = dataToExport.map(e => ({
        "ID": e.id,
        "Head of Family": e.headOfFamily,
        "Total Members": e.totalMembers,
        "Evacuation Center": e.evacuationCenter,
        "Address": e.address,
        "Phone Number": e.phoneNumber,
        "PWD Count": e.pwdCount,
        "Senior Count": e.seniorCount,
        "Pregnant Count": e.pregnantCount,
        "Baby Count": e.babyCount,
        "Date Registered": e.dateRegistered
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evacuees");

    const max_width = excelData.reduce((w, r) => Math.max(w, r["Head of Family"].length), 10);
    worksheet["!cols"] = [ { wch: 5 }, { wch: max_width + 5 }, { wch: 10 }, { wch: 25 }, { wch: 30 } ];

    const fileName = `RESQ_Evacuees_${startDate || 'start'}_to_${endDate || 'end'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success("Excel Exported Successfully");
  };

  // Stats
  const totalEvacuees = filteredEvacuees.reduce((sum, e) => sum + e.totalMembers, 0);
  const totalPWD = filteredEvacuees.reduce((sum, e) => sum + e.pwdCount, 0);
  const totalSenior = filteredEvacuees.reduce((sum, e) => sum + e.seniorCount, 0);
  const totalPregnant = filteredEvacuees.reduce((sum, e) => sum + e.pregnantCount, 0);
  const totalBabies = filteredEvacuees.reduce((sum, e) => sum + e.babyCount, 0);

  return (
    // ✅ FIXED PADDING: Greatly increased top padding (pt-32) so the header clears the fixed navbar
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pt-32 lg:pt-36">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Block */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Evacuees List</h1>
          <p className="text-gray-600">Manage evacuee records and family information</p>
        </div>

         {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{filteredEvacuees.length}</div>
            <div className="text-xs text-gray-600">Families Found</div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-2xl font-bold text-green-600">{totalEvacuees}</div>
            <div className="text-xs text-gray-600">Total People</div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{totalPWD}</div>
            <div className="text-xs text-gray-600">PWD</div>
          </Card>
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{totalSenior}</div>
            <div className="text-xs text-gray-600">Senior Citizens</div>
          </Card>
          <Card className="p-4 bg-pink-50 border-pink-200">
            <div className="text-2xl font-bold text-pink-600">{totalPregnant + totalBabies}</div>
            <div className="text-xs text-gray-600">Pregnant/Babies</div>
          </Card>
        </div>

        {/* Toolbar: Filters & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-4 mb-6">
          <Card className="p-2 px-3 w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3 border-slate-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-400 uppercase">From</span>
              <Input 
                  type="date" 
                  className="h-8 text-sm w-full sm:w-auto border-none shadow-none focus-visible:ring-0 px-1"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-400 uppercase">To</span>
              <Input 
                  type="date" 
                  className="h-8 text-sm w-full sm:w-auto border-none shadow-none focus-visible:ring-0 px-1"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {(startDate || endDate) && (
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setStartDate(''); setEndDate(''); }} 
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-50"
                  title="Clear Dates"
              >
                  <X className="w-4 h-4" />
              </Button>
            )}
          </Card>

          <div className="flex gap-2 w-full lg:w-auto">
            <Button onClick={exportToPDF} variant="outline" className="flex-1 lg:flex-none bg-white border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200">
              <FileDown className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline" className="flex-1 lg:flex-none bg-white border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
            </Button>
            <Button onClick={handleAdd} className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add Record
            </Button>
          </div>
        </div>

        {/* Evacuee Records Block */}
        <Card className="p-6 border-slate-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Family Records</h2>
          
          {filteredEvacuees.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">No records found</h3>
              <p className="text-sm text-gray-500">
                {(startDate || endDate) ? 'Adjust your date filters to see results.' : 'Start by adding an evacuee family record.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvacuees.map((evacuee) => (
                <div key={evacuee.id} className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-slate-100">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-base font-semibold text-gray-800">{evacuee.headOfFamily}</div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium">
                          {evacuee.totalMembers} Members
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-3 flex flex-wrap gap-x-3 gap-y-1 items-center">
                        <span>{evacuee.address}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{evacuee.evacuationCenter}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{evacuee.phoneNumber}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {evacuee.dateRegistered}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {evacuee.pwdCount > 0 && <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">PWD: {evacuee.pwdCount}</Badge>}
                        {evacuee.seniorCount > 0 && <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">Senior: {evacuee.seniorCount}</Badge>}
                        {evacuee.pregnantCount > 0 && <Badge variant="outline" className="border-pink-200 text-pink-700 bg-pink-50">Pregnant: {evacuee.pregnantCount}</Badge>}
                        {evacuee.babyCount > 0 && <Badge variant="outline" className="border-pink-200 text-pink-700 bg-pink-50">Baby: {evacuee.babyCount}</Badge>}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 w-full sm:w-auto justify-end">
                      <Button onClick={() => handleEdit(evacuee)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(evacuee.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ✅ FIXED MODAL: Replaced broken dialog component with a raw, bulletproof Tailwind Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            
            {/* The Dark Overlay */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsDialogOpen(false)}
            />
            
            {/* The White Modal Box */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-white shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {editingEvacuee ? 'Edit Evacuee Record' : 'Add New Evacuee'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {editingEvacuee ? 'Update details.' : 'Enter details of the new evacuee family.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsDialogOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content (Scrollable) */}
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Head of Family *</Label>
                    <Input
                      value={formData.headOfFamily}
                      onChange={(e) => setFormData({ ...formData, headOfFamily: e.target.value })}
                      required
                      placeholder="Last Name, First Name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      required
                      className="mt-1"
                      placeholder="+639XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <Label>Address *</Label>
                    <Select value={formData.address} onValueChange={(value) => setFormData({ ...formData, address: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select street" />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        {nangkaStreets.map((street) => (
                          <SelectItem key={street} value={street}>{street}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Evacuation Center *</Label>
                    <Select value={formData.evacuationCenter} onValueChange={(value) => setFormData({ ...formData, evacuationCenter: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select evacuation center" />
                      </SelectTrigger>
                      <SelectContent className="z-[110]">
                        {evacuationCenters.map((center) => (
                          <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Family Members *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.totalMembers}
                        onChange={(e) => setFormData({ ...formData, totalMembers: parseInt(e.target.value) || 1 })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div><Label>PWD</Label><Input type="number" min="0" value={formData.pwdCount} onChange={(e) => setFormData({ ...formData, pwdCount: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                    <div><Label>Seniors</Label><Input type="number" min="0" value={formData.seniorCount} onChange={(e) => setFormData({ ...formData, seniorCount: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                    <div><Label>Pregnant</Label><Input type="number" min="0" value={formData.pregnantCount} onChange={(e) => setFormData({ ...formData, pregnantCount: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                    <div><Label>Babies</Label><Input type="number" min="0" value={formData.babyCount} onChange={(e) => setFormData({ ...formData, babyCount: parseInt(e.target.value) || 0 })} className="mt-1" /></div>
                  </div>

                  <div className="flex gap-2 pt-6 border-t border-slate-100 mt-6">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Add Evacuee</Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}