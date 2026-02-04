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

  // --- PUBLIC LINKS ---
  const publicPages = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'flood', label: t('floodLevel'), icon: Droplets },
    { id: 'evacuation', label: t('evacuationCenters'), icon: MapPin },
    { id: 'hotlines', label: t('hotlines'), icon: Phone },
    { id: 'about', label: t('about'), icon: Info },
    { id: 'status', label: t('websiteStatus'), icon: Activity },
  ];

  // --- RESIDENT LINKS (Profile moved to Header Dropdown) ---
  const userPages = [
    { id: 'resident-home', label: 'My Dashboard', icon: LayoutDashboard },
  ];

  // --- STAFF/ADMIN LINKS ---
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
    
    // Regular residents get Public + Dashboard
    return [...publicPages, ...userPages];
  };

  const pages = getPages();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-sky-400 to-sky-500 text-white w-64 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-300">
            <div className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="R.E.S.Q Logo" 
                className="w-10 h-10 object-contain"
                style={{ mixBlendMode: 'lighten' }}
              />
              <span className="font-bold text-lg">R.E.S.Q</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-sky-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation - Profile and Logout have been removed from here */}
          <nav className="flex-1 overflow-y-auto py-4">
            {pages.map((page) => {
              const Icon = page.icon;
              const isActive = currentPage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => {
                    onNavigate(page.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-sky-600 border-l-4 border-yellow-400'
                      : 'hover:bg-sky-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{page.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}