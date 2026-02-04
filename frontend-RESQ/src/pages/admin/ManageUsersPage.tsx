import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Search, UserCheck, UserX, Shield, Key } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner'; // Adjusted import based on your setup

// Define interface matching your Real Database
interface User {
  id: number;
  username: string; // We'll map this from email or a username field
  firstName: string;
  lastName: string;
  phoneNumber: string; // We'll map this from 'contact_number' if available
  email: string;
  address: string; // We'll map from household data
  role: string;
  smsAlerts: boolean; // We'll assume true for now or map from DB
  is_verified: boolean; // Replaces 'status' logic
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
      // Calls the Controller we just made
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // 2. TOGGLE STATUS (BLOCK/UNBLOCK)
  const handleToggleStatus = async (user: User) => {
    try {
      const res = await axios.post(`/admin/users/${user.id}/toggle`);
      
      // Update local state immediately
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, is_verified: !u.is_verified } : u
      ));

      const newStatus = !user.is_verified ? 'Activated' : 'Suspended';
      toast.success(`User ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // 3. RESET PASSWORD (New Feature)
  const handleResetPassword = async (userId: number, name: string) => {
    if(!confirm(`Reset password for ${name} to 'resq1234'?`)) return;

    try {
        await axios.post(`/admin/users/${userId}/reset`);
        toast.success(`Password reset to 'resq1234'`);
    } catch (error) {
        toast.error('Failed to reset password');
    }
  };

  // 4. FILTERING
  const filteredUsers = users.filter(user =>
    (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // STATISTICS
  const activeUsers = users.filter(u => u.is_verified).length;
  // Note: Assuming all users have SMS enabled by default for now
  const usersWithSMS = users.length; 

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Manage Users</h1>
          <p className="text-gray-600">View and manage registered residents</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-blue-500" />
              <div>
                <div className="text-3xl font-bold text-blue-500">{users.length}</div>
                <div className="text-sm text-gray-600">Total Residents</div>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-4">
              <UserCheck className="w-10 h-10 text-green-600" />
              <div>
                <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
                <div className="text-sm text-gray-600">Active / Verified</div>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10 text-purple-600" />
              <div>
                <div className="text-3xl font-bold text-purple-600">{usersWithSMS}</div>
                <div className="text-sm text-gray-600">SMS Alerts Enabled</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
        </Card>

        {/* Users List (Dynamic) */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center p-8 text-gray-500">Loading residents...</div>
          ) : filteredUsers.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={user.is_verified ? 'bg-green-500' : 'bg-red-500'}>
                        {user.is_verified ? 'Active' : 'Suspended'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                         Resident
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-600">Role</div>
                  <div className="font-semibold text-gray-800 capitalize">{user.role}</div>
                </div>
                <div>
                  <div className="text-gray-600">Registered Date</div>
                  <div className="font-semibold text-gray-800">
                     {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                   <div className="text-gray-600">Account ID</div>
                   <div className="font-semibold text-gray-800">#{user.id}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleToggleStatus(user)}
                  variant="outline"
                  size="sm"
                  className={user.is_verified ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                >
                  {user.is_verified ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Suspend User
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activate User
                    </>
                  )}
                </Button>
                
                {/* Reset Password Button */}
                <Button
                  onClick={() => handleResetPassword(user.id, user.firstName)}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:bg-orange-50"
                >
                   <Key className="w-4 h-4 mr-2" />
                   Reset Password
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {!loading && filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </Card>
        )}
      </div>
    </div>
  );
}