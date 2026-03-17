import React from 'react';
import { X, Home, Droplets, MapPin, Phone, Info, Activity, LayoutDashboard, MessageSquare, Users, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import logo from 'figma:asset/4b574b690eba4a74e73324033005afce9cdefd16.png';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ isOpen, onClose, currentPage, onNavigate }: SidebarProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  // --- PAGES CONFIGURATION ---
  const publicPages = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'flood', label: t('floodLevel'), icon: Droplets },
    { id: 'evacuation', label: t('evacuationCenters'), icon: MapPin },
    { id: 'hotlines', label: t('hotlines'), icon: Phone },
    { id: 'about', label: t('about'), icon: Info },
    { id: 'status', label: t('websiteStatus'), icon: Activity },
  ];

  const staffPages = [
    { id: 'admin-dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'admin-sms', label: t('sendSMS'), icon: MessageSquare },
    { id: 'admin-evacuation', label: t('evacuationStatus'), icon: MapPin },
    { id: 'admin-evacuees', label: t('evacueesList'), icon: Users },
    { id: 'flood-level', label: 'Flood Monitoring', icon: Droplets }, 
  ];

  const adminPages = [
    ...staffPages,
    { id: 'admin-users', label: t('manageUsers'), icon: Users },
  ];

  const superAdminPages = [
    ...adminPages,
    { id: 'admin-admins', label: t('manageAdmins'), icon: ShieldCheck },
  ];

  const getPages = () => {
    if (!user) return publicPages;
    if (user.role === 'superadmin') return superAdminPages;
    if (user.role === 'admin') return adminPages;
    if (user.role === 'staff') return staffPages;
    return [...publicPages]; 
  };

  const pages = getPages();

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    if (window.innerWidth < 1024) { 
      onClose();
    }
  };

  return (
    <>
      {/* Overlay: Mobile Only (Hidden on Desktop) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          style={{ zIndex: 100 }} 
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 left-0 h-full text-white w-64 transform transition-transform duration-300 ease-in-out shadow-2xl 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0`} // 👈 This makes it always visible on desktop
        style={{ 
            zIndex: 101,
            backgroundColor: '#0f172a' 
        }} 
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="R.E.S.Q Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="font-bold text-lg">R.E.S.Q</span>
            </div>
            {/* Close button only shows on Mobile */}
            <button 
                onClick={onClose} 
                className="p-1 rounded transition-colors lg:hidden" 
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {pages.map((page) => {
              const Icon = page.icon;
              const isActive = currentPage === page.id;
              
              const activeStyle = {
                  backgroundColor: '#1e293b',
                  borderLeft: '4px solid #fbbf24'
              };
              const inactiveStyle = {
                  backgroundColor: 'transparent',
                  borderLeft: '4px solid transparent'
              };

              return (
                <button
                  key={page.id}
                  onClick={() => handleNavClick(page.id)}
                  style={isActive ? activeStyle : inactiveStyle}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/10"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{page.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}