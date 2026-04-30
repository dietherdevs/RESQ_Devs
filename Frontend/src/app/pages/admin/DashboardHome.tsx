import { Activity, Users, Building2, MessageSquare, AlertTriangle, TrendingUp, Clock, Droplets } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { floodHistory, CURRENT_LEVEL, getAlertInfo, evacuationCenters, evacueesList } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

const recentAlerts = [
  { id: 1, msg: 'Flood level reached Alert Level 2 at Sto. Niño', time: '10:42 PM', type: 'warning' },
  { id: 2, msg: 'SMS alert broadcast to 1,247 registered users', time: '10:30 PM', type: 'info' },
  { id: 3, msg: 'Parang National HS reached full capacity (300/300)', time: '9:15 PM', type: 'danger' },
  { id: 4, msg: 'New user registration pending approval (3 pending)', time: '8:50 PM', type: 'info' },
  { id: 5, msg: 'Flood level update: 17.8m — Alert Level 2 maintained', time: '8:00 PM', type: 'warning' },
];

export function DashboardHome() {
  const { user } = useApp();
  const alert = getAlertInfo(CURRENT_LEVEL);
  const openCenters = evacuationCenters.filter(c => c.status === 'open').length;
  const totalEvacuees = evacueesList.reduce((acc, e) => acc + e.total, 0);

  const stats = [
    {
      label: 'Current Flood Level',
      value: `${CURRENT_LEVEL}m`,
      sub: alert.label,
      icon: <Droplets size={20} />,
      color: alert.color,
      bg: `${alert.color}15`,
    },
    {
      label: 'Open Evac Centers',
      value: `${openCenters} / ${evacuationCenters.length}`,
      sub: 'Centers Operational',
      icon: <Building2 size={20} />,
      color: '#22C55E',
      bg: '#DCFCE7',
    },
    {
      label: 'Total Evacuees',
      value: totalEvacuees.toString(),
      sub: `${evacueesList.length} family records`,
      icon: <Users size={20} />,
      color: ORANGE,
      bg: '#FFEDD5',
    },
    {
      label: 'SMS Alerts Sent',
      value: '1,247',
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
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's your emergency system overview for{' '}
          <span className="font-semibold">April 30, 2025</span>
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
            Active Alert: {alert.label} — Marikina River at {CURRENT_LEVEL}m
          </p>
          <p className="text-xs mt-0.5 text-gray-500">
            Water level is currently above Alert Level 1 threshold. Monitor closely and prepare for possible escalation.
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
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={floodHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminFlood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ORANGE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="time" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[12, 22]} tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: NAVY, border: 'none', borderRadius: 8, color: 'white' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                itemStyle={{ color: ORANGE, fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="level" stroke={ORANGE} strokeWidth={2} fill="url(#adminFlood)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Recent Activity</h3>
          <div className="space-y-3">
            {recentAlerts.map(a => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Quick Evac Overview */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-base mb-4" style={{ color: NAVY }}>Evacuation Center Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {evacuationCenters.map(center => {
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
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{center.current}/{center.capacity} ({pct}%)</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}