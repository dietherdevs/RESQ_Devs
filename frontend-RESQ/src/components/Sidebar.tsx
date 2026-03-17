import React from 'react';
import { X, Home, Droplets, MapPin, Phone, Info, Activity, LayoutDashboard, MessageSquare, Users, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/resqlogo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ isOpen, onClose, currentPage, onNavigate }: SidebarProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const getPages = () => {
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
    if (!user) return publicPages;
    if (user.role === 'superadmin') return [...staffPages, { id: 'admin-users', label: t('manageUsers'), icon: Users }, { id: 'admin-admins', label: t('manageAdmins'), icon: ShieldCheck }];
    if (user.role === 'admin') return [...staffPages, { id: 'admin-users', label: t('manageUsers'), icon: Users }];
    if (user.role === 'staff') return staffPages;
    return publicPages; 
  };

  const pages = getPages();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-[60]" onClick={onClose} />
      )}

      {/* Sidebar Container: uses 'relative' on desktop to occupy space */}
      <div
        className={`h-full text-white transition-all duration-300 ease-in-out shrink-0
          ${isOpen ? 'w-64' : 'w-0 lg:w-0 overflow-hidden'} 
          fixed lg:relative z-[70]`} 
        style={{ backgroundColor: '#0f172a' }} 
      >
        <div className="w-64 flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-bold text-lg text-white">R.E.S.Q</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {pages.map((page) => {
              const Icon = page.icon;
              const isActive = currentPage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => { onNavigate(page.id); if(window.innerWidth < 1024) onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                    isActive ? 'bg-slate-800 border-l-4 border-yellow-400 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
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