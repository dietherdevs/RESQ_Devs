import { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, AlertTriangle, CheckCircle, X, ChevronDown, Wand2 } from 'lucide-react';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

const templates = [
  {
    id: 1,
    label: '🌊 Warning (Tagalog)',
    msg: '[RESQ] BABALA: Ang Marikina River ay nasa {flood_levels}m na. Maging alerto at ihanda ang inyong Go-Bags. Antabayanan ang susunod na update mula sa Brgy. Nangka.',
  },
  {
    id: 2,
    label: '🌊 Warning (English)',
    msg: '[RESQ] WARNING: Marikina River is now at {flood_levels}m. Please stay alert and prepare your Go-Bags. Stand by for the next update from Brgy. Nangka.',
  },
  {
    id: 3,
    label: '🚨 Evacuation (Tagalog)',
    msg: '[RESQ] URGENT: Ang Marikina River ay {flood_levels}m (CRITICAL). LIKAS NA at pumunta agad sa {evacuation_centers}. Mag-ingat sa pagbyahe.',
  },
  {
    id: 4,
    label: '🚨 Evacuation (English)',
    msg: '[RESQ] URGENT: Marikina River is at {flood_levels}m (CRITICAL). EVACUATE NOW and proceed immediately to {evacuation_centers}. Please stay safe.',
  },
  {
    id: 5,
    label: '📍 Center Update (Tagalog)',
    msg: '[RESQ] UPDATE: PUNO NA ang {full_center}. Para sa mga hindi pa nakakalikas, mangyaring dumiretso sa {new_center}.',
  },
  {
    id: 6,
    label: '📍 Center Update (English)',
    msg: '[RESQ] UPDATE: {full_center} is now FULL. For those who are still evacuating, please proceed directly to {new_center}.',
  },
  {
    id: 7,
    label: '📢 Relief Info (Tagalog)',
    msg: '[RESQ] INFO: Ang pamimigay ng relief goods para sa mga pamilya sa {evacuation_centers} ay magsisimula mamayang {time}. Magdala ng ID.',
  },
  {
    id: 8,
    label: '📢 Relief Info (English)',
    msg: '[RESQ] INFO: Relief goods distribution for families at {evacuation_centers} will start at {time}. Please bring your ID.',
  },
];

interface RecipientGroup {
  id: string;
  label: string;
  count: number;
  target: string;
}

