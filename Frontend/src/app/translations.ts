export const translations = {
  EN: {
    nav: {
      emergency: 'Emergency Hotline',
      login: 'Login / Register',
      profile: 'Profile Settings',
      logout: 'Logout',
      adminDash: 'Admin Dashboard',
    },
    hero: {
      welcome: 'Stay Informed. Stay Safe.',
      subtitle:
        'Real-time flood monitoring and emergency alerts for Marikina City.',
      currentLevel: 'Current Flood Level',
      alertNormal: 'NORMAL',
      alert1: 'ALERT LEVEL 1',
      alert2: 'ALERT LEVEL 2',
      alert3: 'ALERT LEVEL 3',
      critical: 'CRITICAL',
      meters: 'meters',
    },
    flood: {
      title: 'Marikina River Flood Monitoring',
      level: 'Current Water Level',
      location: 'Marikina River, Sto. Niño',
      updated: 'Last Updated',
      source: 'Data Source',
      sourceVal: 'PAGASA / MMDA Sensor',
      history: '24-Hour Water Level History',
    },
    evacuation: {
      title: 'Evacuation Centers',
      subtitle: 'Find a safe shelter near you',
      status: { open: 'Open', full: 'Full', closed: 'Closed' },
      capacity: 'Capacity',
      contact: 'Contact',
      occupancy: 'Occupancy',
    },
    hotlines: {
      title: 'Emergency Hotlines',
      subtitle: 'Quick-dial national and local emergency numbers',
      national: 'National Hotlines',
      local: 'Marikina Local Hotlines',
    },
    about: {
      title: 'About RESQ',
      desc: 'RESQ (Real-Time Emergency System & Quick Alerts) is a life-safety platform designed to give Marikina City residents instant access to flood monitoring data, evacuation information, and emergency contacts — when every second counts.',
      credit: 'Developed by Students of PUP Itech',
      tagline: 'Protecting lives through technology.',
    },
  },
  TL: {
    nav: {
      emergency: 'Emergency Hotline',
      login: 'Mag-login / Mag-register',
      profile: 'Mga Setting ng Profile',
      logout: 'Mag-logout',
      adminDash: 'Admin Dashboard',
    },
    hero: {
      welcome: 'Manatiling Handa. Manatiling Ligtas.',
      subtitle:
        'Real-time na pagsubaybay sa baha at mga alerto para sa Lungsod ng Marikina.',
      currentLevel: 'Kasalukuyang Antas ng Baha',
      alertNormal: 'NORMAL',
      alert1: 'ALERT LEVEL 1',
      alert2: 'ALERT LEVEL 2',
      alert3: 'ALERT LEVEL 3',
      critical: 'KRITIKAL',
      meters: 'metro',
    },
    flood: {
      title: 'Pagsubaybay sa Baha ng Ilog Marikina',
      level: 'Kasalukuyang Antas ng Tubig',
      location: 'Ilog Marikina, Sto. Niño',
      updated: 'Huling Na-update',
      source: 'Pinagkukunan ng Data',
      sourceVal: 'PAGASA / MMDA Sensor',
      history: '24-Oras na Kasaysayan ng Antas ng Tubig',
    },
    evacuation: {
      title: 'Mga Evacuation Center',
      subtitle: 'Humanap ng ligtas na kanlungan malapit sa inyo',
      status: { open: 'Bukas', full: 'Puno', closed: 'Sarado' },
      capacity: 'Kapasidad',
      contact: 'Makipag-ugnayan',
      occupancy: 'Pagkalapat',
    },
    hotlines: {
      title: 'Mga Emergency Hotline',
      subtitle: 'Mabilis na pag-dial sa pambansa at lokal na emergency numbers',
      national: 'Pambansang Hotlines',
      local: 'Lokal na Hotlines ng Marikina',
    },
    about: {
      title: 'Tungkol sa RESQ',
      desc: 'Ang RESQ (Real-Time Emergency System & Quick Alerts) ay isang platform para sa kaligtasan ng buhay na nagbibigay sa mga residente ng Lungsod ng Marikina ng agarang access sa datos ng pagsubaybay sa baha, impormasyon ng evacuation, at mga emergency na contact — sa bawat segundong mahalaga.',
      credit: 'Ginawa ng mga Estudyante ng PUP Itech',
      tagline: 'Nagpoprotekta ng buhay sa pamamagitan ng teknolohiya.',
    },
  },
};

export type TranslationKey = typeof translations;
