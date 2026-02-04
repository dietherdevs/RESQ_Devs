import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// --- AXIOS CONFIGURATION ---
// Setting /api here ensures all calls like axios.post('/login') 
// correctly point to http://127.0.0.1:8000/api/login
axios.defaults.baseURL = '/api'; 
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true; 

export type UserRole = 'resident' | 'staff' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  role: UserRole;
  email?: string;
  smsAlerts: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: any) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  setToken: (token: string) => void; 
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to normalize backend snake_case to frontend camelCase
  const mapBackendToFrontend = (backendUser: any): User => {
    return {
      ...backendUser,
      phoneNumber: backendUser.phone_number || backendUser.phoneNumber,
      dateOfBirth: backendUser.birthdate || backendUser.dateOfBirth,
      role: backendUser.role || 'resident', 
      smsAlerts: backendUser.smsAlerts ?? true
    };
  };

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        // Corrected path (baseURL handles the /api prefix)
        const response = await axios.get('/user');
        const userData = mapBackendToFrontend(response.data);
        setUser(userData);
      } catch (error) {
        console.error('Session expired or invalid token');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/login', { username, password });
      const { token, user: backendUser } = response.data;

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(mapBackendToFrontend(backendUser));
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/logout'); 
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/'; 
  };

  const register = async (data: any): Promise<boolean> => {
    try {
        const payload = {
            username: data.username,
            password: data.password,
            password_confirmation: data.password, 
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone_number: data.phoneNumber,
            birthdate: data.dateOfBirth,
            address: data.address,
            gender: data.gender
        };

        const response = await axios.post('/register', payload);
        const { token, user: backendUser } = response.data;

        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(mapBackendToFrontend(backendUser));

        return true;
    } catch (error) {
        console.error('Registration failed', error);
        return false;
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    return login(username, password);
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    setUser({ ...user, ...data });
    return true;
  };

  const setToken = (token: string) => {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        login, 
        logout, 
        register, 
        updateProfile, 
        adminLogin,
        setToken,
        setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}