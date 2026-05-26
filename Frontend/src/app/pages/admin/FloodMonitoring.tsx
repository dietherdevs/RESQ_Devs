import { useState, useEffect, useCallback } from 'react'; 
import {
  Activity, Droplets, AlertTriangle, Save, RotateCcw,
  Wifi, WifiOff, Clock, CheckCircle, Info, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// Define the alert thresholds outside the component so they can be reused
const getAlertInfo = (level: number) => {
  if (level >= 18) return { label: 'CRITICAL', color: '#7F1D1D' };
  if (level >= 17) return { label: 'ALERT LEVEL 3', color: '#EF4444' };
  if (level >= 16) return { label: 'ALERT LEVEL 2', color: '#FF6B2B' };
  if (level >= 15) return { label: 'ALERT LEVEL 1', color: '#FFB800' };
  return { label: 'NORMAL', color: '#22C55E' };
};

// ─── Utility: Manila-Only Parser ─────────────────────────────────────────────
const parseManilaDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  
  try {
    let cleanStr = dateStr.trim().replace('Z', '').split('+')[0];
    cleanStr = cleanStr.replace(' ', 'T');
    const parsedDate = new Date(cleanStr + '+08:00');
    if (isNaN(parsedDate.getTime())) {
      return new Date(dateStr);
    }
    return parsedDate;
  } catch (e) {
    return new Date(dateStr);
  }
};

const formatTime = (date: Date) => {
  if (isNaN(date.getTime())) return '---';
  return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    const val = payload[0].value as number;
    const alert = getAlertInfo(val);
    return (
      <div
        className="rounded-xl px-3 py-2 shadow-xl border"
        style={{ backgroundColor: NAVY, borderColor: 'rgba(255,255,255,0.15)' }}
      >
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <p className="font-black text-base" style={{ color: alert.color }}>{val.toFixed(2)} m</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: alert.color }}>{alert.label}</p>
      </div>
    );
  }
  return null;
}

