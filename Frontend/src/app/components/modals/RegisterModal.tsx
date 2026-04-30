import { useState, useRef } from 'react';
import { X, Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import resqLogo from '../../../imports/resq111.png';

export function RegisterModal() {
  const { showRegister, setShowRegister, setShowLogin } = useApp();
  const [step, setStep] = useState(1);
  const [idFile, setIdFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '',
    dob: '', address: '', gender: '',
  });

  if (!showRegister) return null;

  const handleChange = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl text-center" style={{ backgroundColor: '#0D1B2A', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="px-8 py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Registration Submitted!</h3>
            <p className="text-white/50 text-sm mb-2">Your account is pending admin approval.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6" style={{ backgroundColor: 'rgba(255,184,0,0.15)', color: '#FFB800' }}>
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Awaiting Verification
            </div>
            <p className="text-white/40 text-xs mb-6">An admin will review your submitted ID and approve your registration. You will receive an SMS notification once approved.</p>
            <button
              onClick={() => { setShowRegister(false); setStep(1); setShowLogin(true); }}
              className="w-full py-3 rounded-lg text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRegister(false)} />
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#0D1B2A', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-6 pb-4 border-b border-white/10" style={{ backgroundColor: '#0D1B2A' }}>
          <button onClick={() => setShowRegister(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <img src={resqLogo} alt="RESQ" className="h-8 w-auto object-contain" />
            <div>
              <h2 className="text-white font-bold text-lg">Create Account</h2>
              <p className="text-white/50 text-xs">Register for RESQ emergency alerts</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">First Name *</label>
              <input required value={form.firstName} onChange={e => handleChange('firstName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} placeholder="Maria" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Last Name *</label>
              <input required value={form.lastName} onChange={e => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} placeholder="Santos" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Username *</label>
            <input required value={form.username} onChange={e => handleChange('username', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} placeholder="mariasantos" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
              Email <span className="normal-case font-normal text-white/30">(Optional)</span>
            </label>
            <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} placeholder="maria@example.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Phone Number *</label>
            <input required type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} placeholder="09171234567" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Date of Birth *</label>
              <input required type="date" value={form.dob} onChange={e => handleChange('dob', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Gender *</label>
              <select required value={form.gender} onChange={e => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
                style={{ backgroundColor: '#132236', colorScheme: 'dark' }}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Address *</label>
            <input required value={form.address} onChange={e => handleChange('address', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:border-orange-400 focus:outline-none transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} placeholder="Barangay, Marikina City" />
          </div>

          {/* ID Upload */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Upload Valid ID *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-orange-400/50"
              style={{ borderColor: idFile ? '#FF6B2B' : 'rgba(255,255,255,0.15)', backgroundColor: idFile ? 'rgba(255,107,43,0.08)' : 'rgba(255,255,255,0.03)' }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files && setIdFile(e.target.files[0])}
              />
              {idFile ? (
                <div className="flex items-center justify-center gap-2" style={{ color: '#FF6B2B' }}>
                  <CheckCircle size={18} />
                  <span className="text-sm font-semibold">{idFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto mb-2 text-white/30" />
                  <p className="text-sm text-white/50">Click to upload your government-issued ID</p>
                  <p className="text-xs text-white/30 mt-1">PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
          >
            Submit Registration
          </button>

          <p className="text-center text-sm text-white/50">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { setShowRegister(false); setShowLogin(true); }}
              className="font-semibold hover:underline flex items-center gap-1 inline-flex"
              style={{ color: '#FF6B2B' }}
            >
              <ArrowLeft size={12} /> Back to Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}