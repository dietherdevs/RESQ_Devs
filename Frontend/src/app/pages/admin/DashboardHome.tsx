import { useState, useEffect } from 'react';
import { Activity, Users, Building2, MessageSquare, AlertTriangle, TrendingUp, Clock, Droplets } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getAlertInfo } from '../../data/mockData'; 
import { useApp } from '../../context/AppContext';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

interface ActivityItem {
  id: string;
  msg: string;
  time: string;
  type: 'info' | 'warning' | 'danger';
}

interface CenterItem {
  id: number;
  name: string;
  capacity: number;
  current: number;
  status: 'open' | 'closed' | 'full';
}

interface FloodItem {
  time: string;
  level: number;
}

interface DashboardStats {
  water_level: number;
  open_centers: number;
  total_centers: number;
  total_evacuees: number;
  sms_sent_today: number;
  recent_activity: ActivityItem[];
  evacuation_centers: CenterItem[];
  flood_history: FloodItem[];
}

// ─── NEW: Cloned Custom Tooltip from Monitoring ───
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

export function DashboardHome() {
  const { user, currentWaterLevel } = useApp() as any; 
  
  const [statsData, setStatsData] = useState<DashboardStats>({
    water_level: 0,
    open_centers: 0,
    total_centers: 0,
    total_evacuees: 0,
    sms_sent_today: 0,
    recent_activity: [],
    evacuation_centers: [],
    flood_history: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    
    // Refresh the dashboard every 30 seconds for live updates
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/admin/dashboard-stats', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setStatsData(result.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeWaterLevel = currentWaterLevel ?? statsData.water_level;
  const alert = getAlertInfo(activeWaterLevel);

  const stats = [
    {
      label: 'Current Flood Level',
      value: loading ? '...' : `${activeWaterLevel.toFixed(2)}m`,
      sub: alert.label,
      icon: <Droplets size={20} />,
      color: alert.color,
      bg: `${alert.color}15`,
    },
    {
      label: 'Open Evac Centers',
      value: loading ? '...' : `${statsData.open_centers} / ${statsData.total_centers}`,
      sub: 'Centers Operational',
      icon: <Building2 size={20} />,
      color: '#22C55E',
      bg: '#DCFCE7',
    },
    {
      label: 'Total Evacuees',
      value: loading ? '...' : statsData.total_evacuees.toLocaleString(),
      sub: 'Total Active Records',
      icon: <Users size={20} />,
      color: ORANGE,
      bg: '#FFEDD5',
    },
    {
      label: 'SMS Alerts Sent',
      value: loading ? '...' : statsData.sms_sent_today.toLocaleString(),
      sub: 'Today\'s broadcasts',
      icon: <MessageSquare size={20} />,
      color: YELLOW,
      bg: '#FEF9C3',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-black text-2xl" style={{ color: NAVY }}>
          Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's your emergency system overview for{' '}
          <span className="font-semibold">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </p>
      </div>

      {/* Alert Banner */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4 border"
        style={{ backgroundColor: `${alert.color}10`, borderColor: `${alert.color}30` }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${alert.color}20` }}>
          <AlertTriangle size={20} style={{ color: alert.color }} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: alert.color }}>
            Active Alert: {alert.label} — Marikina River at {activeWaterLevel.toFixed(2)}m
          </p>
          <p className="text-xs mt-0.5 text-gray-500">
            Water level is currently being monitored. Follow LGU protocols and prepare for updates.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0" style={{ color: alert.color }}>
          <Clock size={12} />
          Live
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <p className="font-black text-2xl" style={{ color: s.color }}>{s.value}</p>
            <p className="text-gray-400 text-xs mt-1 font-medium">{s.sub}</p>
            <p className="text-gray-600 text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bento Row: Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base" style={{ color: NAVY }}>24-Hour Flood Level Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Marikina River, Sto. Niño Station</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FFEDD5', color: ORANGE }}>
              <Activity size={11} /> Live Data
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={statsData.flood_history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="adminFloodDashboard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={alert.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={alert.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
              
              {/* ─── FIX: Exact Dynamic Y-Axis from Monitoring ─── */}
              <YAxis 
                domain={['dataMin - 0.2', 'dataMax + 0.2']} 
                tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={v => `${v.toFixed(1)}m`} 
              />
              
              <Tooltip content={<ChartTooltip />} />
              
              {/* ─── FIX: Added Reference Lines ─── */}
              <ReferenceLine y={15} stroke={YELLOW} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '15m', fill: YELLOW, fontSize: 10, position: 'right' }} />
              <ReferenceLine y={16} stroke={ORANGE} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '16m', fill: ORANGE, fontSize: 10, position: 'right' }} />
              <ReferenceLine y={17} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '17m', fill: '#EF4444', fontSize: 10, position: 'right' }} />

              {/* ─── FIX: Added dots & active dots, dynamic color ─── */}
              <Area 
                type="monotone" 
                dataKey="level" 
                stroke={alert.color} 
                strokeWidth={2.5} 
                fill="url(#adminFloodDashboard)" 
                dot={{ r: 3, fill: 'white', stroke: alert.color, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: alert.color, stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Recent Activity</h3>
          <div className="space-y-3">
            {statsData.recent_activity.length > 0 ? statsData.recent_activity.map(a => (
              <div key={a.id} className="flex gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: a.type === 'danger' ? '#EF4444' : a.type === 'warning' ? YELLOW : '#60A5FA' }}
                />
                <div>
                  <p className="text-xs text-gray-600 leading-snug">{a.msg}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-400 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Evac Overview */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Evacuation Center Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {statsData.evacuation_centers.length > 0 ? statsData.evacuation_centers.map(center => {
            const pct = center.status === 'closed' ? 0 : Math.round((center.current / center.capacity) * 100);
            const statusColor = center.status === 'open' ? '#22C55E' : center.status === 'full' ? ORANGE : '#9CA3AF';
            const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? ORANGE : '#22C55E';
            return (
              <div key={center.id} className="rounded-xl p-3.5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold truncate pr-2" style={{ color: NAVY }}>{center.name}</p>
                  <span
                    className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                    style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                  >
                    {center.status}
                  </span>
                </div>
                {center.status !== 'closed' && (
                  <div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{center.current}/{center.capacity} ({pct}%)</p>
                  </div>
                )}
              </div>
            );
          }) : (
             <p className="text-xs text-gray-400 py-2">No evacuation centers registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}