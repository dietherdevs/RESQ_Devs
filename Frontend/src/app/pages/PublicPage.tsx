import { useRef, useState, useEffect } from 'react'; 
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import {
  AlertTriangle, MapPin, Clock, Database, Phone, Users, ChevronRight,
  Droplets, Activity, Shield, Heart, Info, ExternalLink, Navigation, Bell,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import {
  getAlertInfo, nationalHotlines, marikinаHotlines,
} from '../data/mockData';
import { GlobalNav } from '../components/GlobalNav';
import { LoginModal } from '../components/modals/LoginModal';
import { RegisterModal } from '../components/modals/RegisterModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { ForgotPasswordModal } from '../components/modals/ForgotPasswordModal'; 
import resqLogo from '../../imports/resq111.png';
import logosImg from '../../imports/logos.png';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';

const parseLaravelDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  let safeStr = dateStr.replace('Z', '').split('.')[0];
  safeStr = safeStr.includes('T') ? safeStr : safeStr.replace(' ', 'T');
  return new Date(safeStr);
};

const formatManilaTime = (timestamp: string) => {
  if (!timestamp) return "...";
  const date = parseLaravelDate(timestamp);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleTimeString('en-PH', { 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });
};

const getFriendlyTime = (timestamp: string) => {
  if (!timestamp) return "Loading...";
  const date = parseLaravelDate(timestamp);
  if (isNaN(date.getTime())) return "Invalid Date";

  const diffMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
  if (diffMinutes <= 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

function LogosBanner() {
  return (
    <div className="w-full flex items-center justify-center py-3 px-4 border-b border-white/10" style={{ backgroundColor: '#060F1A' }}>
      <img src={logosImg} alt="PUP Itech & RESQ Logos" className="h-12 sm:h-16 w-auto object-contain" />
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    const val = payload[0].value as number;
    const alert = getAlertInfo(val);
    return (
      <div className="rounded-lg px-3 py-2 shadow-xl border" style={{ backgroundColor: '#0D1B2A', borderColor: 'rgba(255,255,255,0.15)' }}>
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <p className="font-bold text-base" style={{ color: alert.color }}>{val.toFixed(2)} m</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: alert.color }}>{alert.label}</p>
      </div>
    );
  }
  return null;
}

