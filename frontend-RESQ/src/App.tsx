import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

// --- CONTEXT IMPORTS ---
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// --- COMPONENT IMPORTS ---
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AuthDialog } from './components/AuthDialog';
import { AdminLoginDialog } from './components/AdminLoginDialog';
import { Toaster } from './components/ui/sonner';

// --- PAGE IMPORTS ---
import { HomePage } from './pages/HomePage';
import { FloodLevelPage } from './pages/FloodLevelPage'; 
import { EvacuationPage } from './pages/EvacuationPage';
import { HotlinesPage } from './pages/HotlinesPage';
import { AboutPage } from './pages/AboutPage';
import { StatusPage } from './pages/StatusPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResidentHomePage } from './pages/resident/ResidentHomePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// --- ADMIN PAGE IMPORTS ---
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SendSMSPage } from './pages/admin/SendSMSPage';
import { EvacuationStatusPage } from './pages/admin/EvacuationStatusPage';
import { EvacueesListPage } from './pages/admin/EvacueesListPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { ManageAdminsPage } from './pages/admin/ManageAdminsPage';
import { FloodLevelPage as AdminFloodPage } from './pages/admin/FloodLevelPage';

// --- 1. BACKEND CONNECTION SETUP ---
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; mode: 'login' | 'register' } | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const getCurrentPageID = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/admin')) return path.substring(1); 
    return path.substring(1); 
  };

  const currentPage = getCurrentPageID();

  const handleNavigation = (pageId: string) => {
    if (pageId === 'home') navigate('/');
    else navigate(`/${pageId}`);
    
    // Note: We do NOT close sidebar here anymore for desktop logic. 
    // The Sidebar component handles the conditional closing.
  };

  useEffect(() => {
    if (location.pathname === '/login') {
      setAuthDialog({ isOpen: true, mode: 'login' });
      navigate('/', { replace: true });
    }
    if (location.pathname === '/register') {
      setAuthDialog({ isOpen: true, mode: 'register' });
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleLogoClick = () => {
    if (user) {
      setShowAdminLogin(true);
    } else {
      navigate('/');
    }
  };

  const handleAuthSuccess = () => {
    setAuthDialog(null);
    if (user?.role === 'resident') {
        navigate('/resident-home');
    } else {
        navigate('/');
    }
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    navigate('/admin-dashboard');
  };

  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
    if (!user) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden relative w-full">
      
      {/* SIDEBAR: Sits outside the transition wrapper. 
         It is fixed to the left. 
      */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigation} 
      />

      {/* MAIN LAYOUT WRAPPER: 
         This div wraps both the Header and the Main Content.
         It applies a left margin (ml-64) when the sidebar is open on desktop (lg:ml-64).
         This creates the "Push" effect.
      */}
      <div 
        className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-64 lg:w-[calc(100%-16rem)]' : ''
        }`}
      >
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onLogoClick={handleLogoClick} 
          onNavigate={handleNavigation} 
        />
        
        {/* MAIN CONTENT:
            We keep the top padding (pt-32/pt-48) to clear the Fixed Header.
        */}
        <main className="flex-1 w-full pt-32 md:pt-48">
          <Routes>
              {/* --- PUBLIC PAGES --- */}
              <Route path="/" element={
                  <HomePage 
                      onNavigate={handleNavigation} 
                      onShowAuth={(mode) => setAuthDialog({ isOpen: true, mode })} 
                      isLoggedIn={!!user} 
                  />
              } />
              
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route path="/flood" element={<FloodLevelPage />} />
              <Route path="/evacuation" element={<EvacuationPage />} />
              <Route path="/hotlines" element={<HotlinesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/status" element={<StatusPage />} />

              {/* --- PROTECTED RESIDENT PAGES --- */}
              <Route path="/profile" element={
                  <ProtectedRoute>
                      <ProfilePage />
                  </ProtectedRoute>
              } />
              <Route path="/resident-home" element={
                  <ProtectedRoute> 
                     <ResidentHomePage />
                  </ProtectedRoute>
              } />
              
              {/* --- ADMIN PAGES --- */}
              <Route path="/admin-dashboard" element={
                  <ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}>
                      <AdminDashboard />
                  </ProtectedRoute>
              } />
              <Route path="/admin-sms" element={
                  <ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}>
                      <SendSMSPage />
                  </ProtectedRoute>
              } />
              <Route path="/send-sms" element={
                  <ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}>
                      <SendSMSPage />
                  </ProtectedRoute>
              } />
              <Route path="/admin-evacuation" element={
                  <ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}>
                      <EvacuationStatusPage />
                  </ProtectedRoute>
              } />
              <Route path="/flood-level" element={
                  <ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}>
                      <AdminFloodPage />
                  </ProtectedRoute>
              } />
              <Route path="/admin-evacuees" element={
                  <ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}>
                      <EvacueesListPage />
                  </ProtectedRoute>
              } />
              <Route path="/admin-users" element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                      <ManageUsersPage />
                  </ProtectedRoute>
              } />
              <Route path="/admin-admins" element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                      <ManageAdminsPage />
                  </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* --- MODALS --- */}
      {authDialog?.isOpen && (
        <AuthDialog
          mode={authDialog.mode}
          onClose={() => setAuthDialog(null)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {showAdminLogin && (
        <AdminLoginDialog
          onClose={() => setShowAdminLogin(false)}
          onSuccess={handleAdminLoginSuccess}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
            <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}