export function SendSMS() {
  const [message, setMessage] = useState('');
  
  // Dynamic User States
  const [recipients, setRecipients] = useState<RecipientGroup[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientGroup | null>(null);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(true);

  // Auto-Fill Variables State
  const [varFlood, setVarFlood] = useState('');
  const [varEvac, setVarEvac] = useState('');
  const [varTime, setVarTime] = useState('');

  const [dropOpen, setDropOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const maxChars = 160;
  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  // FETCH REAL USERS AND CURRENT FLOOD LEVEL ON MOUNT
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://localhost:8000/api/admin/sms-recipients', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (response.ok && result.status === 'success') {
          setRecipients(result.data);
          if (result.data.length > 0) setSelectedRecipient(result.data[0]);
        }
      } catch (error) {
        console.error("Failed to load recipients", error);
      } finally {
        setIsLoadingRecipients(false);
      }
    };

    const fetchCurrentFlood = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/flood/history?t=' + Date.now());
        const result = await response.json();
        if (result && result.length > 0) {
          // Auto-fill the highest/latest water level
          setVarFlood(parseFloat(result[result.length - 1].water_level).toFixed(2));
        }
      } catch (error) {
        console.error("Failed to fetch flood level for SMS auto-fill", error);
      }
    };

    fetchRecipients();
    fetchCurrentFlood();
  }, []);

  // Inject variables into template
  const handleTemplate = (t: typeof templates[0]) => {
    let finalMsg = t.msg;
    // Replace placeholders if the admin has filled out the variables (or fetched automatically)
    if (varFlood) finalMsg = finalMsg.replace(/\{flood_levels\}/g, varFlood);
    if (varEvac) finalMsg = finalMsg.replace(/\{evacuation_centers\}/g, varEvac);
    if (varTime) finalMsg = finalMsg.replace(/\{time\}/g, varTime);
    
    setMessage(finalMsg);
  };

  const handleBroadcast = async () => {
    if (!message.trim() || !selectedRecipient) return;
    
    const token = localStorage.getItem('auth_token'); 
    if (!token) {
        alert("Session expired. Please log in again to broadcast alerts.");
        return;
    }

    setSending(true);

    try {
      const response = await fetch('http://localhost:8000/api/admin/broadcast-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          message: message,
          target_group: selectedRecipient.target
        })
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setSending(false);
        setSent(true);
      } else {
        setSending(false);
        alert(data.message || "Failed to send alert.");
      }
    } catch (error) {
      setSending(false);
      console.error("Broadcast failed:", error);
      alert("Could not connect to the RESQ server. Please ensure the backend is running.");
    }
  };

  // Check if any placeholders { } are left in the message box
  const hasPlaceholders = message.includes('{') || message.includes('}');
  const isSendDisabled = !message.trim() || sending || !selectedRecipient || selectedRecipient.count === 0 || hasPlaceholders;

  if (sent && selectedRecipient) {
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
          
          {/* Variable Auto-Fill Panel */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}>
                <Wand2 size={16} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: NAVY }}>Auto-Fill Variables</h3>
                <p className="text-xs text-gray-400">Fill these out before clicking a template to automatically inject them.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Current Level (m)</label>
                <input 
                  type="text" value={varFlood} onChange={e => setVarFlood(e.target.value)} 
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" 
                  placeholder="e.g. 15.2"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Evacuation Center</label>
                <input 
                  list="evac-centers"
                  type="text" 
                  value={varEvac} 
                  onChange={e => setVarEvac(e.target.value)} 
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none bg-white" 
                  placeholder="Select or type..."
                />
                <datalist id="evac-centers">
                  <option value="nearest center (Nangka Elem, Civic Ctr, or St. Mary)" />
                  <option value="Nangka Elementary School" />
                  <option value="Barangay Nangka Civic Center" />
                  <option value="St. Mary Elementary School" />
                </datalist>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Time</label>
                <input 
                  type="text" value={varTime} onChange={e => setVarTime(e.target.value)} 
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none" 
                  placeholder="e.g. 3:00 PM"
                />
              </div>
            </div>
          </div>

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
            
            {hasPlaceholders && (
               <div className="mb-3 p-3 rounded-xl border-l-4 bg-red-50 border-red-500">
                 <p className="text-xs text-red-700 font-bold flex items-center gap-1"><AlertTriangle size={14}/> Action Required:</p>
                 <p className="text-xs text-red-600 mt-0.5">Your message contains unedited brackets like {'{full_center}'}. Please type the real data in the text box below before sending.</p>
               </div>
            )}

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
            {message && !hasPlaceholders && (
              <div className="mt-2 p-3 rounded-xl border-l-4 bg-gray-50" style={{ borderColor: ORANGE }}>
                <p className="text-xs text-gray-500 font-medium mb-1">Final Preview (This is exactly what users will see):</p>
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
            
            {isLoadingRecipients ? (
               <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all bg-gray-50 text-gray-400 text-sm">Loading users...</div>
            ) : selectedRecipient ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all"
                  style={{ borderColor: 'rgba(0,0,0,0.1)', color: NAVY, backgroundColor: '#FAFAFA' }}
                >
                  <div className="text-left">
                    <p>{selectedRecipient.label}</p>
                    <p className="text-xs font-normal text-gray-400">{selectedRecipient.count.toLocaleString()} recipients</p>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-100 bg-white shadow-xl z-10 overflow-hidden max-h-60 overflow-y-auto">
                    {recipients.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRecipient(r); setDropOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: r.id === selectedRecipient.id ? ORANGE : NAVY }}
                      >
                        <span className="font-semibold text-left">{r.label}</span>
                        <span className="text-xs text-gray-400">{r.count.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
                <div className="text-xs text-red-500 py-2">No active users found.</div>
            )}

            {selectedRecipient && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
                <Users size={16} className="text-green-500" />
                <div>
                  <p className="text-xs font-bold text-green-700">
                    {selectedRecipient.count.toLocaleString()} users will receive this alert
                  </p>
                  <p className="text-[10px] text-green-600">All with SMS alerts enabled</p>
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} style={{ color: YELLOW }} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold" style={{ color: '#92400E' }}>Review Before Sending</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  This action cannot be undone. Always double-check your data variables.
                </p>
              </div>
            </div>
          </div>

          {/* Broadcast Button */}
          <button
            onClick={handleBroadcast}
            disabled={isSendDisabled}
            className="w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: !isSendDisabled ? `linear-gradient(135deg, ${ORANGE}, #e85a1a)` : '#E5E7EB' }}
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