import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Lang = 'EN' | 'TL';
export type UserRole = 'user' | 'admin' | 'superadmin' | 'staff';

export interface AppUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  role: UserRole;
  verified: boolean;
  smsEnabled: boolean;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
}

interface AppContextType {
  lang: Lang;
  toggleLang: () => void;
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  refreshUser: () => Promise<void>; 
  login: (role: UserRole) => void;
  logout: () => void;
  showLogin: boolean;
  setShowLogin: (v: boolean) => void;
  showRegister: boolean;
  setShowRegister: (v: boolean) => void;
  showProfile: boolean;
  setShowProfile: (v: boolean) => void;
  showForgotPassword: boolean;                 // <--- NEW
  setShowForgotPassword: (v: boolean) => void; // <--- NEW
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const defaultContextValue: AppContextType = {
  lang: 'EN',
  toggleLang: () => {},
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
  login: () => {},
  logout: () => {},
  showLogin: false,
  setShowLogin: () => {},
  showRegister: false,
  setShowRegister: () => {},
  showProfile: false,
  setShowProfile: () => {},
  showForgotPassword: false,                 // <--- NEW
  setShowForgotPassword: () => {},           // <--- NEW
  darkMode: false,
  toggleDarkMode: () => {},
};

const AppContext = createContext<AppContextType>(defaultContextValue);

const DEMO_USERS: Record<UserRole, AppUser> = {
  user: {
    id: '1',
    name: 'Maria Santos',
    firstName: 'Maria',
    lastName: 'Santos',
    username: 'mariasantos',
    email: 'maria@example.com',
    role: 'user',
    verified: false,
    smsEnabled: false,
    phone: '09171234567',
    address: 'Sto. Niño, Marikina City',
    dob: '1995-06-15',
    gender: 'female',
  },
  admin: {
    id: '2',
    name: 'Admin Cruz',
    firstName: 'Admin',
    lastName: 'Cruz',
    username: 'admincruz',
    email: 'admin@resq.gov.ph',
    role: 'admin',
    verified: true,
    smsEnabled: true,
    phone: '09181234567',
    address: 'Marikina City Hall',
    dob: '1988-03-22',
    gender: 'male',
  },
  superadmin: {
    id: '3',
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    username: 'superadmin',
    email: 'superadmin@resq.gov.ph',
    role: 'superadmin',
    verified: true,
    smsEnabled: true,
    phone: '09191234567',
    address: 'MDRRMO Office, Marikina City',
    dob: '1980-01-10',
    gender: 'male',
  },
  staff: {
    id: '4',
    name: 'Staff Reyes',
    firstName: 'Staff',
    lastName: 'Reyes',
    username: 'staffreyes',
    email: 'staff@resq.gov.ph',
    role: 'staff',
    verified: true,
    smsEnabled: false,
    phone: '09201234567',
    address: 'Barangay Tumana, Marikina City',
    dob: '1992-09-05',
    gender: 'female',
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('EN');
  const [user, setUser] = useState<AppUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // <--- NEW
  const [darkMode, setDarkMode] = useState(false);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const freshData = await response.json();
        const updatedUser: AppUser = {
          ...freshData,
          role: freshData.role === 'super_admin' ? 'superadmin' : freshData.role,
          verified: freshData.status === 'approved',
          smsEnabled: freshData.status === 'approved' 
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, []);

  const toggleLang = () => setLang(l => (l === 'EN' ? 'TL' : 'EN'));
  const toggleDarkMode = () => setDarkMode(d => !d);

  const login = (role: UserRole) => {
    const selectedUser = DEMO_USERS[role];
    setUser(selectedUser);
    localStorage.setItem('user', JSON.stringify(selectedUser));
    setShowLogin(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setShowProfile(false);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        toggleLang,
        user,
        setUser,
        refreshUser, 
        login,
        logout,
        showLogin,
        setShowLogin,
        showRegister,
        setShowRegister,
        showProfile,
        setShowProfile,
        showForgotPassword,        // <--- NEW
        setShowForgotPassword,     // <--- NEW
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);