import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Droplets, Activity, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/card';

interface WaterLog {
  level_meters: number;
  location: string;
  status: 'Normal' | 'Warning' | 'Critical' | 'Evacuate';
  recorded_at: string;
  source?: string;
}

export function FloodLevelPage() {
  const [data, setData] = useState<WaterLog | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data Logic ---
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/water-level/latest');
      setData(response.data);
    } catch (error) {
      console.error("Failed to load flood data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Helper for Colors (Matches Home Page Logic) ---
  const getStatusColor = (status?: string) => {
    if (status === 'Critical' || status === 'Evacuate') {
      return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-600', icon: 'text-red-600' };
    }
    if (status === 'Warning') {
      return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-500', icon: 'text-orange-500' };
    }
    return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-500', icon: 'text-green-500' };
  };

  const styles = getStatusColor(data?.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-slate-600 animate-pulse flex flex-col items-center gap-4">
          <Droplets className="w-12 h-12 text-blue-400" />
          Loading live data from PAGASA...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-10 mt-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Marikina River Monitor
          </h1>
          <p className="text-lg text-slate-600">
            Real-time water level updates for Barangay Nangka
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* MAIN STATUS CARD */}
          <Card className={`p-8 border-t-8 shadow-lg flex flex-col justify-center items-center text-center ${styles.border} bg-white`}>
            
            {/* Icon */}
            <div className={`mb-6 p-4 rounded-full ${styles.bg} shadow-sm`}>
              <Droplets className={`w-12 h-12 ${styles.icon}`} />
            </div>
            
            <h2 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">
              Current Water Level
            </h2>
            
            {/* Numeric Level */}
            <div className="text-2xl font-black text-slate-900 mb-6 font-bold">
              {data?.level_meters || 0}<span className="text-3xl text-slate-400 ml-1 font-bold">m</span>
            </div>
            
            {/* Status Indicator (Styled like Home Page) */}
            <div className={`inline-block px-8 py-3 rounded-full ${styles.bg}`}>
              <span className={`font-bold text-xl uppercase tracking-wider ${styles.text}`}>
                {data?.status || 'Normal'}
              </span>
            </div>
          </Card>

          {/* DETAILS CARD */}
          <Card className="p-8 shadow-lg flex flex-col justify-center space-y-8 bg-white border-t-8 border-slate-200">
             
             {/* Location Info */}
             <div className="flex items-start gap-5">
                <div className="p-3 bg-blue-50 rounded-xl">
                    <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sensor Location</p>
                    <p className="text-xl font-bold text-slate-800">{data?.location || 'Marikina River'}</p>
                </div>
             </div>

             {/* Time Info */}
             <div className="flex items-start gap-5">
                <div className="p-3 bg-blue-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Updated</p>
                    <p className="text-xl font-bold text-slate-800">
                        {data?.recorded_at ? new Date(data.recorded_at).toLocaleString() : 'No data yet'}
                    </p>
                </div>
             </div>

             {/* Clickable Source Link */}
             <div className="pt-6 border-t border-slate-100">
                <div className="flex items-start gap-2 text-slate-500 hover:text-blue-600 transition-colors">
                    <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">
                        Data source: <br/>
                        <a 
                          href="https://pasig-marikina-tullahanffws.pagasa.dost.gov.ph/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold underline decoration-blue-300 hover:text-blue-700 hover:decoration-blue-600 transition-all"
                        >
                          PAGASA - Philippine Atmospheric, Geophysical and Astronomical Services Administration
                        </a>
                    </p>
                </div>
             </div>
          </Card>
        </div>

        {/* ALARM LEGEND */}
        <Card className="p-8 shadow-md border-0 bg-white">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
                <Activity className="w-6 h-6 text-blue-600" />
                Understand the Alarms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Normal */}
                <div className="p-6 rounded-xl bg-green-50 border border-green-100 transition-transform hover:-translate-y-1">
                    <div className="font-extrabold text-green-700 text-lg mb-2">Normal</div>
                    <div className="text-sm font-semibold text-green-600 mb-1">Less than 15 meters</div>
                    <div className="text-xs text-green-500 leading-relaxed">Safe condition. No flooding expected.</div>
                </div>
                
                {/* Warning */}
                <div className="p-6 rounded-xl bg-orange-50 border border-orange-100 transition-transform hover:-translate-y-1">
                    <div className="font-extrabold text-orange-700 text-lg mb-2">Warning (1st Alarm)</div>
                    <div className="text-sm font-semibold text-orange-600 mb-1">15.0 - 15.9 meters</div>
                    <div className="text-xs text-orange-500 leading-relaxed">Prepare evacuation kits. Stay alert for updates.</div>
                </div>
                
                {/* Critical */}
                <div className="p-6 rounded-xl bg-red-50 border border-red-100 transition-transform hover:-translate-y-1">
                    <div className="font-extrabold text-red-700 text-lg mb-2">Critical (Evacuate)</div>
                    <div className="text-sm font-semibold text-red-600 mb-1">16.0 meters and above</div>
                    <div className="text-xs text-red-500 leading-relaxed">Forced evacuation enforced. Move to higher ground immediately.</div>
                </div>
            </div>
        </Card>

      </div>
    </div>
  );
}