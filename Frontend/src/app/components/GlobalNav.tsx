import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Phone, ChevronDown, User, LogOut, Settings, LayoutDashboard, Menu, X, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import resqLogo from '../../imports/resq111.png';

export function GlobalNav() {
  const { lang, toggleLang, user, logout, setShowLogin, setShowProfile, darkMode, toggleDarkMode } = useApp();
  const t = translations[lang].nav;
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'staff';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function scrollToHotlines() {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('hotlines');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return;
    }
    const el = document.getElementById('hotlines');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-white/10"
      style={{ backgroundColor: '#0D1B2A', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
          >
            <img
              src={resqLogo}
              alt="RESQ Logo"
              className="h-10 w-auto object-contain"
            />
          </button>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Lang Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all"
            >
              <span className={lang === 'EN' ? 'text-white' : 'text-white/40'}>EN</span>
              <span className="text-white/30">|</span>
              <span className={lang === 'TL' ? 'text-white' : 'text-white/40'}>TL</span>
            </button>

            {/* Emergency Hotline CTA */}
            <button
              onClick={scrollToHotlines}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FF6B2B, #e85a1a)' }}
            >
              <Phone size={14} className="animate-pulse" />
              {t.emergency}
            </button>

            {/* Auth State */}
            {!user ? (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                {t.login}
              </button>
            ) : (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-all border border-white/20"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: '#FF6B2B' }}
                  >
                    {user.name[0]}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border border-white/10 overflow-hidden"
                    style={{ backgroundColor: '#132236' }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-white/50 text-xs truncate">{user.email}</p>
                      <span
                        className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase"
                        style={{
                          backgroundColor: user.role === 'superadmin' ? '#FF6B2B' : user.role === 'admin' ? '#FFB800' : user.role === 'staff' ? '#3B82F6' : '#22C55E',
                          color: user.role === 'superadmin' ? 'white' : user.role === 'staff' ? 'white' : '#0D1B2A',
                        }}
                      >
                        {user.role}
                      </span>
                    </div>
                    {user.role === 'user' && (
                      <button
                        onClick={() => { setShowProfile(true); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all"
                      >
                        <Settings size={14} />
                        {t.profile}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate(user.role === 'staff' ? '/admin/manage-users' : '/admin/dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-white/10 transition-all"
                        style={{ color: '#FF6B2B' }}
                      >
                        <LayoutDashboard size={14} />
                        {t.adminDash}
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all border-t border-white/10"
                    >
                      <LogOut size={14} />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 flex flex-col gap-3" style={{ backgroundColor: '#0D1B2A' }}>
          {/* Dark Mode Toggle (mobile) */}
          <button
            onClick={() => { toggleDarkMode(); }}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold border border-white/20 text-white/80"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button
            onClick={toggleLang}
            className="flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg text-sm font-semibold border border-white/20 text-white/80"
          >
            <span className={lang === 'EN' ? 'text-white font-bold' : 'text-white/40'}>EN</span>
            <span className="text-white/30 mx-1">|</span>
            <span className={lang === 'TL' ? 'text-white font-bold' : 'text-white/40'}>TL</span>
          </button>

          {/* Emergency Hotline — scrolls to section */}
          <button
            onClick={scrollToHotlines}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-white font-semibold text-sm"
            style={{ background: '#FF6B2B' }}
          >
            <Phone size={14} className="animate-pulse" />
            {t.emergency}
          </button>

          {!user ? (
            <button
              onClick={() => { setShowLogin(true); setMobileOpen(false); }}
              className="w-full px-4 py-3 rounded-lg text-sm font-semibold border border-white/20 text-white"
            >
              {t.login}
            </button>
          ) : (
            <>
              {user.role === 'user' && (
                <button
                  onClick={() => { setShowProfile(true); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm text-white/80 border border-white/10"
                >
                  <User size={14} /> {t.profile}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    navigate(user.role === 'staff' ? '/admin/manage-users' : '/admin/dashboard');
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm border border-white/10"
                  style={{ color: '#FF6B2B' }}
                >
                  <LayoutDashboard size={14} /> {t.adminDash}
                </button>
              )}
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm text-red-400 border border-red-500/20"
              >
                <LogOut size={14} /> {t.logout}
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
