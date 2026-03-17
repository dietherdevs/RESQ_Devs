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

  const getPages = () => {
    const publicPages = [
      { id: 'home', label: t('home'), icon: Home },
      { id: 'flood', label: t('floodLevel'), icon: Droplets },
      { id: 'evacuation', label: t('evacuationCenters'), icon: MapPin },
      { id: 'hotlines', label: t('hotlines'), icon: Phone },
      { id: 'about', label: t('about'), icon: Info },
      { id: 'status', label: t('websiteStatus'), icon: Activity },
    ];
    if (!user) return publicPages;
    // Add logic for admin/staff pages here as per your previous setup
    return publicPages; 
  };

  const pages = getPages();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden" style={{ zIndex: 100 }} onClick={onClose} />
      )}

      <div
        className={`fixed top-0 left-0 h-full text-white w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`} 
        style={{ zIndex: 101, backgroundColor: '#0f172a' }} 
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-bold text-lg">R.E.S.Q</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded">
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
                  onClick={() => onNavigate(page.id)}
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