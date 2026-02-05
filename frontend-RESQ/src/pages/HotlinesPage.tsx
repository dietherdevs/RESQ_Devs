import React from 'react';
import { Phone, Shield, Ambulance, Flame, Droplets, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function HotlinesPage() {
  const { t } = useLanguage();

  const hotlines = [
    {
      category: 'Barangay Nangka',
      icon: MapPin,
      color: 'bg-blue-500',
      numbers: [
        { label: 'Barangay Hall', number: '(02) 8941-1234' },
        { label: 'Barangay Captain', number: '(02) 8941-5678' },
        { label: 'DRRM Office', number: '(02) 8941-9012' },
      ],
    },
    {
      category: 'Marikina City Emergency',
      icon: Shield,
      color: 'bg-red-500',
      numbers: [
        { label: 'Emergency Operations Center', number: '(02) 8646-2345' },
        { label: 'Disaster Risk Reduction', number: '(02) 8682-2034' },
        { label: 'City Hall Hotline', number: '(02) 8682-5959' },
      ],
    },
    {
      category: 'Medical Emergency',
      icon: Ambulance,
      color: 'bg-green-500',
      numbers: [
        { label: 'Marikina Valley Medical Center', number: '(02) 8941-6764' },
        { label: 'Amang Rodriguez Hospital', number: '(02) 8681-3000' },
        { label: 'Red Cross Marikina', number: '(02) 8942-7879' },
        { label: 'Emergency Medical Services', number: '911' },
      ],
    },
    {
      category: 'Fire Department',
      icon: Flame,
      color: 'bg-orange-500',
      numbers: [
        { label: 'Bureau of Fire Protection - Marikina', number: '(02) 8941-3029' },
        { label: 'Fire Emergency Hotline', number: '(02) 8426-0219' },
        { label: 'BFP National Hotline', number: '(02) 8426-3812' },
      ],
    },
    {
      category: 'Police & Security',
      icon: Shield,
      color: 'bg-indigo-500',
      numbers: [
        { label: 'Marikina Police Station', number: '(02) 8646-1728' },
        { label: 'PNP Emergency Hotline', number: '911' },
        { label: 'PNP-NCR Hotline', number: '(02) 8723-0401' },
      ],
    },
    {
      category: 'Flood & Weather',
      icon: Droplets,
      color: 'bg-cyan-500',
      numbers: [
        { label: 'PAGASA Weather Bureau', number: '(02) 8927-1335' },
        { label: 'PAGASA Flood Forecasting', number: '(02) 8927-2877' },
        { label: 'MMDA Flood Control', number: '136' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{t('hotlines')}</h1>
          <p className="text-gray-600">Barangay Nangka & Marikina City</p>
        </div>

        {/* Emergency Banner */}
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-8 h-8 text-red-600" />
            <h2 className="text-2xl font-bold text-red-800">Emergency: 911</h2>
          </div>
          <p className="text-gray-700">
            For immediate life-threatening emergencies, always call 911 first.
          </p>
        </Card>

        {/* Hotlines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotlines.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.category} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${category.color} p-3 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{category.category}</h3>
                </div>
                <div className="space-y-3">
                  {category.numbers.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-800">{item.label}</div>
                        <a 
                          href={`tel:${item.number.replace(/[^\d+]/g, '')}`}
                          className="text-blue-500 hover:underline font-semibold"
                        >
                          {item.number}
                        </a>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => window.location.href = `tel:${item.number.replace(/[^\d+]/g, '')}`}
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Important Notes */}
        <Card className="p-6 mt-6 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-gray-800 mb-3">Important Reminders:</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• <strong>Stay Calm:</strong> Provide clear and accurate information when calling.</li>
            <li>• <strong>Location First:</strong> Always state your exact location at the beginning.</li>
            <li>• <strong>Nature of Emergency:</strong> Briefly describe what happened.</li>
            <li>• <strong>Follow Instructions:</strong> Listen carefully to the emergency operator.</li>
            <li>• <strong>Do Not Hang Up:</strong> Stay on the line until told otherwise.</li>
            <li>• <strong>Save Numbers:</strong> Store important emergency numbers in your phone.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}