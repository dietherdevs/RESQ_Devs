import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router';
import {
  LayoutDashboard, MessageSquare, Building2, Users, Activity,
  UserCog, ShieldCheck, Menu, X, LogOut, ChevronRight, Bell, Phone,
  History // <--- ADDED: History icon for the new menu item
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoginModal } from '../../components/modals/LoginModal';
import { RegisterModal } from '../../components/modals/RegisterModal';
import { ProfileModal } from '../../components/modals/ProfileModal';
import resqLogo from '../../../imports/resq111.png';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFB800';
const BLUE = '#3B82F6';

// ADDED: The new SMS Logs path to your navigation array
const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/send-sms', label: 'Send SMS Alert', icon: MessageSquare, accent: ORANGE },
  { path: '/admin/sms-logs', label: 'Broadcast History', icon: History, accent: ORANGE }, // <--- NEW ITEM
  { path: '/admin/evacuation-status', label: 'Evacuation Status', icon: Building2 },
  { path: '/admin/evacuees', label: 'Evacuees List', icon: Users },
  { path: '/admin/flood-monitoring', label: 'Flood Monitoring', icon: Activity, accent: YELLOW },
  { path: '/admin/manage-users', label: 'Manage Users', icon: UserCog },
  { path: '/admin/manage-admins', label: 'Manage Admins', icon: ShieldCheck, superAdminOnly: true },
];

export function AdminLayout() {
  const { user, logout, setShowLogin } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'superadmin';
  const isStaff = user?.role === 'staff';

  // Allow admin, superadmin, and staff
  const isAuthorized = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'staff');

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: NAVY, fontFamily: 'Inter, sans-serif' }}>
        <LoginModal />
        <RegisterModal />
        <div className="text-center px-4">
          <img src={resqLogo} alt="RESQ" className="h-14 w-auto object-contain mx-auto mb-4" />
          <h2 className="text-white font-black text-2xl mb-2">Admin Access Required</h2>
          <p className="text-white/50 mb-6">You must be logged in as an admin to view this page.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowLogin(true)} className="px-6 py-3 rounded-xl text-white font-bold text-sm" style={{ background: ORANGE }}>
              Login as Admin
            </button>
            <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl text-white font-semibold text-sm border border-white/20">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Staff cannot access manage-admins
  const visibleNavItems = navItems.filter(item => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    return true;
  });

  const roleColor = isSuperAdmin ? ORANGE : isStaff ? BLUE : YELLOW;

  const Sidebar = ({ mobile = false }) => (
    <div
      className={`flex flex-col h-full ${mobile ? 'w-72' : 'w-64'}`}
      style={{ backgroundColor: '#0A1628' }}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <img src={resqLogo} alt="RESQ" className="h-9 w-auto object-contain" />
        <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: ORANGE }}>Admin Panel</p>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: roleColor }}>
            {user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.name}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{
              backgroundColor: `${roleColor}30`,
              color: roleColor,
            }}>
              {user.role}
            </span>
          </div>
        </div>
        {isStaff && (
          <div className="mt-2 px-3 py-2 rounded-xl" style={{ backgroundColor: `${BLUE}15`, border: `1px solid ${BLUE}30` }}>
            <p className="text-xs" style={{ color: BLUE }}>
              <span className="font-bold">Staff:</span> Full access except Manage Admins & approvals
            </p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? {
                backgroundColor: item.accent ? `${item.accent}20` : 'rgba(255,255,255,0.1)',
                color: item.accent || 'white',
              } : {}}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} style={{ color: isActive ? (item.accent || 'white') : undefined }} />
                  <span className="flex-1">{item.label}</span>
                  {item.accent && isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.accent }} />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
        >
          <Phone size={16} />
          Public Site
        </button>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F0F2F5', fontFamily: 'Inter, sans-serif' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0 shadow-2xl">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative shadow-2xl">
            <Sidebar mobile />
          </div>
          <button className="absolute top-4 right-4 text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 border-b bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
              style={{ color: NAVY }}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-1 text-sm text-gray-400">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span style={{ color: NAVY }} className="font-semibold capitalize">{user.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isStaff ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${BLUE}15`, color: BLUE }}>
                <UserCog size={13} />
                Staff Access
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FFEDD5', color: ORANGE }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
                Live Monitoring
              </div>
            )}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} style={{ color: NAVY }} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: ORANGE }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}