function HeroSection({ liveData, evacData }: { liveData: any[], evacData: any[] }) {
  const { lang } = useApp();
  const t = translations[lang].hero;
  
  const latest = liveData[liveData.length - 1];
  const currentLevel = latest ? parseFloat(latest.water_level) : 0;
  const alert = getAlertInfo(currentLevel);
  const pct = Math.min(100, ((currentLevel - 10) / (25 - 10)) * 100);

  const openCentersCount = evacData.filter(c => c.status !== 'closed').length;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: NAVY }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: ORANGE }} />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#0066FF' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: `${alert.color}18`, borderColor: `${alert.color}40` }}>
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: alert.color }} />
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: alert.color }}>Live Monitoring Active — {alert.label}</span>
            </div>

            <div><img src={logosImg} alt="PUP Itech & RESQ Logos" className="h-28 sm:h-32 w-auto object-contain" /></div>

            <div>
              <h1 className="text-white font-black mb-3" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15 }}>{t.welcome}</h1>
              <p className="text-white/60 text-lg max-w-lg" style={{ lineHeight: 1.7 }}>{t.subtitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Droplets size={18} />, label: 'Flood Level', value: `${currentLevel.toFixed(2)}m`, color: alert.color },
                { icon: <Users size={18} />, label: 'Active Centers', value: `${openCentersCount} Open`, color: '#22C55E' },
                { icon: <Activity size={18} />, label: 'SMS Alerts', value: 'Live Sync', color: YELLOW },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4 border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>{s.icon}</div>
                  <p className="text-white font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="#hotlines" className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 shadow-lg" style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}><Phone size={16} /> View Hotlines</a>
              <a href="#evacuation" className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm border border-white/20 hover:bg-white/10 transition-all"><Navigation size={16} /> Find Evacuation Center</a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Marikina River</p>
                  <h3 className="text-white font-bold text-base">{t.currentLevel}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${alert.color}20` }}>
                  <Droplets size={20} style={{ color: alert.color }} />
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-end justify-center gap-2">
                  <span className="font-black" style={{ fontSize: '5rem', lineHeight: 1, color: alert.color }}>{currentLevel.toFixed(1)}</span>
                  <span className="text-white/50 text-xl mb-3">m</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mt-1" style={{ backgroundColor: `${alert.color}25`, color: alert.color }}><AlertTriangle size={14} /> {alert.label}</div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/40 mb-1.5">
                  <span>10m</span>
                  <span>Normal &lt;15m</span>
                  <span>25m</span>
                </div>
                <div className="relative h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="absolute inset-0 flex">
                    <div className="h-full" style={{ width: '33%', backgroundColor: 'rgba(34,197,94,0.4)' }} />
                    <div className="h-full" style={{ width: '13%', backgroundColor: 'rgba(255,184,0,0.4)' }} />
                    <div className="h-full" style={{ width: '20%', backgroundColor: 'rgba(255,107,43,0.4)' }} />
                    <div className="h-full" style={{ width: '13%', backgroundColor: 'rgba(239,68,68,0.4)' }} />
                    <div className="h-full flex-1" style={{ backgroundColor: 'rgba(127,29,29,0.4)' }} />
                  </div>
                  <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #22C55E, ${alert.color})` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-1000" style={{ left: `${pct}%`, transform: `translate(-50%, -50%)`, backgroundColor: alert.color }} />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>Normal</span>
                  <span>Alarm 1</span>
                  <span>Alarm 2</span>
                  <span>Alarm 3</span>
                  <span>Critical</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
                <div className="flex items-center gap-1.5"><MapPin size={11} style={{ color: ORANGE }} /> <span>Sto. Niño Station</span></div>
                <div className="flex items-center gap-1.5 justify-end"><Clock size={11} style={{ color: ORANGE }} /> <span>Updated {getFriendlyTime(latest?.fetched_at || latest?.created_at)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/30 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}

