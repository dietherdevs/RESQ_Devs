import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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

  // --- 1. FETCH ADMINS FROM BACKEND ---
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
        role: user.role,
        status: user.is_verified ? 'active' : 'suspended', // Map boolean to string status
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
      password: '', // Leave blank to keep existing
      firstName: admin.firstName,
      lastName: admin.lastName,
      phoneNumber: admin.phoneNumber,
      // If user is resident, default to staff in dropdown, or handle as needed
      role: (admin.role === 'resident' || admin.role === 'superadmin') ? 'staff' : admin.role,
    });
    setIsDialogOpen(true);
  };

  // --- 2. DELETE ACTION ---
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this admin account? This cannot be undone.')) return;

    try {
      // Ensure you have a delete route in api.php if you want this to work
      await axios.delete(`/users/${id}`);
      setAdmins(admins.filter(a => a.id !== id));
      toast.success('Admin account removed');
    } catch (error) {
      toast.error('Failed to delete admin. You may not have permission.');
    }
  };

  // --- 3. TOGGLE STATUS (Optional) ---
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

  // --- 4. SUBMIT FORM (CREATE / UPDATE) ---
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
        // ✅ UPDATE EXISTING (Use the correct route!)
        await axios.put(`/admin/users/${editingAdmin.id}`, formData);
        toast.success('Admin account updated');
      } else {
        // CREATE NEW
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
      fetchAdmins(); // Refresh list to show new data
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  };

  // --- UI LOGIC ---
  const filteredAdmins = admins.filter(admin =>
    admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffCount = admins.filter(a => a.role === 'staff').length;
  const adminCount = admins.filter(a => a.role === 'admin').length;
  const activeCount = admins.filter(a => a.status === 'active').length;

  const getRoleBadge = (role: string) => {
    // 1. Safety check for empty roles
    if (!role) return <Badge className="bg-gray-400 text-white">No Role</Badge>;

    // 2. Use toLowerCase() to handle "Resident" vs "resident"
    switch (role.toLowerCase()) {
      case 'staff': 
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Staff</Badge>;
      
      case 'admin': 
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Admin</Badge>;
      
      case 'superadmin': 
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Super Admin</Badge>;
      
      // ✅ ADDED: Resident needs a color (Slate/Gray)
      case 'resident': 
        return <Badge className="bg-slate-500 hover:bg-slate-600 text-white">Resident</Badge>;
      
      default: 
        // ✅ FIXED: Added bg-gray-500 so unknown roles are visible (not white-on-white)
        return <Badge className="bg-gray-500 hover:bg-gray-600 text-white capitalize">{role}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name, username, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 focus-visible:ring-sky-500"
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
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">
                        {admin.firstName} {admin.lastName}
                        </h3>
                        {getRoleBadge(admin.role)}
                        <Badge variant="outline" className={admin.status === 'active' ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}>
                            {admin.status}
                        </Badge>
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
                        className={admin.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}
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
                  <SelectTrigger>
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