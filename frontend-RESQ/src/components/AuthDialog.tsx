import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Check, Eye, EyeOff } from 'lucide-react'; 
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
  'Alley Area IV',
  'Anastacia Village',
  'Ateneoville',
  'Bagong Silang Nangka Neighborhood Asso. (BASINNAI)',
  'Balubad Dreamland HOA',
  'Balubad NHA Area I-IV HOA',
  'Balubad Village HOA Inc. Ph I',
  'Bayabas Compound HOA',
  'Bayabas Village Neighborhood Assoc',
  'Blk 28 Balubad Settlement Ph I Assoc',
  'Camacho Ph I/II HOA',
  'Dating Ilog HOA',
  'Duraville Homes',
  'Hampstead Place',
  'Jayvee Subd',
  'Kabayani I-III HOA',
  'Libya Extension I/II',
  'Marikina Greenheights Ph. III-V',
  'Marikina Greenland Ph. I/II',
  'Marikina Village',
  'Mira Verde Subd',
  'Nagkakaisa sa Nangka HOA',
  'Permaline Homes',
  'Pidamana / Crownland / Riverlane HOA',
  'Riverside Neighborhood Assoc. Ph II Marikina',
  'Salamat HOA',
  'Samahang Magkakapitbahay ng Blk. 4, 5, & 6',
  'Samahang Magkakapitbahay ng Blk. 13, 14, & 15 HOA',
  'Samahang Magkakapitbahay ng Nangka Centro',
  'Samahang Magkakapitbahay sa Balubad Settlement HOA',
  'Samahang Munting Pamayanan HOA',
  'Samahang Nagdadamayan Lagi HOA',
  'Samahang Pinagpala HOA',
  'Samahang Tungo sa Kaunlaran HOA',
  'St. Benedict Subd',
  'St. Mary Subd',
  'Tierra Vista Subd',
  'Twinriver Subd',
  'Twinville Subd'
];

export function AuthDialog({ mode, onClose, onSuccess }: AuthDialogProps) {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);

  // --- VISIBILITY STATES ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [registerForm, setRegisterForm] = useState({
    username: '', email: '', password: '', confirmPassword: '', 
    phoneNumber: '', firstName: '', lastName: '', dateOfBirth: '',
    address: '', gender: '',
  });

  // --- PASSWORD STRENGTH CHECKER ---
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    special: false,
    mixedCase: false
  });

  useEffect(() => {
    const p = registerForm.password;
    setPasswordCriteria({
      length: p.length >= 8,
      number: /\d/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p),
      mixedCase: /[a-z]/.test(p) && /[A-Z]/.test(p)
    });
  }, [registerForm.password]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

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

    if (!isPasswordValid) {
      toast.error('Please make sure your password meets all requirements.');
      setLoading(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(registerForm.phoneNumber)) {
      toast.error('Please enter a valid PH mobile number (e.g., 09123456789)');
      setLoading(false);
      return;
    }

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
      toast.error('Registration failed. Username or Email may be taken.');
    }
    setLoading(false);
  };

  const handleForgotPassword = () => {
      onClose();
      navigate('/forgot-password');
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
          // --- LOGIN FORM ---
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
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={loginForm.password} 
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} 
                  required 
                  className="pr-10" // Padding right so text doesn't hide behind icon
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
          // --- REGISTER FORM ---
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('firstName')}</Label><Input value={registerForm.firstName} onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})} required /></div>
              <div><Label>{t('lastName')}</Label><Input value={registerForm.lastName} onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})} required /></div>
            </div>
            
            <div><Label>{t('username')}</Label><Input value={registerForm.username} onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})} required /></div>
            
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input 
                  className="pl-9" 
                  type="email" 
                  value={registerForm.email} 
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* PASSWORD FIELD */}
              <div>
                <Label>{t('password')}</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password} 
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} 
                    required 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD FIELD */}
              <div>
                <Label>Confirm</Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerForm.confirmPassword} 
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})} 
                    required 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* --- PASSWORD CHECKLIST UI --- */}
            {registerForm.password.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md text-xs space-y-1 border border-gray-200">
                <p className="font-semibold mb-1 text-gray-700">Password Requirements:</p>
                
                <div className={`flex items-center gap-2 ${passwordCriteria.length ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordCriteria.length ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                  <span>At least 8 characters</span>
                </div>
                
                <div className={`flex items-center gap-2 ${passwordCriteria.mixedCase ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordCriteria.mixedCase ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                  <span>Uppercase & Lowercase letters</span>
                </div>

                <div className={`flex items-center gap-2 ${passwordCriteria.number ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordCriteria.number ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                  <span>At least one number</span>
                </div>

                <div className={`flex items-center gap-2 ${passwordCriteria.special ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordCriteria.special ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-400" />}
                  <span>Special character (!@#$%)</span>
                </div>
              </div>
            )}
            
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
              <Select onValueChange={(v: any) => setRegisterForm({...registerForm, address: v})}>
                <SelectTrigger><SelectValue placeholder="Select street" /></SelectTrigger>
                <SelectContent>{nangkaStreets.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t('gender')}</Label>
              <Select onValueChange={(v: any) => setRegisterForm({...registerForm, gender: v})}>
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