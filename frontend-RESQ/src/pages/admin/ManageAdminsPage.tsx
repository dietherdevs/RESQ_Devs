import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { toast } from 'sonner@2.0.3';

interface Admin {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'staff' | 'admin' | 'superadmin';
  status: 'active' | 'suspended';
  createdDate: string;
}

export function ManageAdminsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: '2',
      username: 'staff',
      firstName: 'Maria',
      lastName: 'Santos',
      phoneNumber: '+639987654321',
      role: 'staff',
      status: 'active',
      createdDate: '2026-01-01',
    },
    {
      id: '3',
      username: 'admin',
      firstName: 'Pedro',
      lastName: 'Reyes',
      phoneNumber: '+639111222333',
      role: 'admin',
      status: 'active',
      createdDate: '2026-01-01',
    },
  ]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'staff' as 'staff' | 'admin',
  });

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
      role: admin.role === 'superadmin' ? 'admin' : admin.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this admin account?')) {
      setAdmins(admins.filter(a => a.id !== id));
      toast.success('Admin account removed');
    }
  };

  const handleToggleStatus = (id: string) => {
    setAdmins(admins.map(admin =>
      admin.id === id
        ? { ...admin, status: admin.status === 'active' ? 'suspended' : 'active' }
        : admin
    ));
    toast.success('Admin status updated');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.firstName || !formData.lastName || !formData.phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!editingAdmin && !formData.password) {
      toast.error('Password is required for new accounts');
      return;
    }

    if (editingAdmin) {
      setAdmins(admins.map(admin =>
        admin.id === editingAdmin.id
          ? { ...admin, ...formData }
          : admin
      ));
      toast.success('Admin account updated');
    } else {
      const newAdmin: Admin = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        createdDate: new Date().toLocaleDateString(),
      };
      setAdmins([...admins, newAdmin]);
      toast.success('Admin account created');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const filteredAdmins = admins.filter(admin =>
    admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const staffCount = admins.filter(a => a.role === 'staff').length;
  const adminCount = admins.filter(a => a.role === 'admin').length;
  const activeCount = admins.filter(a => a.status === 'active').length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'staff':
        return <Badge className="bg-blue-500">Staff</Badge>;
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'superadmin':
        return <Badge className="bg-red-500">Super Admin</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Manage Admins</h1>
            <p className="text-gray-600">Manage staff and admin accounts</p>
          </div>
          <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-5 h-5 mr-2" />
            Add Admin
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{staffCount}</div>
            <div className="text-sm text-gray-600">Staff Members</div>
          </Card>
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="text-3xl font-bold text-purple-600">{adminCount}</div>
            <div className="text-sm text-gray-600">Admins</div>
          </Card>
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
            <div className="text-sm text-gray-600">Active Accounts</div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
        </Card>

        {/* Admins List */}
        <div className="space-y-4">
          {filteredAdmins.map((admin) => (
            <Card key={admin.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <ShieldCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {admin.firstName} {admin.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">@{admin.username}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {getRoleBadge(admin.role)}
                      <Badge className={admin.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                        {admin.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                {admin.role !== 'superadmin' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(admin)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(admin.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-600">Phone Number</div>
                  <div className="font-semibold text-gray-800">{admin.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-gray-600">Created Date</div>
                  <div className="font-semibold text-gray-800">{admin.createdDate}</div>
                </div>
              </div>

              {admin.role !== 'superadmin' && (
                <Button
                  onClick={() => handleToggleStatus(admin.id)}
                  variant="outline"
                  size="sm"
                  className={admin.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                >
                  {admin.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? 'Edit Admin Account' : 'Add New Admin'}
              </DialogTitle>
              <DialogDescription>
                {editingAdmin ? 'Edit the details of the admin account.' : 'Add a new admin account.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!editingAdmin}
                  className="mt-1"
                />
              </div>

              {!editingAdmin && (
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="+639XXXXXXXXX"
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingAdmin ? 'Update Account' : 'Create Account'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}