import React from 'react';
import { Activity, CheckCircle, Server, Database, Smartphone, Wifi } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function StatusPage() {
  const { t } = useLanguage();

  const systemStatus = {
    overall: 'operational',
    lastUpdated: new Date().toLocaleString(),
    uptime: '99.8%',
  };

  const services = [
    {
      name: 'Web Application',
      status: 'operational',
      icon: Activity,
      uptime: '99.9%',
      responseTime: '120ms',
      description: 'Handles user interactions and data presentation.',
    },
    {
      name: 'Flood Monitoring System',
      status: 'operational',
      icon: Server,
      uptime: '99.8%',
      responseTime: '200ms',
      description: 'Monitors flood levels in real-time.',
    },
    {
      name: 'SMS Alert Service',
      status: 'operational',
      icon: Smartphone,
      uptime: '99.5%',
      responseTime: '500ms',
      description: 'Sends SMS alerts for emergency situations.',
    },
    {
      name: 'Database',
      status: 'operational',
      icon: Database,
      uptime: '99.9%',
      responseTime: '50ms',
      description: 'Stores and manages all system data.',
    },
    {
      name: 'API Gateway',
      status: 'operational',
      icon: Wifi,
      uptime: '99.7%',
      responseTime: '80ms',
      description: 'Facilitates communication between different services.',
    },
  ];

  const recentUpdates = [
    {
      date: '2026-01-10',
      title: 'System Maintenance Completed',
      description: 'Regular maintenance was performed on all systems. Everything is operating normally.',
      type: 'maintenance',
    },
    {
      date: '2026-01-08',
      title: 'New Feature: Enhanced Flood Monitoring',
      description: 'Added real-time graphs and 24-hour historical data for flood levels.',
      type: 'feature',
    },
    {
      date: '2026-01-05',
      title: 'SMS Service Upgrade',
      description: 'Improved SMS delivery speed and reliability for emergency alerts.',
      type: 'improvement',
    },
    {
      date: '2026-01-01',
      title: 'New Year System Check',
      description: 'All systems tested and verified operational for the new year.',
      type: 'maintenance',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'outage':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-blue-500';
      case 'improvement':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{t('websiteStatus')}</h1>
          <p className="text-gray-600">R.E.S.Q System Health & Updates</p>
        </div>

        {/* Overall Status */}
        <Card className="p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">All Systems Operational</h2>
                <p className="text-gray-600">All services are running smoothly</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">System Uptime</div>
              <div className="text-3xl font-bold text-green-600">{systemStatus.uptime}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Last updated: {systemStatus.lastUpdated}
          </div>
        </Card>

        {/* Services Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Status</h2>
          <div className="space-y-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.name} className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-full">
                        <Icon className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <div className="text-gray-600">Uptime</div>
                        <div className="font-semibold text-green-600">{service.uptime}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Response Time</div>
                        <div className="font-semibold text-blue-600">{service.responseTime}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Updates & Announcements</h2>
          <div className="space-y-4">
            {recentUpdates.map((update, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Badge className={getTypeColor(update.type)}>
                      {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-gray-800">{update.title}</h3>
                      <span className="text-sm text-gray-500 whitespace-nowrap">{update.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{update.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* System Information */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Version:</span>
              <span className="ml-2 font-semibold">1.0.0</span>
            </div>
            <div>
              <span className="text-gray-600">Last Deployment:</span>
              <span className="ml-2 font-semibold">January 10, 2026</span>
            </div>
            <div>
              <span className="text-gray-600">Server Location:</span>
              <span className="ml-2 font-semibold">Metro Manila, Philippines</span>
            </div>
            <div>
              <span className="text-gray-600">Data Center:</span>
              <span className="ml-2 font-semibold">Primary (Active)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}