import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Droplets, Activity, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface WaterLog {
  level_meters: number;
  location: string;
  status: 'Normal' | 'Warning' | 'Critical';
  recorded_at: string;
}

export function FloodLevelPage() {
  const [data, setData] = useState<WaterLog | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the Latest Data (Same endpoint as Admin)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/water-level/latest');
        setData(response.data);
      } catch (error) {
        console.error("Failed to load flood data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Optional: Auto-refresh every 30 seconds so residents see updates live
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading flood data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Marikina River Monitor
          </h1>
          <p className="text-lg text-slate-600">
            Real-time water level updates for Barangay Nangka
          </p>
        </div>

        {/* MAIN STATUS CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className={`p-8 border-t-8 shadow-lg flex flex-col justify-center items-center text-center ${
            data?.status === 'Critical' ? 'border-red-600 bg-red-50' : 
            data?.status === 'Warning' ? 'border-orange-500 bg-orange-50' : 
            'border-blue-500 bg-white'
          }`}>
            <div className="mb-4 p-4 rounded-full bg-white shadow-sm">
              <Droplets className={`w-10 h-10 ${
                data?.status === 'Critical' ? 'text-red-600' : 'text-blue-600'
              }`} />
            </div>
            
            <h2 className="text-slate-500 font-semibold uppercase tracking-wide text-sm mb-2">
              Current Water Level
            </h2>
            <div className="text-6xl font-black text-slate-900 mb-2">
              {data?.level_meters || 0}<span className="text-2xl text-slate-500 ml-1">m</span>
            </div>
            
            <Badge className={`px-4 py-2 text-lg mt-2 ${
                data?.status === 'Critical' ? 'bg-red-600 hover:bg-red-700' : 
                data?.status === 'Warning' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}>
                {data?.status || 'Normal'}
            </Badge>
          </Card>

          {/* DETAILS CARD */}
          <Card className="p-8 shadow-lg flex flex-col justify-center space-y-6">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500">Sensor Location</p>
                    <p className="font-bold text-slate-800">{data?.location || 'Marikina River'}</p>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500">Last Updated</p>
                    <p className="font-bold text-slate-800">
                        {data?.recorded_at ? new Date(data.recorded_at).toLocaleString() : 'No data yet'}
                    </p>
                </div>
             </div>

             <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 italic">
                    * Data is verified by Barangay Nangka DRRM Office.
                </p>
             </div>
          </Card>
        </div>

        {/* ALARM LEGEND */}
        <Card className="p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Understand the Alarms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="font-bold text-blue-800 mb-1">Normal</div>
                    <div className="text-sm text-blue-600">Less than 15 meters</div>
                    <div className="text-xs text-blue-400 mt-2">Safe condition.</div>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="font-bold text-orange-800 mb-1">Warning (1st Alarm)</div>
                    <div className="text-sm text-orange-600">15.0 - 17.9 meters</div>
                    <div className="text-xs text-orange-400 mt-2">Prepare specifically for evacuation.</div>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="font-bold text-red-800 mb-1">Critical (Evacuate)</div>
                    <div className="text-sm text-red-600">18.0 meters and above</div>
                    <div className="text-xs text-red-400 mt-2">Forced evacuation enforced.</div>
                </div>
            </div>
        </Card>

      </div>
    </div>
  );
}