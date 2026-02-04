import React from 'react';
import { AlertTriangle, Droplets, MapPin, Phone, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import logo from 'figma:asset/4b574b690eba4a74e73324033005afce9cdefd16.png';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onShowAuth: (mode: 'login' | 'register') => void;
  isLoggedIn: boolean;
}

export function HomePage({ onNavigate, onShowAuth, isLoggedIn }: HomePageProps) {
  const { t } = useLanguage();
  // Mock current flood status
  const currentFloodStatus = {
    level: 0.8,
    alarm: 'normal' as const,
    status: t('normal'),
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  };

  const quickActions = [
    {
      id: 'flood',
      title: t('floodLevel'),
      icon: Droplets,
      color: 'bg-sky-500',
      description: 'Monitor real-time flood levels',
    },
    {
      id: 'evacuation',
      title: t('evacuationCenters'),
      icon: MapPin,
      color: 'bg-orange-500',
      description: 'Find nearest evacuation centers',
    },
    {
      id: 'hotlines',
      title: t('hotlines'),
      icon: Phone,
      color: 'bg-red-500',
      description: 'Emergency contact numbers',
    },
    {
      id: 'status',
      title: t('websiteStatus'),
      icon: Activity,
      color: 'bg-green-500',
      description: 'System status and updates',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <img 
              src={logo} 
              alt="R.E.S.Q Logo" 
              className="h-40 w-auto mx-auto"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('welcome')}</h1>
          <p className="text-xl md:text-2xl mb-3 text-blue-50">{t('subtitle')}</p>
          <p className="text-lg text-blue-50 mb-8">{t('description')}</p>
          
          {/* CONDITIONAL RENDERING: Only show buttons if user is NOT logged in */}
          {!isLoggedIn && (
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => onShowAuth('login')}
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
              >
                {t('login')}
              </Button>
              <Button
                onClick={() => onShowAuth('register')}
                size="lg"
                variant="outline"
                className="bg-white text-sky-500 hover:bg-sky-50 border-white"
              >
                {t('register')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Current Flood Status */}
      <div className="max-w-6xl mx-auto px-4 -mt-12">
        <Card className="p-6 shadow-xl border-2 border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`${currentFloodStatus.bgColor} p-4 rounded-full`}>
                <Droplets className={`w-8 h-8 ${currentFloodStatus.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{t('currentFloodLevel')}</h3>
                <p className="text-2xl font-bold text-sky-500">{currentFloodStatus.level}m</p>
              </div>
            </div>
            <div className="text-center">
              <div className={`inline-block px-6 py-3 rounded-full ${currentFloodStatus.bgColor}`}>
                <span className={`font-bold text-lg ${currentFloodStatus.color}`}>
                  {currentFloodStatus.status}
                </span>
              </div>
            </div>
            <Button onClick={() => onNavigate('flood')} className="bg-sky-500 hover:bg-sky-600">
              {t('viewDetails')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                onClick={() => onNavigate(action.id)}
              >
                <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Emergency Alert Banner */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Emergency Preparedness</h3>
              <p className="text-yellow-800 text-sm">
                Stay alert and be prepared. Monitor flood levels regularly and know your nearest evacuation center.
                In case of emergency, contact the hotlines immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}