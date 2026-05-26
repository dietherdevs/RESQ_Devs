import { useState } from 'react';
import { X, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import resqLogo from '../../../imports/resq111.png';

export function ForgotPasswordModal() {
  const { showForgotPassword, setShowForgotPassword, setShowLogin } = useApp();
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!showForgotPassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Unable to find an account with that email.');
      }
    } catch (err) {
      setError('Unable to connect to the server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // If the email was successfully sent, show the confirmation screen
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl text-center" style={{ backgroundColor: '#0D1B2A', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="px-8 py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Check Your Email</h3>
            <p className="text-white/50 text-sm mb-6">
              We've sent a password reset link to <br/>
              <span className="font-semibold text-white/80">{email}</span>
            </p>
            <button
              onClick={() => { setShowForgotPassword(false); setIsSuccess(false); setEmail(''); setShowLogin(true); }}
              className="w-full py-3 rounded-lg text-white font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // The default input screen
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForgotPassword(false)} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#0D1B2A', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <button onClick={() => setShowForgotPassword(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <img src={resqLogo} alt="RESQ" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="text-white font-bold text-lg">Reset Password</h2>
              <p className="text-white/50 text-xs">Enter your email to receive a reset link</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start gap-2">
                <ShieldAlert size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registered@example.com"
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className={`w-full py-3 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg ${isLoading || !email ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
            >
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setShowForgotPassword(false); setShowLogin(true); }}
              className="font-semibold text-sm hover:underline flex items-center justify-center gap-1.5 w-full"
              style={{ color: '#FF6B2B' }}
            >
              <ArrowLeft size={14} /> Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}