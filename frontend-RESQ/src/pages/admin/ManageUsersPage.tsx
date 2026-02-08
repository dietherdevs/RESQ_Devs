import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Search, Shield, Key, Loader2, UserCheck, UserX, Smartphone } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

// Define interface matching your Real Database
interface User {
  id: number;
  username: string; 
  firstName: string;
  lastName: string;
  phoneNumber: string; 
  email: string;
  address: string;
  role: string;
  smsAlerts: boolean; 
  is_verified: boolean; // This is the status toggle
  created_at: string;
}

export function ManageUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH REAL DATA
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/users');
      // Ensure we map data correctly just in case
      const mappedUsers = res.data.map((u: any) => ({
        ...u,
        // Fallbacks if data is missing
        firstName: u.firstName || 'Unknown',
        lastName: u.lastName || 'User',
        role: u.role || 'resident',
        created_at: u.created_at || new Date().toISOString()
      }));
      setUsers(mappedUsers);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // 2. TOGGLE STATUS
  const handleToggleStatus = async (user: User) => {
    try {
      await axios.post(`/admin/users/${user.id}/toggle`);
      
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, is_verified: !u.is_verified } : u
      ));

      const newStatus = !user.is_verified ? 'Activated' : 'Suspended';
      toast.success(`User ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // 3. RESET PASSWORD
  const handleResetPassword = async (userId: number, name: string) => {
    if(!confirm(`Reset password for ${name} to 'resq1234'?`)) return;

    try {
        await axios.post(`/admin/users/${userId}/reset`);
        toast.success(`Password reset to 'resq1234'`);
    } catch (error) {
        toast.error('Failed to reset password');
    }
  };

  // --- UI HELPERS & BADGES ---

  // 🔥 CUSTOM BADGE COMPONENT (Fixes Transparency Issue)
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
            border: '1px solid transparent'
        }}
    >
        {label}
    </span>
  );

  const getRoleBadge = (role: string) => {
      // Residents get a slate/gray badge
      return <CustomBadge label={role || 'Resident'} color="#64748b" />; 
  };

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
        return <CustomBadge label="Active" color="#dcfce7" textColor="#166534" />; // Green 100 bg, Green 800 text
    } else {
        return <CustomBadge label="Suspended" color="#fee2e2" textColor="#991b1b" />; // Red 100 bg, Red 800 text
    }
  };

  // 4. FILTERING & STATS
  const filteredUsers = users.filter(user =>
    (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const activeUsers = users.filter(u => u.is_verified).length;
  const usersWithSMS = users.length; // Placeholder logic from your snippet

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
           <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 mt-8">Manage Users</h1>
           <p className="text-slate-500">View and manage registered residents and their account status.</p>
        </div>

        {/* STATISTICS CARDS (Matches Admin Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-l-4 border-blue-500 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                    <div className="text-3xl font-bold text-blue-600">{users.length}</div>
                    <div className="text-sm text-slate-500 font-medium">Total Residents</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                </div>
             </div>
          </Card>

          <Card className="p-6 bg-white border-l-4 border-green-500 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                    <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
                    <div className="text-sm text-slate-500 font-medium">Active Accounts</div>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                    <UserCheck className="w-6 h-6 text-green-600" />
                </div>
             </div>
          </Card>

          <Card className="p-6 bg-white border-l-4 border-purple-500 shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                    <div className="text-3xl font-bold text-purple-600">{usersWithSMS}</div>
                    <div className="text-sm text-slate-500 font-medium">SMS Enabled</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-full">
                    <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
             </div>
          </Card>
        </div>

        {/* SEARCH BAR (Matches Admin Layout) */}
        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 border-slate-200 focus-visible:ring-sky-500 h-11"
            />
          </div>
        </Card>

        {/* USERS LIST */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-600 mb-2" />
                <p className="text-slate-500">Loading residents...</p>
             </div>
          ) : filteredUsers.length === 0 ? (
             <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                No users found.
             </div>
          ) : (
            filteredUsers.map((user) => (
            <Card key={user.id} className="p-6 transition-all hover:shadow-md border-slate-200">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Profile Info Block */}
                <div className="flex items-start gap-4">
                  {/* Icon Circle */}
                  <div className="bg-slate-100 p-3 rounded-full hidden sm:block">
                    <Users className="w-8 h-8 text-slate-600" />
                  </div>
                  
                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-bold text-slate-900">
                           {user.firstName} {user.lastName}
                        </h3>
                        {/* ROLE BADGE */}
                        {getRoleBadge(user.role)}
                        {/* STATUS BADGE */}
                        {getStatusBadge(user.is_verified)}
                    </div>
                    
                    <p className="text-sm text-slate-500 font-medium mb-4">{user.email}</p>
                    
                    {/* Data Grid */}
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
                        <div>
                            <span className="text-slate-400 mr-2">Phone:</span>
                            {user.phoneNumber || 'N/A'}
                        </div>
                        <div>
                            <span className="text-slate-400 mr-2">Registered:</span>
                            {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="text-slate-400 mr-2">ID:</span>
                            #{user.id}
                        </div>
                    </div>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="flex items-center gap-2 self-end md:self-start">
                    {/* Toggle Status Button */}
                    <Button
                        onClick={() => handleToggleStatus(user)}
                        variant="ghost"
                        size="sm"
                        style={{ color: user.is_verified ? '#ea580c' : '#16a34a' }} // Orange or Green text
                        className="hover:bg-slate-100 h-9"
                    >
                        {user.is_verified ? (
                            <>
                                <UserX className="w-4 h-4 mr-2" /> Suspend
                            </>
                        ) : (
                            <>
                                <UserCheck className="w-4 h-4 mr-2" /> Activate
                            </>
                        )}
                    </Button>

                    {/* Reset Password Button */}
                    <Button
                      onClick={() => handleResetPassword(user.id, user.firstName)}
                      variant="outline"
                      size="sm"
                      className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 h-9"
                    >
                      <Key className="w-4 h-4 mr-2" /> Reset Password
                    </Button>
                </div>
              </div>
            </Card>
          )))}
        </div>

      </div>
    </div>
  );
}