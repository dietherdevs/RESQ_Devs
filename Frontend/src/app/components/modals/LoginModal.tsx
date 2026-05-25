import { useState } from 'react';
import { Eye, EyeOff, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import resqLogo from '../../../imports/resq111.png';

export function LoginModal() {
  // <--- NEW: Destructured setShowForgotPassword
  const { showLogin, setShowLogin, setShowRegister, setUser, setShowForgotPassword } = useApp();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!showLogin) return null;

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        const userWithMappedRole = {
            ...data.user,
            role: data.user.role === 'super_admin' ? 'superadmin' : data.user.role
        };

        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(userWithMappedRole));

        setUser(userWithMappedRole);
        
        setShowLogin(false);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Is the backend running?');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#0D1B2A', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <img src={resqLogo} alt="RESQ" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="text-white font-bold text-lg">Welcome Back</h2>
              <p className="text-white/50 text-xs">Sign in to your RESQ account</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          <form onSubmit={handleManualLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start gap-2">
                <ShieldAlert size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Username / Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors pr-12"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-orange-500 w-3.5 h-3.5" />
                <span className="text-xs text-white/50">Remember me</span>
              </label>
              {/* <--- NEW: Changed type to button, added onClick event ---> */}
              <button 
                type="button" 
                onClick={() => { setShowLogin(false); setShowForgotPassword(true); }}
                className="text-xs font-semibold hover:underline" 
                style={{ color: '#FF6B2B' }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-5">
            Don't have an account?{' '}
            <button
              onClick={() => { setShowLogin(false); setShowRegister(true); }}
              className="font-semibold hover:underline"
              style={{ color: '#FF6B2B' }}
            >
              Register here
            </button>
          </p>
        </div>

        <div className="px-6 pb-5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <ShieldAlert size={13} style={{ color: '#FFB800' }} />
            <p className="text-xs text-white/40">Your data is protected and encrypted.</p>
          </div>
        </div>
      </div>
    </div>
  );
}