function FloodSection({ liveData }: { liveData: any[] }) {
  const { lang, darkMode } = useApp();
  const t = translations[lang].flood;

  const chartData = liveData.map(item => ({
    time: formatManilaTime(item.fetched_at || item.created_at),
    level: parseFloat(item.water_level)
  }));

  const latest = liveData[liveData.length - 1];
  const currentLevel = latest ? parseFloat(latest.water_level) : 0;
  const alert = getAlertInfo(currentLevel);

  const sectionBg = darkMode ? '#0D1B2A' : '#F8F9FA';
  const cardBg = darkMode ? 'rgba(255,255,255,0.05)' : 'white';
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6';
  const titleColor = darkMode ? 'white' : '#0D1B2A';
  const subColor = darkMode ? 'rgba(255,255,255,0.4)' : '#6B7280';
  const gridStroke = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tickFill = darkMode ? 'rgba(255,255,255,0.3)' : '#9CA3AF';
  const detailBg = darkMode ? 'rgba(255,255,255,0.04)' : 'white';
  const detailBorder = darkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6';

  return (
    <section id="flood" className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: sectionBg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0D1B2A' }}>
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-black text-2xl" style={{ color: titleColor }}>{t.title}</h2>
            <p className="text-sm" style={{ color: subColor }}>{t.history}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-base" style={{ color: titleColor }}>{t.history}</h3>
              <div className="flex items-center gap-2 text-xs" style={{ color: subColor }}>
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: alert.color, display: 'inline-block' }} />
                Water Level (m)
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ORANGE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                
                {/* ─── NEW: Dynamic YAxis ─── */}
                <YAxis 
                  domain={['dataMin - 0.2', 'dataMax + 0.2']} 
                  tick={{ fill: tickFill, fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={v => `${v.toFixed(1)}m`} 
                />
                
                <Tooltip content={<ChartTooltip />} />
                
                <ReferenceLine key="pub-ref-15" y={15} stroke={YELLOW} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Alarm 1', fill: YELLOW, fontSize: 10, position: 'right' }} />
                <ReferenceLine key="pub-ref-16" y={16} stroke={ORANGE} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Alarm 2', fill: ORANGE, fontSize: 10, position: 'right' }} />
                <ReferenceLine key="pub-ref-17" y={17} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Alarm 3', fill: '#EF4444', fontSize: 10, position: 'right' }} />
                
                {/* ─── NEW: Added dots ─── */}
                <Area 
                  type="monotone" 
                  dataKey="level" 
                  stroke={ORANGE} 
                  strokeWidth={2.5} 
                  fill="url(#colorLevel)" 
                  dot={{ r: 4, fill: 'white', stroke: ORANGE, strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: ORANGE, stroke: 'white', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(135deg, #0D1B2A, #1a2f4a)` }}>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{t.level}</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-black text-5xl" style={{ color: alert.color }}>{currentLevel.toFixed(2)}</span>
                <span className="text-white/50 text-lg mb-2">m</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${alert.color}30`, color: alert.color }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: alert.color }} />
                {alert.label}
              </div>
            </div>

            {[
              { icon: <MapPin size={14} />, label: t.location, value: 'Marikina River, Sto. Niño' },
              { icon: <Clock size={14} />, label: t.updated, value: latest ? formatManilaTime(latest.fetched_at || latest.created_at) : '...' },
              { icon: <Database size={14} />, label: t.source, value: 'PAGASA Telemetry' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-4 border shadow-sm" style={{ backgroundColor: detailBg, borderColor: detailBorder }}>
                <div className="flex items-center gap-2 mb-1" style={{ color: ORANGE }}>{item.icon}</div>
                <p className="text-xs font-medium" style={{ color: subColor }}>{item.label}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: titleColor }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: subColor }}>Sto. Niño Station Protocol</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Normal', range: '< 15m', color: '#22C55E', bg: '#DCFCE7' },
              { label: 'Alarm 1 (Alert)', range: '15 – 16m', color: YELLOW, bg: '#FEF9C3' },
              { label: 'Alarm 2 (Warning)', range: '16 – 17m', color: ORANGE, bg: '#FFEDD5' },
              { label: 'Alarm 3 (Forced)', range: '> 17m', color: '#EF4444', bg: '#FEE2E2' },
            ].map(lvl => (
              <div key={lvl.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: darkMode ? `${lvl.color}18` : lvl.bg }}>
                <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ backgroundColor: lvl.color }} />
                <p className="text-xs font-bold" style={{ color: lvl.color }}>{lvl.label}</p>
                <p className="text-xs mt-0.5" style={{ color: lvl.color, opacity: 0.7 }}>{lvl.range}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EvacuationSection({ evacData }: { evacData: any[] }) {
  const { lang, darkMode } = useApp();
  const t = translations[lang].evacuation;

  const sectionBg = darkMode ? '#132236' : 'white';
  const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : 'white';
  const closedCardBg = darkMode ? 'rgba(255,255,255,0.02)' : '#FAFAFA';
  const titleColor = darkMode ? 'white' : '#0D1B2A';
  const subColor = darkMode ? 'rgba(255,255,255,0.4)' : '#6B7280';
  const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const dividerColor = darkMode ? 'rgba(255,255,255,0.06)' : '#F9FAFB';

  const statusConfig: Record<string, any> = {
    open: { label: t.status.open, color: '#22C55E', bg: '#DCFCE7', dot: '#22C55E' },
    full: { label: t.status.full, color: '#FF6B2B', bg: '#FFEDD5', dot: '#FF6B2B' },
    closed: { label: t.status.closed, color: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
  };

  return (
    <section id="evacuation" className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: sectionBg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}>
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-2xl" style={{ color: titleColor }}>{t.title}</h2>
              <p className="text-sm" style={{ color: subColor }}>{t.subtitle}</p>
            </div>
          </div>
          <div className="hidden md:flex gap-4 text-sm">
            {(['open', 'full', 'closed'] as const).map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusConfig[s].dot }} />
                <span style={{ color: subColor }} className="font-medium capitalize">{statusConfig[s].label}</span>
              </div>
            ))}
          </div>
        </div>

        {evacData.length === 0 ? (
          <div className="text-center py-10">
            <p style={{ color: subColor }}>Loading evacuation centers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {evacData.map(center => {
              const status = center.status?.toLowerCase() || 'closed';
              const sc = statusConfig[status] || statusConfig['closed'];
              
              const capacity = center.capacity || 1;
              const current = center.current || 0;
              const pct = status === 'closed' ? 0 : Math.round((current / capacity) * 100);
              const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? ORANGE : '#22C55E';

              const contactList = center.contact ? String(center.contact).split(',').map(c => c.trim()) : [];

              return (
                <div
                  key={center.id}
                  className="rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: cardBorder, backgroundColor: status === 'closed' ? closedCardBg : cardBg }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-3">
                      <h3 className="font-bold text-base" style={{ color: status === 'closed' ? '#9CA3AF' : titleColor }}>{center.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-400 leading-tight">{center.location}</p>
                      </div>
                    </div>
                    <span
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: sc.bg, color: sc.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                      {sc.label}
                    </span>
                  </div>

                  {status !== 'closed' && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-gray-400">{t.capacity}</span>
                        <span className="text-xs font-bold" style={{ color: barColor }}>{current} / {capacity} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3" style={{ borderColor: dividerColor }}>
                    <p className="text-xs text-gray-400 mb-1.5 font-medium">{t.contact}</p>
                    <div className="flex flex-wrap gap-2">
                      {contactList.map((c: string, index: number) => (
                        <a
                          key={index}
                          href={`tel:${c.replace(/\D/g, '')}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{
                            backgroundColor: status === 'closed'
                              ? (darkMode ? 'rgba(255,255,255,0.05)' : '#F3F4F6')
                              : (darkMode ? 'rgba(255,107,43,0.15)' : `rgba(13,27,42,0.08)`),
                            color: status === 'closed' ? '#9CA3AF' : (darkMode ? '#FF6B2B' : '#0D1B2A'),
                          }}
                        >
                          <Phone size={11} /> {c}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function HotlineSection() {
  const { lang } = useApp();
  const t = translations[lang].hotlines;

  return (
    <section id="hotlines" className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: 'rgba(255,107,43,0.15)', color: ORANGE }}>
            <Phone size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">{t.title}</span>
          </div>
          <h2 className="text-white font-black text-3xl mb-2">{t.title}</h2>
          <p className="text-white/50 text-sm">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: ORANGE }} />
              <h3 className="text-white font-bold text-lg">{t.national}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nationalHotlines.map(h => (
                <a
                  key={h.name}
                  href={`tel:${h.number.replace(/\D/g, '')}`}
                  className="group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all hover:border-orange-400/50 hover:bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${ORANGE}30, ${ORANGE}10)` }}>
                    <Phone size={15} style={{ color: ORANGE }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{h.name}</p>
                    <p className="text-white/40 text-xs truncate">{h.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-black text-sm" style={{ color: ORANGE }}>{h.number}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: YELLOW }} />
              <h3 className="text-white font-bold text-lg">{t.local}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {marikinаHotlines.map(h => (
                <a
                  key={h.name}
                  href={`tel:${h.number.replace(/\D/g, '')}`}
                  className="group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all hover:border-yellow-400/50 hover:bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${YELLOW}30, ${YELLOW}10)` }}>
                    <Phone size={15} style={{ color: YELLOW }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{h.name}</p>
                    <p className="text-white/40 text-xs truncate">{h.desc}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-black text-sm" style={{ color: YELLOW }}>{h.number}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: `linear-gradient(135deg, ${ORANGE}, #e85a1a)` }}>
          <div>
            <p className="text-white font-black text-xl">In immediate danger?</p>
            <p className="text-white/80 text-sm mt-0.5">Call NDRRMC national emergency hotline now</p>
          </div>
          <a href="tel:8911" className="flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-xl font-black text-2xl shadow-xl transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: 'white', color: ORANGE }}>
            <Phone size={22} className="animate-pulse" />
            8911
          </a>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { lang } = useApp();
  const t = translations[lang].about;

  const features = [
    { icon: <Activity size={20} />, title: 'Real-Time Monitoring', desc: 'Live flood data from PAGASA Sto. Niño telemetry sensors.' },
    { icon: <Bell size={20} />, title: 'SMS Alert System', desc: 'Instant SMS notifications to registered residents during flood emergencies.' },
    { icon: <Shield size={20} />, title: 'Evacuation Guidance', desc: 'Up-to-date information on open evacuation centers and their capacity.' },
    { icon: <Phone size={20} />, title: 'Quick Access Hotlines', desc: 'One-tap access to all national and local emergency contact numbers.' },
  ];

  return (
    <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10" style={{ backgroundColor: '#0A1628' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src={resqLogo} alt="RESQ" className="h-10 w-auto object-contain" />
              <h2 className="text-white font-black text-2xl">{t.title}</h2>
            </div>
            <p className="text-white/60 leading-relaxed mb-6" style={{ lineHeight: 1.8 }}>{t.desc}</p>
            <div className="rounded-2xl p-5 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Heart size={16} style={{ color: ORANGE }} />
                <p className="text-white/80 font-semibold text-sm">{t.credit}</p>
              </div>
              <p className="text-white/40 text-xs">Polytechnic University of the Philippines — Information Technology</p>
              <p className="text-white/40 text-xs mt-1 italic">"{t.tagline}"</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {features.map(f => (
              <div key={f.title} className="rounded-2xl p-5 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${ORANGE}20` }}>
                  <span style={{ color: ORANGE }}>{f.icon}</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">{f.title}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={resqLogo} alt="RESQ" className="h-8 w-auto object-contain opacity-80" />
            <span className="text-white/50 text-sm">RESQ © 2026 — All rights reserved</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>Powered by PAGASA data</span>
            <span>•</span>
            <span>PUP Itech Project</span>
            <span>•</span>
            <span>Marikina City, Philippines</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PublicPage() {
  const [liveFloodData, setLiveFloodData] = useState<any[]>([]);
  const [liveEvacData, setLiveEvacData] = useState<any[]>([]);

  const fetchLiveFlood = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/flood/history?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setLiveFloodData(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      console.error("Flood sync error:", err);
    }
  };

  const fetchLiveEvac = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/evacuation-centers?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        const actualData = Array.isArray(data) ? data : (data.data || []);
        setLiveEvacData(actualData);
      }
    } catch (err) {
      console.error("Evac sync error:", err);
    }
  };

  useEffect(() => {
    fetchLiveFlood();
    fetchLiveEvac();
    
    const interval = setInterval(() => {
      fetchLiveFlood();
      fetchLiveEvac();
    }, 600000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <GlobalNav />
      <LoginModal />
      <RegisterModal />
      <ProfileModal />
      <ForgotPasswordModal />
      
      <HeroSection liveData={liveFloodData} evacData={liveEvacData} />
      <FloodSection liveData={liveFloodData} />
      <EvacuationSection evacData={liveEvacData} />
      
      <HotlineSection />
      <AboutSection />
    </div>
  );
}