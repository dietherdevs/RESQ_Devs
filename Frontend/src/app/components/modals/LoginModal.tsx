import { useState } from 'react';
import { Eye, EyeOff, X, ShieldAlert, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../context/AppContext';
import resqLogo from '../../../imports/resq111.png';

export function LoginModal() {
  const { showLogin, setShowLogin, setShowRegister, login } = useApp();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!showLogin) return null;

  const handleDemoLogin = (role: UserRole) => {
    login(role);
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

        {/* Demo Login Buttons */}
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#FFB800' }}>
            <Zap size={12} className="inline mr-1" />
            Demo Quick Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('user')}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-white border border-white/20 hover:bg-white/10 transition-all text-center"
            >
              User
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-center"
              style={{ backgroundColor: '#FFB800', color: '#0D1B2A', borderColor: '#FFB800' }}
            >
              Admin
            </button>
            <button
              onClick={() => handleDemoLogin('superadmin')}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-white border transition-all text-center"
              style={{ backgroundColor: '#FF6B2B', borderColor: '#FF6B2B' }}
            >
              Super Admin
            </button>
            <button
              onClick={() => handleDemoLogin('staff')}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-white border transition-all text-center"
              style={{ backgroundColor: '#3B82F6', borderColor: '#3B82F6' }}
            >
              Staff
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or sign in manually</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); login('user'); }} className="space-y-4">
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
              <button type="button" className="text-xs font-semibold hover:underline" style={{ color: '#FF6B2B' }}>
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
            >
              Sign In
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

        {/* Security note */}
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