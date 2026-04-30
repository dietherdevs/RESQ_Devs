// ─── Flood Level Data ────────────────────────────────────────────────────────
export const floodHistory = [
  { time: '00:00', level: 13.8 },
  { time: '02:00', level: 14.2 },
  { time: '04:00', level: 14.9 },
  { time: '06:00', level: 15.8 },
  { time: '08:00', level: 16.7 },
  { time: '10:00', level: 17.5 },
  { time: '12:00', level: 18.9 },
  { time: '14:00', level: 19.3 },
  { time: '16:00', level: 18.6 },
  { time: '18:00', level: 17.9 },
  { time: '20:00', level: 17.4 },
  { time: '22:00', level: 17.8 },
];

export const CURRENT_LEVEL = 17.8;
export const ALERT_THRESHOLDS = { normal: 15, alert1: 17, alert2: 20, alert3: 22 };

export function getAlertInfo(level: number) {
  if (level < 15) return { label: 'NORMAL', color: '#22C55E', bg: '#DCFCE7', text: '#166534' };
  if (level < 17) return { label: 'ALERT LEVEL 1', color: '#FFB800', bg: '#FEF9C3', text: '#713F12' };
  if (level < 20) return { label: 'ALERT LEVEL 2', color: '#FF6B2B', bg: '#FFEDD5', text: '#9A3412' };
  if (level < 22) return { label: 'ALERT LEVEL 3', color: '#EF4444', bg: '#FEE2E2', text: '#991B1B' };
  return { label: 'CRITICAL', color: '#7F1D1D', bg: '#450A0A', text: '#FCA5A5' };
}

// ─── Evacuation Centers ───────────────────────────────────────────────────────
export interface EvacCenter {
  id: number;
  name: string;
  location: string;
  contact: string[];
  capacity: number;
  current: number;
  status: 'open' | 'full' | 'closed';
}

export const evacuationCenters: EvacCenter[] = [
  {
    id: 1,
    name: 'Marikina Sports Center',
    location: 'J.P. Rizal St., Sto. Niño, Marikina',
    contact: ['(02) 8646-3651', '09171234001'],
    capacity: 500,
    current: 247,
    status: 'open',
  },
  {
    id: 2,
    name: 'Parang National High School',
    location: 'Parang, Marikina City',
    contact: ['(02) 8646-3652', '09171234002'],
    capacity: 300,
    current: 298,
    status: 'full',
  },
  {
    id: 3,
    name: 'Marikina City Hall Gymnasium',
    location: 'J.P. Rizal St., Sta. Elena, Marikina',
    contact: ['(02) 8646-3653'],
    capacity: 200,
    current: 0,
    status: 'closed',
  },
  {
    id: 4,
    name: 'Nangka Covered Court',
    location: 'Nangka, Marikina City',
    contact: ['(02) 8646-3654', '09171234004'],
    capacity: 250,
    current: 134,
    status: 'open',
  },
  {
    id: 5,
    name: 'Concepcion Elementary School',
    location: 'Concepcion Uno, Marikina City',
    contact: ['(02) 8646-3655'],
    capacity: 400,
    current: 211,
    status: 'open',
  },
  {
    id: 6,
    name: 'Tumana Multi-purpose Hall',
    location: 'Tumana, Marikina City',
    contact: ['(02) 8646-3656', '09171234006'],
    capacity: 150,
    current: 150,
    status: 'full',
  },
];

// ─── Emergency Hotlines ───────────────────────────────────────────────────────
export const nationalHotlines = [
  { name: 'NDRRMC', number: '8911', desc: 'Nat\'l Disaster Risk Reduction' },
  { name: 'Philippine Red Cross', number: '143', desc: 'Emergency Humanitarian Aid' },
  { name: 'PNP Hotline', number: '117 / 166', desc: 'Philippine National Police' },
  { name: 'Bureau of Fire', number: '160', desc: 'Bureau of Fire Protection' },
  { name: 'PAGASA', number: '(02) 8284-0800', desc: 'Weather & Flood Forecasts' },
  { name: 'DOH Emergency', number: '1555', desc: 'Dept. of Health Hotline' },
  { name: 'DSWD Action Line', number: '931', desc: 'Social Welfare & Development' },
  { name: 'Rescue 161', number: '161', desc: 'Search & Rescue Operations' },
];

export const marikinаHotlines = [
  { name: 'Marikina CDRRMO', number: '(02) 8646-3651', desc: 'City Disaster Risk Reduction' },
  { name: 'Marikina CSWDO', number: '(02) 8646-3652', desc: 'City Social Welfare Office' },
  { name: 'Marikina PNP', number: '(02) 8646-3653', desc: 'Marikina Police Station' },
  { name: 'Marikina BFP', number: '(02) 8646-3654', desc: 'Marikina Fire Department' },
  { name: 'Marikina CHO', number: '(02) 8646-3655', desc: 'City Health Office' },
  { name: 'Mayor\'s Hotline', number: '(02) 8646-3600', desc: 'Office of the City Mayor' },
];

