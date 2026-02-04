import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'tl';

interface Translations {
  [key: string]: {
    en: string;
    tl: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', tl: 'Tahanan' },
  floodLevel: { en: 'Flood Level', tl: 'Antas ng Baha' },
  evacuationCenters: { en: 'Evacuation Centers', tl: 'Sentro ng Ebakwasyon' },
  hotlines: { en: 'Emergency Hotlines', tl: 'Emergency Hotlines' },
  about: { en: 'About', tl: 'Tungkol Sa Amin' },
  websiteStatus: { en: 'Website Status', tl: 'Kalagayan ng Website' },
  profile: { en: 'Profile Settings', tl: 'Mga Setting ng Profile' },
  login: { en: 'Login', tl: 'Mag-login' },
  register: { en: 'Register', tl: 'Magrehistro' },
  logout: { en: 'Logout', tl: 'Mag-logout' },

  // Dashboard
  dashboard: { en: 'Dashboard', tl: 'Dashboard' },
  sendSMS: { en: 'Send SMS Alert', tl: 'Magpadala ng SMS Alert' },
  evacuationStatus: { en: 'Evacuation Status', tl: 'Kalagayan ng Ebakwasyon' },
  evacueesList: { en: 'Evacuees List', tl: 'Listahan ng mga Evacuees' },
  manageUsers: { en: 'Manage Users', tl: 'Pamahalaan ang mga User' },
  manageAdmins: { en: 'Manage Admins', tl: 'Pamahalaan ang mga Admin' },

  // Home Page
  welcome: { en: 'Welcome to R.E.S.Q', tl: 'Maligayang Pagdating sa R.E.S.Q' },
  subtitle: { en: 'Real-Time Emergency System & Quick Alerts', tl: 'Real-Time Emergency System at Mabilis na Alerts' },
  description: { en: 'Stay informed about flood alerts and emergency information for Barangay Nangka, Marikina City.', tl: 'Manatiling informed tungkol sa flood alerts at emergency information para sa Barangay Nangka, Marikina City.' },
  currentFloodLevel: { en: 'Current Flood Level', tl: 'Kasalukuyang Antas ng Baha' },
  status: { en: 'Status', tl: 'Kalagayan' },
  normal: { en: 'Normal', tl: 'Normal' },
  alert1: { en: '1st Alarm', tl: '1st Alarm' },
  alert2: { en: '2nd Alarm', tl: '2nd Alarm' },
  alert3: { en: '3rd Alarm', tl: '3rd Alarm' },
  alert4: { en: '4th Alarm', tl: '4th Alarm' },
  viewDetails: { en: 'View Details', tl: 'Tingnan ang Detalye' },

  // Login/Register
  username: { en: 'Username', tl: 'Username' },
  password: { en: 'Password', tl: 'Password' },
  phoneNumber: { en: 'Phone Number', tl: 'Numero ng Telepono' },
  firstName: { en: 'First Name', tl: 'Pangalan' },
  lastName: { en: 'Last Name', tl: 'Apelyido' },
  dateOfBirth: { en: 'Date of Birth', tl: 'Petsa ng Kapanganakan' },
  address: { en: 'Address', tl: 'Tirahan' },
  gender: { en: 'Gender', tl: 'Kasarian' },
  male: { en: 'Male', tl: 'Lalaki' },
  female: { en: 'Female', tl: 'Babae' },
  other: { en: 'Other', tl: 'Iba pa' },
  alreadyHaveAccount: { en: 'Already have an account?', tl: 'Mayroon na bang account?' },
  dontHaveAccount: { en: "Don't have an account?", tl: 'Wala pang account?' },

  // Profile Settings
  profileSettings: { en: 'Profile Settings', tl: 'Mga Setting ng Profile' },
  personalInformation: { en: 'Personal Information', tl: 'Personal na Impormasyon' },
  notificationSettings: { en: 'Notification Settings', tl: 'Mga Setting ng Notipikasyon' },
  receiveSMSAlerts: { en: 'Receive SMS Alerts', tl: 'Tumanggap ng SMS Alerts' },
  smsAlertsDescription: { en: 'Get emergency alerts via SMS', tl: 'Makatanggap ng emergency alerts sa SMS' },
  saveChanges: { en: 'Save Changes', tl: 'I-save ang mga Pagbabago' },
  changesSaved: { en: 'Changes saved successfully!', tl: 'Matagumpay na na-save ang mga pagbabago!' },

  // Flood Level
  floodMonitoring: { en: 'Flood Monitoring System', tl: 'Sistema ng Pagsubaybay sa Baha' },
  currentLevel: { en: 'Current Level', tl: 'Kasalukuyang Antas' },
  alarmLevel: { en: 'Alarm Level', tl: 'Antas ng Alarm' },
  waterLevel: { en: 'Water Level', tl: 'Antas ng Tubig' },
  lastUpdated: { en: 'Last Updated', tl: 'Huling Update' },
  floodHistory: { en: 'Flood Level History (24 Hours)', tl: 'Kasaysayan ng Antas ng Baha (24 Oras)' },

  // Evacuation Centers
  evacuationCentersList: { en: 'Evacuation Centers in Nangka', tl: 'Mga Sentro ng Ebakwasyon sa Nangka' },
  capacity: { en: 'Capacity', tl: 'Kapasidad' },
  available: { en: 'Available', tl: 'Available' },
  full: { en: 'Full', tl: 'Puno' },
  facilities: { en: 'Facilities', tl: 'Mga Pasilidad' },
  contact: { en: 'Contact', tl: 'Kontak' },

  // Common
  save: { en: 'Save', tl: 'I-save' },
  cancel: { en: 'Cancel', tl: 'Kanselahin' },
  submit: { en: 'Submit', tl: 'Isumite' },
  close: { en: 'Close', tl: 'Isara' },
  loading: { en: 'Loading...', tl: 'Naglo-load...' },
  error: { en: 'Error', tl: 'Error' },
  success: { en: 'Success', tl: 'Tagumpay' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
