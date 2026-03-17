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
import { Footer } from './components/Footer';

// --- PAGE IMPORTS ---
import { HomePage } from './pages/HomePage';
import { FloodLevelPage } from './pages/FloodLevelPage'; 
import { EvacuationPage } from './pages/EvacuationPage';
import { HotlinesPage } from './pages/HotlinesPage';
import { AboutPage } from './pages/AboutPage';
import { StatusPage } from './pages/StatusPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// --- ADMIN PAGE IMPORTS ---
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SendSMSPage } from './pages/admin/SendSMSPage';
import { EvacuationStatusPage } from './pages/admin/EvacuationStatusPage';
import { EvacueesListPage } from './pages/admin/EvacueesListPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { ManageAdminsPage } from './pages/admin/ManageAdminsPage';
import { FloodLevelPage as AdminFloodPage } from './pages/admin/FloodLevelPage';

axios.defaults.baseURL = 'https://resq-backend-qo04.onrender.com/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to true for desktop feel
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; mode: 'login' | 'register' } | null>(null);

  useEffect(() => {
    // Auto-close only on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleNavigation = (pageId: string) => {
    if (pageId === 'home') navigate('/');
    else navigate(`/${pageId}`);
  };

  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
    if (!user) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return <>{children}</>;
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden w-full relative">
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={location.pathname.substring(1) || 'home'}
        onNavigate={handleNavigation} 
      />

      {/* FIXED CONTENT WRAPPER:
          We use lg:ml-64 when open to PUSH the header and content.
          We use lg:w-[calc(100%-16rem)] to prevent the content from overflowing.
      */}
      <div 
        className={`flex-1 flex flex-col h-full overflow-y-auto transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-64 lg:w-[calc(100%-16rem)]' : 'ml-0 w-full'
        }`}
      >
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onLogoClick={() => navigate('/')} 
          onNavigate={handleNavigation} 
        />
        
        <main className="flex-1 w-full pt-16"> {/* Header is fixed, so we pad the top */}
          <Routes>
              <Route path="/" element={<HomePage onNavigate={handleNavigation} onShowAuth={(mode) => setAuthDialog({ isOpen: true, mode })} isLoggedIn={!!user} />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/flood" element={<FloodLevelPage />} />
              <Route path="/evacuation" element={<EvacuationPage />} />
              <Route path="/hotlines" element={<HotlinesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin-sms" element={<ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}><SendSMSPage /></ProtectedRoute>} />
              <Route path="/admin-evacuation" element={<ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}><EvacuationStatusPage /></ProtectedRoute>} />
              <Route path="/flood-level" element={<ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}><AdminFloodPage /></ProtectedRoute>} />
              <Route path="/admin-evacuees" element={<ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']}><EvacueesListPage /></ProtectedRoute>} />
              <Route path="/admin-users" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><ManageUsersPage /></ProtectedRoute>} />
              <Route path="/admin-admins" element={<ProtectedRoute allowedRoles={['superadmin']}><ManageAdminsPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>

      {authDialog?.isOpen && (
        <AuthDialog mode={authDialog.mode} onClose={() => setAuthDialog(null)} onSuccess={() => setAuthDialog(null)} />
      )}
      <Toaster position="top-right" richColors />
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