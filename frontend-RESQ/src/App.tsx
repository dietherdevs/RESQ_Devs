import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { SpeedInsights } from '@vercel/speed-insights/react';

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

// --- BACKEND CONNECTION SETUP ---
axios.defaults.baseURL = 'https://resq-backend-qo04.onrender.com/api';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-close on mobile when navigating
  useEffect(() => {
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
    // PARENT: Flex layout ensures Sidebar and Content sit side-by-side
    <div className="h-screen bg-slate-50 flex w-full overflow-hidden relative">
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={location.pathname.substring(1) || 'home'}
        onNavigate={handleNavigation} 
      />

      {/* MAIN WRAPPER: Takes up remaining space next to Sidebar */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onLogoClick={() => navigate('/')} 
          onNavigate={handleNavigation}
          isSidebarOpen={isSidebarOpen} 
        />
        
        {/* SCROLLABLE AREA: pt-16 ensures content starts below Header */}
        <main className="flex-1 w-full overflow-y-auto p-4 md:p-8 pt-20">
          <Routes>
              <Route path="/" element={<HomePage onNavigate={handleNavigation} onShowAuth={() => {}} isLoggedIn={!!user} />} />
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
          <Footer />
        </main>
      </div>

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
            <SpeedInsights />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}