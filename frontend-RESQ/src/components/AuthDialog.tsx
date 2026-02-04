import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { X, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface AuthDialogProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

const nangkaStreets = [
  'Street 1, Nangka, Marikina', 'Street 2, Nangka, Marikina', 'Street 3, Nangka, Marikina',
  'Street 4, Nangka, Marikina', 'Street 5, Nangka, Marikina', 'Street 6, Nangka, Marikina',
  'Street 7, Nangka, Marikina', 'Street 8, Nangka, Marikina', 'Barangay Road, Nangka, Marikina',
  'Nangka Street, Nangka, Marikina',
];

export function AuthDialog({ mode, onClose, onSuccess }: AuthDialogProps) {
  const { t } = useLanguage();
  const { login, register } = useAuth(); 
  const navigate = useNavigate(); // Hook for navigation
  
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [registerForm, setRegisterForm] = useState({
    username: '', email: '', password: '', confirmPassword: '', 
    phoneNumber: '', firstName: '', lastName: '', dateOfBirth: '',
    address: '', gender: '',
  });

  // Helper: Calculate age from date string
  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(loginForm.username, loginForm.password);
    if (success) {
      toast.success('Login successful!');
      onSuccess();
    } else {
      toast.error('Invalid credentials');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Password Match Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // 2. Phone Number Validation (Philippine 09 format)
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(registerForm.phoneNumber)) {
      toast.error('Please enter a valid PH mobile number (e.g., 09123456789)');
      setLoading(false);
      return;
    }

    // 3. Age Validation (Min 18)
    const age = calculateAge(registerForm.dateOfBirth);
    if (age < 18) {
      toast.error('You must be at least 18 years old to register');
      setLoading(false);
      return;
    }

    const success = await register(registerForm);
    if (success) {
      toast.success('Registration successful!');
      onSuccess();
    } else {
      toast.error('Registration failed. Username may be taken.');
    }
    setLoading(false);
  };

  // Helper to handle Forgot Password click
  const handleForgotPassword = () => {
      onClose(); // Close the modal first
      navigate('/forgot-password'); // Go to the page
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{currentMode === 'login' ? t('login') : t('register')}</h2>
            <p className="text-sm text-gray-600">R.E.S.Q Emergency System</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>

        {currentMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Username or Email</Label>
              <Input 
                value={loginForm.username} 
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>{t('password')}</Label>
              <Input 
                type="password" 
                value={loginForm.password} 
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} 
                required 
              />
              
              {/* --- NEW FORGOT PASSWORD LINK --- */}
              <div className="text-right mt-1">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-xs text-sky-600 hover:text-sky-700 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>

            </div>
            <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
              {loading ? t('loading') : t('login')}
            </Button>
            <p className="text-center text-sm">
              {t('dontHaveAccount')} <button type="button" onClick={() => setCurrentMode('register')} className="text-sky-500 font-bold">{t('register')}</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('firstName')}</Label><Input value={registerForm.firstName} onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})} required /></div>
              <div><Label>{t('lastName')}</Label><Input value={registerForm.lastName} onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})} required /></div>
            </div>
            <div><Label>{t('username')}</Label><Input value={registerForm.username} onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})} required /></div>
            <div>
              <Label>Email (Optional)</Label>
              <div className="relative"><Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-9" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('password')}</Label><Input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} required /></div>
              <div><Label>Confirm</Label><Input type="password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})} required /></div>
            </div>
            <div>
              <Label>{t('phoneNumber')}</Label>
              <Input 
                placeholder="09XXXXXXXXX" 
                value={registerForm.phoneNumber} 
                onChange={(e) => setRegisterForm({...registerForm, phoneNumber: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>{t('dateOfBirth')}</Label>
              <Input 
                type="date" 
                value={registerForm.dateOfBirth} 
                onChange={(e) => setRegisterForm({...registerForm, dateOfBirth: e.target.value})} 
                required 
              />
            </div>
            <div>
              <Label>{t('address')}</Label>
              <Select onValueChange={(v) => setRegisterForm({...registerForm, address: v})}>
                <SelectTrigger><SelectValue placeholder="Select street" /></SelectTrigger>
                <SelectContent>{nangkaStreets.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('gender')}</Label>
              <Select onValueChange={(v) => setRegisterForm({...registerForm, gender: v})}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">{t('male')}</SelectItem>
                  <SelectItem value="Female">{t('female')}</SelectItem>
                  <SelectItem value="Other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
              {loading ? t('loading') : t('register')}
            </Button>
            <p className="text-center text-sm">
              {t('alreadyHaveAccount')} <button type="button" onClick={() => setCurrentMode('login')} className="text-sky-500 font-bold">{t('login')}</button>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}