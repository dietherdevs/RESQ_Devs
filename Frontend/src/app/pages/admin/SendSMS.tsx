import { useState } from 'react';
import { MessageSquare, Send, Users, AlertTriangle, CheckCircle, X, ChevronDown } from 'lucide-react';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

const templates = [
  {
    id: 1,
    label: '🌊 Flood Alert Level 2',
    msg: 'RESQ ALERT: Marikina River is at Alert Level 2 (17.8m). Residents in low-lying areas are advised to prepare for possible evacuation. Stay tuned for updates. - MDRRMO Marikina',
  },
  {
    id: 2,
    label: '🚨 Mandatory Evacuation',
    msg: 'RESQ URGENT: Mandatory evacuation order for Barangay Sto. Niño and surrounding areas. Proceed immediately to the nearest evacuation center. Bring essential items. - MDRRMO Marikina',
  },
  {
    id: 3,
    label: '✅ All Clear',
    msg: 'RESQ UPDATE: Flood level is now below Alert Level 1. Water level at 14.2m. Residents may return home once local officials declare the area safe. - MDRRMO Marikina',
  },
  {
    id: 4,
    label: '📢 General Advisory',
    msg: 'RESQ ADVISORY: Heavy rainfall is expected in the next 6 hours. Monitor flood levels at resq.marikina.gov.ph or call MDRRMO at (02) 8646-3651. - MDRRMO Marikina',
  },
];

const recipients = [
  { id: 'all', label: 'All Registered Users', count: 1247 },
  { id: 'sto-nino', label: 'Barangay Sto. Niño', count: 342 },
  { id: 'parang', label: 'Barangay Parang', count: 289 },
  { id: 'nangka', label: 'Barangay Nangka', count: 201 },
  { id: 'tumana', label: 'Barangay Tumana', count: 178 },
  { id: 'concepcion', label: 'Barangay Concepcion', count: 237 },
];

export function SendSMS() {
  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(recipients[0]);
  const [dropOpen, setDropOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const maxChars = 160;
  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160);

  const handleTemplate = (t: typeof templates[0]) => {
    setMessage(t.msg);
  };

  const handleBroadcast = () => {
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1800);
  };

  if (sent) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#DCFCE7' }}>
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="font-black text-2xl mb-2" style={{ color: NAVY }}>Alert Broadcasted!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Your SMS alert was successfully sent to{' '}
            <span className="font-bold" style={{ color: ORANGE }}>{selectedRecipient.count.toLocaleString()} recipients</span>{' '}
            in <span className="font-bold">{selectedRecipient.label}</span>.
          </p>
          <p className="text-gray-400 text-xs mb-6 p-4 rounded-xl bg-gray-50 italic">"{message}"</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSent(false); setMessage(''); }}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}
            >
              Send Another Alert
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-black text-2xl" style={{ color: NAVY }}>Send SMS Alert</h1>
        <p className="text-gray-500 text-sm mt-1">Broadcast emergency messages to registered residents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Compose Area */}
        <div className="lg:col-span-8 space-y-5">
          {/* Templates */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3" style={{ color: NAVY }}>Quick Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplate(t)}
                  className="text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all hover:border-orange-300 hover:bg-orange-50"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', color: NAVY }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compose */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm" style={{ color: NAVY }}>Compose Message</h3>
              <span className={`text-xs font-semibold ${charCount > maxChars * smsCount - 10 ? 'text-orange-500' : 'text-gray-400'}`}>
                {charCount} chars / {smsCount} SMS
              </span>
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={6}
              placeholder="Type your emergency alert message here..."
              className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none transition-all"
              style={{
                borderColor: message ? '#FF6B2B40' : 'rgba(0,0,0,0.1)',
                backgroundColor: '#FAFAFA',
                color: NAVY,
              }}
            />
            {message && (
              <div className="mt-2 p-3 rounded-xl border-l-4 bg-gray-50" style={{ borderColor: ORANGE }}>
                <p className="text-xs text-gray-500 font-medium mb-1">Preview:</p>
                <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Recipients */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3" style={{ color: NAVY }}>Send To</h3>
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all"
                style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY, backgroundColor: '#FAFAFA' }}
              >
                <div>
                  <p>{selectedRecipient.label}</p>
                  <p className="text-xs font-normal text-gray-400">{selectedRecipient.count.toLocaleString()} recipients</p>
                </div>
                <ChevronDown size={16} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-100 bg-white shadow-xl z-10 overflow-hidden">
                  {recipients.map(r => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedRecipient(r); setDropOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: r.id === selectedRecipient.id ? ORANGE : NAVY }}
                    >
                      <span className="font-semibold">{r.label}</span>
                      <span className="text-xs text-gray-400">{r.count.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
              <Users size={16} className="text-green-500" />
              <div>
                <p className="text-xs font-bold text-green-700">
                  {selectedRecipient.count.toLocaleString()} users will receive this alert
                </p>
                <p className="text-[10px] text-green-600">All with SMS alerts enabled</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} style={{ color: YELLOW }} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold" style={{ color: '#92400E' }}>Review Before Sending</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  This will send an SMS to all selected recipients. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Broadcast Button */}
          <button
            onClick={handleBroadcast}
            disabled={!message.trim() || sending}
            className="w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: message.trim() ? `linear-gradient(135deg, ${ORANGE}, #e85a1a)` : '#E5E7EB' }}
          >
            {sending ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Broadcasting...
              </>
            ) : (
              <>
                <Send size={20} />
                Broadcast Alert
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
