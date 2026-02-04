import React, { useState } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  // Controls which screen is shown: 1 (Email), 2 (OTP), 3 (Reset)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // --- STEP 1: REQUEST OTP ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Connects to Laravel: Route::post('/forgot-password')
      await axios.post('/forgot-password', { email });
      
      toast.success("Code sent! Please check your email inbox.");
      setStep(2); // Move to next step
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Email not found or server error.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Connects to Laravel: Route::post('/verify-code')
      await axios.post('/verify-code', { email, code });
      
      toast.success("Code verified successfully!");
      setStep(3); // Move to final step
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Invalid or expired code.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: RESET PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
        toast.error("Passwords do not match.");
        return;
    }

    if (password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
    }

    setLoading(true);
    try {
      // Connects to Laravel: Route::post('/reset-password')
      await axios.post('/reset-password', { 
        email, 
        code, 
        password, 
        password_confirmation: passwordConfirm 
      });
      
      toast.success("Password reset successfully! Redirecting...");
      
      // Wait 2 seconds so user sees the success message, then go to login
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to reset password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-slate-100 relative overflow-hidden">
        
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>

        {/* Back Navigation */}
        <button 
          onClick={() => step === 1 ? navigate('/login') : setStep(prev => (prev - 1) as any)}
          className="flex items-center text-slate-400 hover:text-slate-600 mb-8 text-sm transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {step === 1 ? 'Back to Login' : 'Go Back'}
        </button>

        {/* --- STEP 1: EMAIL INPUT --- */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Forgot Password</h2>
            <p className="text-slate-500 text-center mb-8 text-sm px-4">
              Enter your registered email address and we'll send you a 6-digit secure code to reset your password.
            </p>

            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center transition-all transform active:scale-[0.98] shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
              </button>
            </form>
          </div>
        )}

        {/* --- STEP 2: CODE INPUT --- */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Key className="w-8 h-8 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Enter Verification Code</h2>
            <p className="text-slate-500 text-center mb-8 text-sm px-2">
              We sent a code to <span className="font-bold text-slate-800">{email}</span>. <br/> It may take a minute to arrive.
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-center text-3xl tracking-[0.5em] font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white"
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center transition-all transform active:scale-[0.98] shadow-lg shadow-purple-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
              </button>
            </form>
          </div>
        )}

        {/* --- STEP 3: NEW PASSWORD --- */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Reset Password</h2>
            <p className="text-slate-500 text-center mb-8 text-sm">
              Your identity is verified. Create a new secure password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">New Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center transition-all transform active:scale-[0.98] shadow-lg shadow-green-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}