import React, { useState } from 'react';
import { Menu, LogOut, Settings, ChevronDown, Phone } from 'lucide-react';
import { Switch } from './ui/switch';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import logo from 'figma:asset/4b574b690eba4a74e73324033005afce9cdefd16.png';

interface HeaderProps {
  onMenuClick: () => void;
  onLogoClick: () => void; 
  onNavigate: (page: string) => void;
}

export function Header({ onMenuClick, onNavigate }: HeaderProps) {
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

  // Logic: Admins -> Dashboard, Everyone else -> Home
  const handleLogoAction = () => {
    if (user?.role === 'admin' || user?.role === 'staff' || user?.role === 'superadmin') {
      onNavigate('admin-dashboard');
    } else {
      onNavigate('home');
    }
  };

  const avatarUrl = user?.profile_image 
    ? `http://localhost:8000${user.profile_image}` 
    : `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=ffffff&color=0ea5e9&size=64&bold=true`;

  return (
    <>
      <header className="bg-sky-500 text-white shadow-md fixed top-0 left-0 w-full z-50">
        
        {/* Main Container */}
        <div className="flex items-center justify-between px-4 py-2 w-full max-w-7xl mx-auto">
          
          {/* Left Section: Menu & Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onMenuClick} 
              className="p-2 hover:bg-sky-600 rounded-lg transition-colors"
              type="button"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            
            <button 
              onClick={handleLogoAction} 
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              type="button"
            >
              <img src={logo} alt="R.E.S.Q Logo" className="h-9 w-auto object-contain" />
              <div className="hidden sm:block text-left">
                <div className="font-bold text-lg leading-none">R.E.S.Q</div>
                <div className="text-[10px] text-sky-100">Emergency System</div>
              </div>
            </button>
          </div>

          {/* Right Section: Hotlines -> Language -> Auth */}
          <div className="flex items-center gap-4">
            
            {/* --- EMERGENCY HOTLINES BUTTON --- */}
            <button
              onClick={() => onNavigate('hotlines')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">HOTLINES</span>
            </button>

            {/* Language Switch */}
            <div className="flex items-center gap-2 border-r border-sky-400 pr-4">
              <span className="text-xs font-bold">EN</span>
              <Switch
                checked={language === 'tl'}
                onCheckedChange={(checked) => setLanguage(checked ? 'tl' : 'en')}
                className="scale-75 data-[state=checked]:bg-yellow-400"
              />
              <span className="text-xs font-bold">TL</span>
            </div>

            {/* Auth Logic */}
            {user ? (
              // --- LOGGED IN USER ---
              <div className="relative inline-block text-left">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-sky-600 rounded-full transition-all focus:outline-none"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 bg-white shadow-sm">
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

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10 cursor-default" 
                      onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                    
                    <div 
                      className="absolute mt-2 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                      style={{ 
                        right: 0, 
                        width: 'max-content', 
                        padding: '20px' 
                      }}
                    >
                      <div className="mb-4 border-b border-gray-100 pb-4">
                        {/* UPDATED: Added 'capitalize' class here.
                            This will make 'juan dela cruz' -> 'Juan Dela Cruz' 
                        */}
                        <p className="text-base font-bold text-gray-900 leading-tight whitespace-nowrap capitalize">
                          {user.firstName} {user.lastName}
                        </p>
                        
                        {/* UPDATED: Removed 'uppercase', added 'capitalize'.
                            This will make 'admin' -> 'Admin' 
                        */}
                        <p className="text-xs text-sky-600 font-bold capitalize tracking-wider mt-1">
                          {user.role}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => handleNavClick('profile')}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                          type="button"
                        >
                          <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                          <span className="text-gray-700">Profile Settings</span>
                        </button>

                        <div className="my-1 border-t border-gray-100"></div>

                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          type="button"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // --- GUEST VIEW (LOG IN / REGISTER) ---
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate('login')} 
                  className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-sm font-bold shadow-sm rounded transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={() => onNavigate('register')} 
                  className="px-4 py-1.5 text-sm font-bold bg-white text-sky-600 rounded shadow-sm hover:bg-sky-50 transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}