import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
// REMOVED: import { Badge } from '../../components/ui/badge'; -> Using custom spans instead
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { toast } from 'sonner';

interface Admin {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'staff' | 'admin' | 'superadmin' | 'resident';
  status: 'active' | 'suspended';
  createdDate: string;
}

export function ManageAdminsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'staff' as 'staff' | 'admin',
  });

  // --- 1. FETCH ADMINS ---
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/list'); 
      const mappedAdmins: Admin[] = response.data.map((user: any) => ({
        id: user.id.toString(),
        username: user.username,
        firstName: user.firstName || user.first_name, 
        lastName: user.lastName || user.last_name,
        phoneNumber: user.phone_number || user.phoneNumber,
        role: user.role, // Ensure this matches exactly
        status: user.is_verified ? 'active' : 'suspended',
        createdDate: new Date(user.created_at).toLocaleDateString(),
      }));
      setAdmins(mappedAdmins);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch admin list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'staff',
    });
    setEditingAdmin(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '', 
      firstName: admin.firstName,
      lastName: admin.lastName,
      phoneNumber: admin.phoneNumber,
      role: (admin.role === 'resident' || admin.role === 'superadmin') ? 'staff' : admin.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this admin account?')) return;
    try {
      await axios.delete(`/users/${id}`);
      setAdmins(admins.filter(a => a.id !== id));
      toast.success('Admin account removed');
    } catch (error) {
      toast.error('Failed to delete admin.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const oldAdmins = [...admins];
    setAdmins(admins.map(a => a.id === id ? { ...a, status: newStatus as any } : a));

    try {
      await axios.post(`/admin/users/${id}/toggle`);
      toast.success(`Admin marked as ${newStatus}`);
    } catch (error) {
      setAdmins(oldAdmins); 
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.firstName || !formData.lastName || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!editingAdmin && !formData.password) {
      toast.error('Password is required for new accounts');
      return;
    }

    try {
      if (editingAdmin) {
        await axios.put(`/admin/users/${editingAdmin.id}`, formData);
        toast.success('Admin account updated');
      } else {
        const payload = {
            ...formData,
            password_confirmation: formData.password,
            birthdate: '2000-01-01', 
            address: 'Office',
            gender: 'Male'
        };
        await axios.post('/admin/create', payload);
        toast.success('Admin account created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // --- UI HELPERS ---
  const filteredAdmins = admins.filter(admin =>
    admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffCount = admins.filter(a => a.role === 'staff').length;
  const adminCount = admins.filter(a => a.role === 'admin').length;
  const activeCount = admins.filter(a => a.status === 'active').length;

  // --- 🔥 FIXED: Custom Badge Component using Inline Styles ---
  const CustomBadge = ({ label, color, textColor = '#fff' }: { label: string, color: string, textColor?: string }) => (
    <span 
        style={{ 
            backgroundColor: color, 
            color: textColor,
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            lineHeight: '1',
            textTransform: 'capitalize',
            border: '1px solid transparent' // Prevents outline issues
        }}
    >
        {label}
    </span>
  );

  const getRoleBadge = (role: string) => {
    if (!role) return <CustomBadge label="No Role" color="#94a3b8" />; // Slate 400

    switch (role.toLowerCase()) {
      case 'staff': 
        return <CustomBadge label="Staff" color="#10b981" />; // Emerald 500
      case 'admin': 
        return <CustomBadge label="Admin" color="#2563eb" />; // Blue 600
      case 'superadmin': 
        return <CustomBadge label="Super Admin" color="#7c3aed" />; // Violet 600
      case 'resident': 
        return <CustomBadge label="Resident" color="#64748b" />; // Slate 500
      default: 
        return <CustomBadge label={role} color="#6b7280" />; // Gray 500
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
        return <CustomBadge label="Active" color="#dcfce7" textColor="#166534" />; // Green 100 bg, Green 800 text
    } else {
        return <CustomBadge label="Suspended" color="#fee2e2" textColor="#991b1b" />; // Red 100 bg, Red 800 text
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Manage Admins</h1>
            <p className="text-slate-500">Create and manage system access for staff and administrators.</p>
          </div>
          <Button onClick={handleAdd} className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm">
            <Plus className="w-5 h-5 mr-2" />
            Add New Admin
          </Button>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-l-4 border-emerald-500 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600">{staffCount}</div>
            <div className="text-sm text-slate-500 font-medium">Staff Members</div>
          </Card>
          <Card className="p-6 bg-white border-l-4 border-blue-500 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{adminCount}</div>
            <div className="text-sm text-slate-500 font-medium">Administrators</div>
          </Card>
          <Card className="p-6 bg-white border-l-4 border-green-500 shadow-sm">
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
            <div className="text-sm text-slate-500 font-medium">Active Accounts</div>
          </Card>
        </div>

        {/* SEARCH */}
        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <Input
              placeholder="Search by name, username, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-slate-200 focus-visible:ring-sky-500 h-11"
            />
          </div>
        </Card>

        {/* ADMINS LIST */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-600 mb-2" />
                <p className="text-slate-500">Loading admin list...</p>
             </div>
          ) : filteredAdmins.length === 0 ? (
             <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                No admins found.
             </div>
          ) : (
            filteredAdmins.map((admin) => (
            <Card key={admin.id} className="p-6 transition-all hover:shadow-md border-slate-200">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Profile Info */}
                <div className="flex items-start gap-4">
                  <div className="bg-sky-50 p-3 rounded-full hidden sm:block">
                    <ShieldCheck className="w-8 h-8 text-sky-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-bold text-slate-900">
                        {admin.firstName} {admin.lastName}
                        </h3>
                        {/* ROLES - FORCED COLOR */}
                        {getRoleBadge(admin.role)}
                        {/* STATUS - FORCED COLOR */}
                        {getStatusBadge(admin.status)}
                    </div>
                    <p className="text-sm text-slate-500 font-medium">@{admin.username}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                        <div>
                            <span className="text-slate-400 mr-2">Phone:</span>
                            {admin.phoneNumber}
                        </div>
                        <div>
                            <span className="text-slate-400 mr-2">Added:</span>
                            {admin.createdDate}
                        </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {admin.role !== 'superadmin' && (
                  <div className="flex items-center gap-2 self-end md:self-start">
                    <Button onClick={() => handleEdit(admin)} variant="outline" size="sm" className="h-9">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    
                    <Button
                        onClick={() => handleToggleStatus(admin.id, admin.status)}
                        variant="ghost"
                        size="sm"
                        style={{ color: admin.status === 'active' ? '#ea580c' : '#16a34a' }} // Orange or Green text
                        className="hover:bg-slate-100"
                    >
                        {admin.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>

                    <Button
                      onClick={() => handleDelete(admin.id)}
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? 'Edit Admin Account' : 'Add New Admin'}
              </DialogTitle>
              <DialogDescription>
                {editingAdmin ? 'Update the details below.' : 'Create a new staff or admin account.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!editingAdmin} 
                />
              </div>

              {!editingAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                  placeholder="09XXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff (Limited Access)</SelectItem>
                    <SelectItem value="admin">Admin (Full Management)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700">
                  {editingAdmin ? 'Save Changes' : 'Create Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}