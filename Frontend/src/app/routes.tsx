import { createBrowserRouter, Navigate } from 'react-router';
import { PublicPage } from './pages/PublicPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { DashboardHome } from './pages/admin/DashboardHome';
import { SendSMS } from './pages/admin/SendSMS';
import { EvacuationStatus } from './pages/admin/EvacuationStatus';
import { EvacueesList } from './pages/admin/EvacueesList';
import { FloodMonitoring } from './pages/admin/FloodMonitoring';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageAdmins } from './pages/admin/ManageAdmins';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicPage,
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: () => <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', Component: DashboardHome },
      { path: 'send-sms', Component: SendSMS },
      { path: 'evacuation-status', Component: EvacuationStatus },
      { path: 'evacuees', Component: EvacueesList },
      { path: 'flood-monitoring', Component: FloodMonitoring },
      { path: 'manage-users', Component: ManageUsers },
      { path: 'manage-admins', Component: ManageAdmins },
    ],
  },
  {
    path: '*',
    Component: () => <Navigate to="/" replace />,
  },
]);