export function FloodMonitoring() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [inputLevel, setInputLevel] = useState('0');
  const [history, setHistory] = useState<any[]>([]); 
  const [sensorOnline, setSensorOnline] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Fetching...');

  const fetchLiveHistory = useCallback(async () => {
    if (!sensorOnline) return; 

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/flood/history?t=${Date.now()}`);
      if (response.ok) {
        const result = await response.json();
        
        const mappedData = result.map((item: any) => ({
          time: formatTime(parseManilaDate(item.fetched_at || item.created_at)),
          level: parseFloat(item.water_level)
        }));

        setHistory(mappedData);
        
        if (mappedData.length > 0) {
          const latest = result[result.length - 1];
          const levelVal = parseFloat(latest.water_level);
          setCurrentLevel(levelVal);
          setInputLevel(levelVal.toString());
          
          const targetDate = parseManilaDate(latest.fetched_at || latest.created_at);
          if (!isNaN(targetDate.getTime())) {
            setLastUpdated(targetDate.toLocaleString('en-PH', { 
              month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            }));
          } else {
            setLastUpdated('Unknown Date format');
          }
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSensorOnline(false); 
    }
  }, [sensorOnline]);

  useEffect(() => {
    fetchLiveHistory();
    const interval = setInterval(fetchLiveHistory, 30000); 
    return () => clearInterval(interval);
  }, [fetchLiveHistory]);

  const alert = getAlertInfo(currentLevel);
  const prevLevel = history[history.length - 2]?.level ?? currentLevel;
  const diff = currentLevel - prevLevel;
  const rising = diff > 0;

  const handleSave = async () => {
    const val = parseFloat(inputLevel);
    if (isNaN(val) || val < 0 || val > 30) return;
    
    setSaving(true);
    
    try {
      const userToken = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('auth_token') || '';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/admin/flood/manual-override`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${userToken}` 
        },
        body: JSON.stringify({ level: val })
      });

      if (response.ok) {
          const newEntry = { time: formatTime(new Date()), level: val };
          
          setCurrentLevel(val);
          setHistory(prev => [...prev.slice(-23), newEntry]);
          setLastUpdated(`${new Date().toLocaleString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })} • ${formatTime(new Date())}`);
          
          setSaving(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
      } else {
          console.error("Failed to save override. Status:", response.status);
          if (response.status === 401) {
             window.alert("Authentication error: Please log out and log back in to refresh your admin session.");
          }
          setSaving(false);
      }
    } catch (error) {
      console.error("API Error:", error);
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const userToken = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('auth_token') || '';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/admin/flood/reset-override`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
          setSensorOnline(true);
          await fetchLiveHistory();
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to reset:", error);
    } finally {
      setSaving(false);
    }
  };

  const alertLevels = [
    { label: 'NORMAL', range: '< 15m', color: '#22C55E', bg: '#DCFCE7' },
    { label: 'ALERT LEVEL 1', range: '15 – 16m', color: YELLOW, bg: '#FEF9C3' },
    { label: 'ALERT LEVEL 2', range: '16 – 17m', color: ORANGE, bg: '#FFEDD5' },
    { label: 'ALERT LEVEL 3', range: '17 – 18m', color: '#EF4444', bg: '#FEE2E2' },
    { label: 'CRITICAL', range: '> 18m', color: '#7F1D1D', bg: '#FEF2F2' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-black text-2xl" style={{ color: NAVY }}>Flood Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">Manual override control panel for Marikina River water level</p>
        </div>
        <button
          onClick={() => setSensorOnline(!sensorOnline)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all"
          style={{
            backgroundColor: sensorOnline ? '#F0FDF4' : '#FEF2F2',
            borderColor: sensorOnline ? '#BBF7D0' : '#FECACA',
            color: sensorOnline ? '#166534' : '#991B1B',
          }}
        >
          {sensorOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          Sensor: {sensorOnline ? 'Online' : 'Offline'}
          <span className={`w-2 h-2 rounded-full ${sensorOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        </button>
      </div>

      {!sensorOnline && (
        <div className="rounded-2xl p-4 flex items-center gap-4 border" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          <WifiOff size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-red-700">Automatic Sensor Offline</p>
            <p className="text-xs text-red-600 mt-0.5">
              PAGASA/MMDA sensor is not transmitting or Manual Override is active. Use the controls below to update data.
            </p>
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-4 flex items-center gap-4 border"
        style={{ backgroundColor: `${alert.color}10`, borderColor: `${alert.color}30` }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${alert.color}20` }}>
          <AlertTriangle size={24} style={{ color: alert.color }} />
        </div>
        <div className="flex-1">
          <p className="font-black text-lg" style={{ color: alert.color }}>
            {alert.label} — {currentLevel.toFixed(2)}m
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Sto. Niño Station • Last updated: {lastUpdated}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold flex-shrink-0" style={{ color: rising ? '#EF4444' : '#22C55E' }}>
          {rising ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          {Math.abs(diff).toFixed(2)}m
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base" style={{ color: NAVY }}>24-Hour Water Level History</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sto. Niño Monitoring Station Trend</p>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: sensorOnline ? '#F0FDF4' : '#FEF9C3', color: sensorOnline ? '#166534' : '#92400E' }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sensorOnline ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              {sensorOnline ? 'Auto Feed' : 'Manual Mode'}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={alert.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={alert.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
              
              {/* ─── NEW: Dynamic YAxis ─── */}
              <YAxis 
                domain={['dataMin - 0.2', 'dataMax + 0.2']} 
                tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={v => `${v.toFixed(1)}m`} 
              />
              
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine key="ref-fm-15" y={15} stroke={YELLOW} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '15m', fill: YELLOW, fontSize: 10, position: 'right' }} />
              <ReferenceLine key="ref-fm-16" y={16} stroke={ORANGE} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '16m', fill: ORANGE, fontSize: 10, position: 'right' }} />
              <ReferenceLine key="ref-fm-17" y={17} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '17m', fill: '#EF4444', fontSize: 10, position: 'right' }} />
              
              {/* ─── NEW: Added dots ─── */}
              <Area
                type="monotone"
                dataKey="level"
                stroke={alert.color}
                strokeWidth={2.5}
                fill="url(#floodGrad)"
                dot={{ r: 4, fill: 'white', stroke: alert.color, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: alert.color, stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ORANGE}15` }}>
                <Droplets size={16} style={{ color: ORANGE }} />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: NAVY }}>Manual Override</h3>
                <p className="text-[10px] text-gray-400">Update water level manually</p>
              </div>
            </div>

            <div
              className="rounded-xl p-4 text-center mb-4"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3560)` }}
            >
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Current Level</p>
              <div className="flex items-end justify-center gap-1">
                <span className="font-black" style={{ fontSize: '3.5rem', lineHeight: 1, color: alert.color }}>
                  {currentLevel.toFixed(2)}
                </span>
                <span className="text-white/50 text-lg mb-2">m</span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1"
                style={{ backgroundColor: `${alert.color}30`, color: alert.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: alert.color }} />
                {alert.label}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  New Water Level (meters)
                </label>
                <input
                  type="number"
                  value={inputLevel}
                  onChange={e => setInputLevel(e.target.value)}
                  min={0}
                  max={30}
                  step={0.1}
                  className="w-full px-4 py-3 rounded-xl border text-center font-black text-2xl focus:outline-none transition-all"
                  style={{
                    borderColor: `${alert.color}40`,
                    color: alert.color,
                    backgroundColor: `${alert.color}08`,
                  }}
                />
                <p className="text-xs text-gray-400 mt-1 text-center">Enter value in meters (0 – 30)</p>
              </div>

              {saved && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
                  <CheckCircle size={15} className="text-green-500" />
                  <p className="text-xs font-bold text-green-700">Level updated successfully!</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || inputLevel === currentLevel.toString()}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}
                >
                  {saving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  {saving ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Station Info</h3>
            {[
              { icon: <Activity size={12} />, label: 'Station', value: 'Sto. Niño Station' },
              { icon: <Clock size={12} />, label: 'Last Sync', value: lastUpdated },
              { icon: <Info size={12} />, label: 'Source', value: sensorOnline ? 'PAGASA Telemetry' : 'Manual Override' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-400">
                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: NAVY }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-sm mb-4" style={{ color: NAVY }}>Marikina River Alert Level Thresholds</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {alertLevels.map(lvl => {
            const isCurrent = getAlertInfo(currentLevel).label === lvl.label;
            return (
              <div
                key={lvl.label}
                className="rounded-xl p-4 text-center relative overflow-hidden transition-all"
                style={{
                  backgroundColor: lvl.bg,
                  border: isCurrent ? `2px solid ${lvl.color}` : '2px solid transparent',
                  transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {isCurrent && (
                  <div className="absolute top-2 right-2">
                    <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ backgroundColor: lvl.color }} />
                  </div>
                )}
                <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: lvl.color }} />
                <p className="text-xs font-black" style={{ color: lvl.color }}>{lvl.label}</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: lvl.color, opacity: 0.7 }}>{lvl.range}</p>
                {isCurrent && (
                  <p className="text-[10px] mt-1 font-black" style={{ color: lvl.color }}>● CURRENT</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Presets (Manual Testing)</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Normal (13m)', value: 13, color: '#22C55E' },
              { label: 'Alarm 1 (15.5m)', value: 15.5, color: YELLOW },
              { label: 'Alarm 2 (16.5m)', value: 16.5, color: ORANGE },
              { label: 'Alarm 3 (17.5m)', value: 17.5, color: '#EF4444' },
              { label: 'Critical (20m)', value: 20, color: '#7F1D1D' },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => {
                   setSensorOnline(false);
                   setInputLevel(preset.value.toString());
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: `${preset.color}15`, color: preset.color, border: `1px solid ${preset.color}30` }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}