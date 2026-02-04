import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Edit, Trash2, UserCheck, FileDown, FileSpreadsheet, Calendar, X, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
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
  dateRegistered: string; // Display string
  rawDate: string; // ISO string for accurate filtering
}

export function EvacueesListPage() {
  const [evacuees, setEvacuees] = useState<Evacuee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvacuee, setEditingEvacuee] = useState<Evacuee | null>(null);
  
  // --- NEW STATE: DATE RANGE FILTERS ---
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

  // --- UPDATED FILTER LOGIC (RANGE) ---
  const filteredEvacuees = evacuees.filter(evacuee => {
    // Get YYYY-MM-DD from the record
    const recordDate = new Date(evacuee.rawDate).toISOString().split('T')[0];

    // 1. Check Start Date (if exists)
    if (startDate && recordDate < startDate) return false;
    
    // 2. Check End Date (if exists)
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

  // --- EXPORT FUNCTION: PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    const dataToExport = filteredEvacuees; 

    doc.setFontSize(16);
    doc.text("R.E.S.Q - Evacuees List", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    
    // Add date range info to PDF
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

  // --- EXPORT FUNCTION: EXCEL ---
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

  // Stats Calculations (Based on Filtered Data)
  const totalEvacuees = filteredEvacuees.reduce((sum, e) => sum + e.totalMembers, 0);
  const totalPWD = filteredEvacuees.reduce((sum, e) => sum + e.pwdCount, 0);
  const totalSenior = filteredEvacuees.reduce((sum, e) => sum + e.seniorCount, 0);
  const totalPregnant = filteredEvacuees.reduce((sum, e) => sum + e.pregnantCount, 0);
  const totalBabies = filteredEvacuees.reduce((sum, e) => sum + e.babyCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Evacuees List</h1>
            <p className="text-gray-600">Manage evacuee records and family information</p>
          </div>
          
          <div className="flex flex-col xl:flex-row items-end xl:items-center gap-3 w-full md:w-auto">
            
            {/* --- NEW DATE RANGE INPUTS --- */}
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-1.5 rounded-lg border shadow-sm w-full md:w-auto">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase ml-2">From</span>
                    <input 
                        type="date" 
                        className="p-1 text-sm outline-none bg-transparent text-gray-600 border rounded"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block" />
                
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                    <input 
                        type="date" 
                        className="p-1 text-sm outline-none bg-transparent text-gray-600 border rounded"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                {(startDate || endDate) && (
                    <button 
                        onClick={() => { setStartDate(''); setEndDate(''); }} 
                        className="p-1 hover:bg-red-50 text-red-400 rounded-md transition-colors ml-1"
                        title="Clear Dates"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={exportToPDF} variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300">
                    <FileDown className="w-4 h-4 mr-2" />
                    PDF
                </Button>
                
                <Button onClick={exportToExcel} variant="outline" className="bg-white border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                </Button>

                <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Evacuee
                </Button>
            </div>
          </div>
        </div>

        {/* Statistics (Dynamic based on filter) */}
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

        {/* Table */}
        {filteredEvacuees.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No records found</h3>
            <p className="text-gray-500 mb-4">
                {(startDate || endDate) 
                    ? `No evacuees found between ${startDate || 'start'} and ${endDate || 'now'}` 
                    : 'Start by adding an evacuee family record'}
            </p>
            {(!startDate && !endDate) && (
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                Add First Evacuee
                </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvacuees.map((evacuee) => (
              <Card key={evacuee.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{evacuee.headOfFamily}</h3>
                      <p className="text-sm text-gray-600">{evacuee.address}</p>
                      <p className="text-sm text-gray-600">{evacuee.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(evacuee)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(evacuee.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Members</div>
                    <div className="font-semibold text-gray-800">{evacuee.totalMembers}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">PWD</div>
                    <div className="font-semibold text-purple-600">{evacuee.pwdCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Senior</div>
                    <div className="font-semibold text-orange-600">{evacuee.seniorCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Pregnant</div>
                    <div className="font-semibold text-pink-600">{evacuee.pregnantCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Babies</div>
                    <div className="font-semibold text-pink-600">{evacuee.babyCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Center</div>
                    <div className="font-semibold text-blue-600 text-xs">{evacuee.evacuationCenter}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Registered: {evacuee.dateRegistered}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog (No Changes Here) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvacuee ? 'Edit Evacuee Record' : 'Add New Evacuee'}
              </DialogTitle>
              <DialogDescription>
                {editingEvacuee ? 'Update details.' : 'Enter details of the new evacuee family.'}
              </DialogDescription>
            </DialogHeader>

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
                  <SelectContent>
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
                  <SelectContent>
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

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Add Evacuee</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}