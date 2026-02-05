import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Droplets, Activity, Save } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

interface WaterLog {
  id: number;
  level_meters: number;
  location: string;
  status: 'Normal' | 'Warning' | 'Critical';
  recorded_at: string;
}

export function FloodLevelPage() {
  const [currentLevel, setCurrentLevel] = useState<WaterLog | null>(null);
  
  // Form State
  const [levelInput, setLevelInput] = useState('');
  const [locationInput, setLocationInput] = useState('Marikina River'); 
  const [loading, setLoading] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    fetchLatest();
  }, []);

  const fetchLatest = async () => {
    try {
      const response = await axios.get('/water-level/latest');
      if (response.data.id || response.data.level_meters !== undefined) { 
          setCurrentLevel(response.data);
      }
    } catch (error) {
      console.error("No water data yet");
    }
  };

  // 2. Submit New Reading
  const handleLogUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelInput) return;

    setLoading(true);
    const meters = parseFloat(levelInput);

    // Auto-determine status
    let status = 'Normal';
    if (meters >= 15) status = 'Warning'; 
    if (meters >= 18) status = 'Critical'; 

    try {
      const payload = {
        location: locationInput,
        level_meters: meters,
        status: status
      };

      await axios.post('/water-level', payload);
      
      toast.success(`Water level updated to ${meters}m (${status})`);
      setLevelInput(''); // Clear form
      fetchLatest();     // Refresh the Big Card
      
    } catch (error) {
      toast.error("Failed to log water level");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 mt-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Flood Monitoring (Admin)</h1>
          <p className="text-slate-600">Real-time water level logging</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: Current Status Card */}
          <div className="space-y-6">
            <Card className={`p-8 border-l-8 shadow-md ${
                currentLevel?.status === 'Critical' ? 'border-red-600 bg-red-50' : 
                currentLevel?.status === 'Warning' ? 'border-orange-500 bg-orange-50' : 
                'border-blue-500 bg-white'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Droplets className={`w-6 h-6 ${
                    currentLevel?.status === 'Critical' ? 'text-red-600' : 'text-blue-600'
                }`} />
                <h2 className="text-lg font-semibold text-slate-700">Current Water Level</h2>
              </div>
              
              <div className="flex items-baseline gap-2 mt-4">
                <span className={`text-6xl font-extrabold ${
                    currentLevel?.status === 'Critical' ? 'text-red-700' : 
                    currentLevel?.status === 'Warning' ? 'text-orange-700' : 'text-blue-700'
                }`}>
                    {currentLevel?.level_meters || 0}
                </span>
                <span className="text-xl text-slate-500">meters</span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge className={`px-3 py-1 text-sm ${
                    currentLevel?.status === 'Critical' ? 'bg-red-600' : 
                    currentLevel?.status === 'Warning' ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                    {currentLevel?.status || 'Normal'}
                </Badge>
                <div className="text-sm text-slate-500">
                    Last Updated: {currentLevel?.recorded_at ? new Date(currentLevel.recorded_at).toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            </Card>

            {/* Protocol Guide */}
            <Card className="p-6 bg-slate-100">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Alarm Levels Guide
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-white rounded border-l-4 border-blue-400">
                        <span>Normal</span>
                        <span className="font-bold text-slate-600">&lt; 15 meters</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border-l-4 border-orange-400">
                        <span>Warning (1st Alarm)</span>
                        <span className="font-bold text-orange-600">15 - 17.9 meters</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded border-l-4 border-red-600">
                        <span>Critical (Evacuate)</span>
                        <span className="font-bold text-red-700">18+ meters</span>
                    </div>
                </div>
            </Card>
          </div>

          {/* RIGHT: Input Form (Only in Admin Version) */}
          <Card className="p-6 h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Save className="w-5 h-5 text-blue-600" />
                Log New Reading
            </h2>
            
            <form onSubmit={handleLogUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Monitoring Location
                    </label>
                    <input 
                        type="text" 
                        value={locationInput}
                        onChange={e => setLocationInput(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Water Level (Meters)
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            step="0.1" 
                            min="0"
                            placeholder="0.0"
                            value={levelInput}
                            onChange={e => setLevelInput(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                        />
                        <span className="absolute right-4 top-3.5 text-slate-400 font-medium">meters</span>
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading || !levelInput}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? 'Logging...' : 'Update Water Level'}
                </button>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
}