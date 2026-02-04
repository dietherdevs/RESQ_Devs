import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface AdminLoginDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginDialog({ onClose, onSuccess }: AdminLoginDialogProps) {
  const { adminLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await adminLogin(form.username, form.password);
    
    if (success) {
      toast.success('Admin login successful!');
      onSuccess();
    } else {
      toast.error('Invalid admin credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
                <p className="text-sm text-gray-600">R.E.S.Q Management Portal</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                className="mt-1"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login as Admin'}
            </Button>

            <div className="mt-4 p-4 bg-gray-50 rounded text-sm space-y-2">
              <p className="font-semibold text-gray-700">Demo Admin Accounts:</p>
              <div className="space-y-1 text-gray-600">
                <p><strong>Staff:</strong> staff / staff123</p>
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Super Admin:</strong> superadmin / super123</p>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
