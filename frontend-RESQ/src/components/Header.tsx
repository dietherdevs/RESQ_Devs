import React, { useState } from 'react';
import axios from 'axios';
import { Menu, LogOut, Settings, ChevronDown, Phone } from 'lucide-react';
import { Switch } from './ui/switch';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import logo from 'figma:asset/4b574b690eba4a74e73324033005afce9cdefd16.png'; 

interface HeaderProps {
  onMenuClick: () => void;
  onLogoClick: () => void; 
  onNavigate: (page: string) => void;
  isSidebarOpen?: boolean; // Added to help with dynamic width
}

export function Header({ onMenuClick, onNavigate, isSidebarOpen }: HeaderProps) {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const handleNavClick = (page: string) => {
    setIsUserMenuOpen(false);
    onNavigate(page);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  const handleLogoAction = () => {
    if (user?.role === 'admin' || user?.role === 'staff' || user?.role === 'superadmin') {
      onNavigate('admin-dashboard');
    } else {
      onNavigate('home');
    }
  };

  const getAvatarUrl = () => {
    if (user?.profile_image) {
      let cleanPath = user.profile_image.replace('public/', '');
      if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
      if (!cleanPath.startsWith('/storage')) cleanPath = `/storage${cleanPath}`;
      
      const baseUrl = axios.defaults.baseURL ? axios.defaults.baseURL.replace('/api', '') : '';
      return `${baseUrl}${cleanPath}`;
    }
    return `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=ffffff&color=0ea5e9&size=64&bold=true`;
  };

  const avatarUrl = getAvatarUrl();

  return (
    // FIX: Added dynamic margin and width to match the App.tsx push logic
    <header 
      className={`bg-sky-500 text-white shadow-md fixed top-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'lg:left-64' : 'left-0'
      }`}
    >
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 w-full max-w-7xl mx-auto">
        
        {/* --- LEFT SECTION --- */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button 
            onClick={onMenuClick} 
            className="p-1.5 sm:p-2 hover:bg-sky-600 rounded-lg transition-colors lg:hidden" 
            type="button"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
          
          <button 
            onClick={handleLogoAction} 
            className="flex items-center gap-1 sm:gap-2 hover:opacity-90 transition-opacity"
            type="button"
          >
            <img src={logo} alt="R.E.S.Q Logo" className="h-7 sm:h-9 w-auto object-contain" />
            <div className="hidden sm:block text-left">
              <div className="font-bold text-lg leading-none">R.E.S.Q</div>
              <div className="text-[10px] text-sky-100">Emergency System</div>
            </div>
          </button>
        </div>

        {/* --- RIGHT SECTION --- */}
        <div className="flex items-center gap-1.5 sm:gap-4">
          <button
            onClick={() => onNavigate('hotlines')}
            className="flex items-center gap-1 sm:gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2 sm:px-3 py-1.5 rounded-full shadow-sm transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HOTLINES</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2 border-r border-sky-400 pr-2 sm:pr-4">
            <span className="text-[10px] sm:text-xs font-bold">EN</span>
            <Switch
              checked={language === 'tl'}
              onCheckedChange={(checked) => setLanguage(checked ? 'tl' : 'en')}
              className="scale-50 sm:scale-75 data-[state=checked]:bg-yellow-400 origin-center -mx-1 sm:mx-0"
            />
            <span className="text-[10px] sm:text-xs font-bold">TL</span>
          </div>

          {user ? (
            <div className="relative inline-block text-left">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 sm:gap-2 p-1 hover:bg-sky-600 rounded-full transition-all focus:outline-none"
                type="button"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white/50 bg-white shadow-sm">
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=ffffff&color=0ea5e9&size=64&bold=true`;
                    }}
                  />
                </div>
                <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10 cursor-default" 
                    onClick={() => setIsUserMenuOpen(false)}
                  ></div>
                  
                  <div 
                    className="absolute mt-2 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                    style={{ 
                      right: 0, 
                      width: 'max-content', 
                      minWidth: '220px',
                      padding: '8px', 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #334155' 
                    }}
                  >
                    <div className="px-3 py-3 mb-2 border-b border-slate-700">
                      <p className="text-base font-bold text-white leading-tight whitespace-nowrap capitalize">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-sky-400 font-bold capitalize tracking-wider mt-1">
                        {user.role}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => handleNavClick('profile')}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-300 rounded-md transition-all duration-200 group hover:bg-slate-800 hover:text-white"
                        type="button"
                      >
                        <Settings className="w-5 h-5 text-slate-400 transition-colors group-hover:text-sky-400" />
                        <span>Profile Settings</span>
                      </button>

                      <div className="my-1 h-px bg-slate-700 w-full" />

                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-400 rounded-md transition-all duration-200 hover:bg-red-500/10 hover:text-red-300 group"
                        type="button"
                      >
                        <LogOut className="w-5 h-5 transition-colors group-hover:text-red-300" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button 
                onClick={() => onNavigate('login')} 
                className="whitespace-nowrap px-2.5 sm:px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-[11px] sm:text-sm font-bold shadow-sm rounded transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={() => onNavigate('register')} 
                className="whitespace-nowrap px-2.5 sm:px-4 py-1.5 text-[11px] sm:text-sm font-bold bg-white text-sky-600 rounded shadow-sm hover:bg-sky-50 transition-colors"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}