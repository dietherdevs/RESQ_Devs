import { useState, useEffect } from 'react';
// FIXED: Imported from 'react-router' to match your project's configuration
import { useSearchParams, useNavigate } from 'react-router'; 
import { ShieldAlert, CheckCircle, Eye, EyeOff } from 'lucide-react';
import resqLogo from '../../imports/resq111.png';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid or missing password reset token.');
    }
  }, [email, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      
      const response = await fetch(`${apiUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Unable to connect to the server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, sans-serif' }}>
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl text-center border" style={{ backgroundColor: '#0D1B2A', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="px-8 py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Password Reset Successful!</h3>
            <p className="text-white/50 text-sm mb-6">You can now use your new password to log in.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-lg text-white font-bold text-sm hover:opacity-90 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0A1628', fontFamily: 'Inter, sans-serif' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border" style={{ backgroundColor: '#0D1B2A', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="px-6 pt-8 pb-4 text-center border-b border-white/10">
          <img src={resqLogo} alt="RESQ" className="h-10 w-auto object-contain mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl">Set New Password</h2>
          <p className="text-white/50 text-xs mt-1">Please enter your new password below.</p>
          <p className="text-white/40 text-[10px] mt-2 truncate">For: {email}</p>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start gap-2">
                <ShieldAlert size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors pr-12"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors pr-12"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !token}
              className={`w-full py-3 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg mt-2 ${isLoading ? 'opacity-70' : ''}`}
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}