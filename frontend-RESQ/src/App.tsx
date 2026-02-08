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

// Note: axios baseURL is already set in AuthContext, so we don't strictly need to set it here again,
// but keeping it doesn't hurt.
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; mode: 'login' | 'register' } | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // --- 🚀 KEY FIX: AUTOMATIC REDIRECT WATCHER ---
  // This watches the 'user' state. As soon as a user logs in, 
  // it checks their role and redirects them if they are on the login/home page.
  useEffect(() => {
    // Only redirect if we are on the 'Home' page or 'Login' page
    if (user && (location.pathname === '/' || location.pathname === '/login')) {
      if (['admin', 'staff', 'superadmin'].includes(user.role)) {
        console.log("Admin detected, redirecting to Dashboard...");
        navigate('/admin-dashboard');
      } else if (user.role === 'resident') {
        navigate('/resident-home');
      }
    }
  }, [user, navigate, location.pathname]);


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
    // Smart Logo Click: If Admin, go to Dashboard. If Resident, go home.
    if (user && ['admin', 'staff', 'superadmin'].includes(user.role)) {
      navigate('/admin-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleAuthSuccess = () => {
    setAuthDialog(null);
    // The useEffect above will handle the redirect, but we can do a quick check here too
    if (user?.role === 'resident') {
        navigate('/resident-home');
    } else if (user && ['admin', 'staff', 'superadmin'].includes(user.role)) {
        navigate('/admin-dashboard');
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
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigation} 
      />

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