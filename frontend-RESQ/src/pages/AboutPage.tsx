import React from 'react';
import { 
  AlertTriangle, 
  Users, 
  Shield, 
  Smartphone, 
  MapPin, 
  Bell, 
  Facebook, 
  Instagram, 
  MessageCircle 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import logo from '../assets/resqlogo.png';

export function AboutPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: AlertTriangle,
      title: 'Real-Time Alerts',
      description: 'Receive instant notifications about flood levels and emergency situations in Barangay Nangka.',
      color: 'bg-red-500',
    },
    {
      icon: Smartphone,
      title: 'SMS Notifications',
      description: 'Get emergency alerts directly via SMS to ensure you stay informed even without internet.',
      color: 'bg-blue-500',
    },
    {
      icon: MapPin,
      title: 'Evacuation Centers',
      description: 'Find the nearest evacuation centers with real-time availability and facility information.',
      color: 'bg-orange-500',
    },
    {
      icon: Shield,
      title: 'Emergency Hotlines',
      description: 'Quick access to all emergency contact numbers for Nangka and Marikina City.',
      color: 'bg-green-500',
    },
    {
      icon: Users,
      title: 'Community System',
      description: 'Connects residents with barangay officials for coordinated emergency response.',
      color: 'bg-purple-500',
    },
    {
      icon: Bell,
      title: '24/7 Monitoring',
      description: 'Continuous monitoring of flood levels to keep the community safe at all times.',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 mt-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <img 
            src={logo} 
            alt="R.E.S.Q Logo" 
            className="h-40 w-auto mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{t('about')} R.E.S.Q</h1>
          <p className="text-xl text-gray-600 mb-2">Real-Time Emergency System & Quick Alerts</p>
          <p className="text-gray-600 max-w-3xl mx-auto">
            A comprehensive emergency alert and management system designed specifically for Barangay Nangka, 
            Marikina City to help residents stay safe during flood emergencies and other calamities.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Our Mission</h2>
          <p className="text-gray-700 text-center text-lg">
            To provide timely, accurate, and accessible emergency information to the residents of Barangay Nangka, 
            ensuring community safety through technology-driven solutions and coordinated response systems.
          </p>
        </Card>

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* About Barangay Nangka */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">About Barangay Nangka</h2>
          <div className="text-gray-700 space-y-3">
            <p>
              Barangay Nangka is one of the barangays in Marikina City that is particularly vulnerable to 
              flooding due to its proximity to the Marikina River. The community has experienced numerous 
              flood events over the years, making preparedness and early warning systems critical.
            </p>
            <p>
              R.E.S.Q was developed in response to the community's need for a reliable, accessible, and 
              user-friendly emergency alert system. The system integrates real-time flood monitoring, 
              SMS alerts, and evacuation center information to help residents make informed decisions 
              during emergencies.
            </p>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How R.E.S.Q Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Register & Set Up</h3>
                <p className="text-gray-600 text-sm">
                  Create an account and provide your contact information. Enable SMS alerts to receive 
                  emergency notifications.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Real-Time Monitoring</h3>
                <p className="text-gray-600 text-sm">
                  The system continuously monitors flood levels in Barangay Nangka and updates the 
                  information in real-time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Receive Alerts</h3>
                <p className="text-gray-600 text-sm">
                  When flood levels reach critical thresholds, you receive instant SMS alerts with 
                  important safety information.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Take Action</h3>
                <p className="text-gray-600 text-sm">
                  Access evacuation center information, emergency hotlines, and follow guidance from 
                  barangay officials.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-8 bg-blue-50 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Contact Us</h2>
          <div className="text-center text-gray-700">
            <p className="mb-2">Barangay Nangka, Marikina City</p>
            <p className="mb-2">Email: barangay.nangka@marikina.gov.ph</p>
            <p className="mb-2">Phone: (02) 8941-1234</p>

          </div>
        </Card>

      </div>
    </div>
  );
}