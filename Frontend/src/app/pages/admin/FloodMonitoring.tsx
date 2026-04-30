import { useState } from 'react';
import {
  Activity, Droplets, AlertTriangle, Save, RotateCcw,
  Wifi, WifiOff, Clock, CheckCircle, Info, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { floodHistory, CURRENT_LEVEL, getAlertInfo, ALERT_THRESHOLDS } from '../../data/mockData';

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
        <p className="font-black text-base" style={{ color: alert.color }}>{val.toFixed(1)} m</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: alert.color }}>{alert.label}</p>
      </div>
    );
  }
  return null;
}

export function FloodMonitoring() {
  const [currentLevel, setCurrentLevel] = useState(CURRENT_LEVEL);
  const [inputLevel, setInputLevel] = useState(CURRENT_LEVEL.toString());
  const [history, setHistory] = useState(floodHistory);
  const [sensorOnline, setSensorOnline] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('April 30, 2026 • 10:42 PM');

  const alert = getAlertInfo(currentLevel);
  const prevLevel = history[history.length - 2]?.level ?? currentLevel;
  const diff = currentLevel - prevLevel;
  const rising = diff > 0;

  const handleSave = () => {
    const val = parseFloat(inputLevel);
    if (isNaN(val) || val < 0 || val > 30) return;
    setSaving(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
      const newEntry = { time: timeStr, level: val };
      setCurrentLevel(val);
      setHistory(prev => [...prev.slice(-11), newEntry]);
      setLastUpdated(`April 30, 2026 • ${timeStr}`);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  const handleReset = () => {
    setInputLevel(currentLevel.toString());
  };

  const alertLevels = [
    { label: 'Normal', range: '< 15m', color: '#22C55E', bg: '#DCFCE7', threshold: 15 },
    { label: 'Alert Level 1', range: '15 – 17m', color: YELLOW, bg: '#FEF9C3', threshold: 17 },
    { label: 'Alert Level 2', range: '17 – 20m', color: ORANGE, bg: '#FFEDD5', threshold: 20 },
    { label: 'Alert Level 3', range: '20 – 22m', color: '#EF4444', bg: '#FEE2E2', threshold: 22 },
    { label: 'Critical', range: '> 22m', color: '#7F1D1D', bg: '#FEF2F2', threshold: 99 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-black text-2xl" style={{ color: NAVY }}>Flood Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">Manual override control panel for Marikina River water level</p>
        </div>
        {/* Sensor Status */}
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

      {/* Sensor Offline Warning */}
      {!sensorOnline && (
        <div className="rounded-2xl p-4 flex items-center gap-4 border" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
          <WifiOff size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm text-red-700">Automatic Sensor Offline</p>
            <p className="text-xs text-red-600 mt-0.5">
              PAGASA/MMDA sensor is not transmitting. Use the manual override below to update the current water level.
            </p>
          </div>
        </div>
      )}

      {/* Current Alert Banner */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4 border"
        style={{ backgroundColor: `${alert.color}10`, borderColor: `${alert.color}30` }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${alert.color}20` }}>
          <AlertTriangle size={24} style={{ color: alert.color }} />
        </div>
        <div className="flex-1">
          <p className="font-black text-lg" style={{ color: alert.color }}>
            {alert.label} — {currentLevel}m
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Marikina River, Sto. Niño Station • Last updated: {lastUpdated}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold flex-shrink-0" style={{ color: rising ? '#EF4444' : '#22C55E' }}>
          {rising ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          {Math.abs(diff).toFixed(1)}m
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base" style={{ color: NAVY }}>24-Hour Water Level History</h3>
              <p className="text-xs text-gray-400 mt-0.5">Marikina River, Sto. Niño Monitoring Station</p>
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
              <YAxis domain={[12, 25]} tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}m`} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine key="ref-fm-normal" y={15} stroke="#22C55E" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '15m', fill: '#22C55E', fontSize: 10, position: 'right' }} />
              <ReferenceLine key="ref-fm-alert1" y={17} stroke={YELLOW} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '17m', fill: YELLOW, fontSize: 10, position: 'right' }} />
              <ReferenceLine key="ref-fm-alert2" y={20} stroke={ORANGE} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '20m', fill: ORANGE, fontSize: 10, position: 'right' }} />
              <Area
                type="monotone"
                dataKey="level"
                stroke={alert.color}
                strokeWidth={2.5}
                fill="url(#floodGrad)"
                dot={false}
                activeDot={{ r: 5, fill: alert.color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Manual Override */}
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

            {/* Big Level Display */}
            <div
              className="rounded-xl p-4 text-center mb-4"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3560)` }}
            >
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Current Level</p>
              <div className="flex items-end justify-center gap-1">
                <span className="font-black" style={{ fontSize: '3.5rem', lineHeight: 1, color: alert.color }}>
                  {currentLevel}
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

            {/* Input */}
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
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
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

          {/* Sensor Info */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Station Info</h3>
            {[
              { icon: <Activity size={12} />, label: 'Station', value: 'Sto. Niño Station' },
              { icon: <Clock size={12} />, label: 'Last Update', value: lastUpdated },
              { icon: <Info size={12} />, label: 'Source', value: sensorOnline ? 'PAGASA / MMDA Sensor' : 'Manual Override' },
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

      {/* Alert Level Reference */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-sm mb-4" style={{ color: NAVY }}>Marikina River Alert Level Thresholds</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {alertLevels.map(lvl => {
            const isCurrent = getAlertInfo(currentLevel).label === lvl.label ||
              (lvl.label === 'Normal' && currentLevel < 15) ||
              (lvl.label === 'Alert Level 1' && currentLevel >= 15 && currentLevel < 17) ||
              (lvl.label === 'Alert Level 2' && currentLevel >= 17 && currentLevel < 20) ||
              (lvl.label === 'Alert Level 3' && currentLevel >= 20 && currentLevel < 22) ||
              (lvl.label === 'Critical' && currentLevel >= 22);
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

        {/* Quick Preset Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Presets (Demo)</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Normal (13m)', value: 13, color: '#22C55E' },
              { label: 'Alert 1 (16m)', value: 16, color: YELLOW },
              { label: 'Alert 2 (18.5m)', value: 18.5, color: ORANGE },
              { label: 'Alert 3 (21m)', value: 21, color: '#EF4444' },
              { label: 'Critical (23m)', value: 23, color: '#7F1D1D' },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => setInputLevel(preset.value.toString())}
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