// ─── Admin: Evacuees ─────────────────────────────────────────────────────────
export interface Evacuee {
  id: number;
  head: string;
  phone: string;
  address: string;
  total: number;
  pwd: number;
  seniors: number;
  pregnant: number;
  babies: number;
  center: string;
}

export const evacueesList: Evacuee[] = [
  { id: 1, head: 'Juan dela Cruz', phone: '09171234567', address: 'Sto. Niño, Marikina', total: 5, pwd: 1, seniors: 1, pregnant: 0, babies: 1, center: 'Marikina Sports Center' },
  { id: 2, head: 'Ana Reyes', phone: '09289876543', address: 'Parang, Marikina', total: 3, pwd: 0, seniors: 1, pregnant: 1, babies: 0, center: 'Parang National HS' },
  { id: 3, head: 'Roberto Lim', phone: '09175551234', address: 'Nangka, Marikina', total: 7, pwd: 2, seniors: 2, pregnant: 0, babies: 2, center: 'Nangka Covered Court' },
  { id: 4, head: 'Carla Mendoza', phone: '09196667890', address: 'Tumana, Marikina', total: 4, pwd: 0, seniors: 1, pregnant: 0, babies: 1, center: 'Marikina Sports Center' },
  { id: 5, head: 'Pedro Bautista', phone: '09178889012', address: 'Concepcion Uno, Marikina', total: 6, pwd: 1, seniors: 0, pregnant: 1, babies: 2, center: 'Concepcion Elem School' },
  { id: 6, head: 'Luz Garcia', phone: '09272223456', address: 'Sto. Niño, Marikina', total: 2, pwd: 1, seniors: 1, pregnant: 0, babies: 0, center: 'Marikina Sports Center' },
  { id: 7, head: 'Mario Torres', phone: '09154445678', address: 'Parang, Marikina', total: 8, pwd: 0, seniors: 3, pregnant: 0, babies: 1, center: 'Parang National HS' },
  { id: 8, head: 'Teresa Villanueva', phone: '09177778901', address: 'Nangka, Marikina', total: 3, pwd: 0, seniors: 0, pregnant: 1, babies: 1, center: 'Nangka Covered Court' },
];

// ─── Admin: Users ─────────────────────────────────────────────────────────────
export interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'approved' | 'pending' | 'rejected';
  smsEnabled: boolean;
  idImage: string;
  registeredAt: string;
}

export const registeredUsers: RegisteredUser[] = [
  { id: 1, name: 'Maria Santos', email: 'maria@example.com', phone: '09171111111', address: 'Sto. Niño, Marikina', status: 'approved', smsEnabled: true, idImage: 'id_001.jpg', registeredAt: '2025-01-10' },
  { id: 2, name: 'Jose Ramos', email: 'jose@example.com', phone: '09172222222', address: 'Parang, Marikina', status: 'approved', smsEnabled: false, idImage: 'id_002.jpg', registeredAt: '2025-01-12' },
  { id: 3, name: 'Anna Cruz', email: 'anna@example.com', phone: '09173333333', address: 'Nangka, Marikina', status: 'pending', smsEnabled: false, idImage: 'id_003.jpg', registeredAt: '2025-04-28' },
  { id: 4, name: 'Carlo Reyes', email: 'carlo@example.com', phone: '09174444444', address: 'Tumana, Marikina', status: 'pending', smsEnabled: false, idImage: 'id_004.jpg', registeredAt: '2025-04-29' },
  { id: 5, name: 'Lena Pascual', email: 'lena@example.com', phone: '09175555555', address: 'Concepcion, Marikina', status: 'rejected', smsEnabled: false, idImage: 'id_005.jpg', registeredAt: '2025-04-27' },
];

// ─── Admin: Admins ────────────────────────────────────────────────────────────
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  phone: string;
  barangay: string;
  active: boolean;
  createdAt: string;
}

export const adminUsers: AdminUser[] = [
  { id: 1, name: 'Super Admin', email: 'superadmin@resq.gov.ph', role: 'superadmin', phone: '09170000001', barangay: 'All', active: true, createdAt: '2024-01-01' },
  { id: 2, name: 'Admin Cruz', email: 'admin@resq.gov.ph', role: 'admin', phone: '09170000002', barangay: 'Sto. Niño', active: true, createdAt: '2024-03-15' },
  { id: 3, name: 'Brgy. Coordinator Diaz', email: 'diaz@resq.gov.ph', role: 'admin', phone: '09170000003', barangay: 'Parang', active: true, createdAt: '2024-04-01' },
  { id: 4, name: 'Officer Mendez', email: 'mendez@resq.gov.ph', role: 'admin', phone: '09170000004', barangay: 'Nangka', active: false, createdAt: '2024-05-20' },
];
