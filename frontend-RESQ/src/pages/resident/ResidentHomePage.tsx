import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Shield, 
  MapPin, 
  Bell, 
  Droplets, 
  Phone, 
  Navigation, 
  AlertTriangle, 
  Info,
  Calendar
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';

export function ResidentHomePage() {
  const { user } = useAuth?.() || { user: { firstName: 'Resident', lastName: '' } };
  
  // STATE
  const [loading, setLoading] = useState(true);
  const [waterLevel, setWaterLevel] = useState({ level: 0, status: 'Normal', lastUpdated: '' });
  const [latestAlert, setLatestAlert] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [waterRes, alertRes, centerRes] = await Promise.all([
          axios.get('/water-level/latest'),
          axios.get('/alerts'),
          axios.get('/centers')
        ]);

        // 1. Water Level
        setWaterLevel({
          level: waterRes.data.level_meters || 0,
          status: waterRes.data.status || 'Normal',
          lastUpdated: waterRes.data.created_at || new Date().toISOString()
        });

        // 2. Latest Active Alert (FIXED: SORTING LOGIC)
        const alerts = alertRes.data || [];
        if (alerts.length > 0) {
           // Sort by Date Descending (Newest -> Oldest)
           alerts.sort((a: any, b: any) => 
             new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
           );
           // Now index 0 is guaranteed to be the newest
           setLatestAlert(alerts[0]); 
        }

        // 3. Open Centers Only
        const openCenters = centerRes.data.filter((c: any) => c.status === 'Open');
        setCenters(openCenters);

      } catch (error) {
        console.error("Failed to load resident data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // HELPER: Color Logic matches Admin Dashboard
  const getStatusColor = (status: string) => {
    if (status === 'Critical') return 'text-red-600';
    if (status === 'Warning') return 'text-orange-500';
    return 'text-blue-600';
  };

  const getBorderColor = (status: string) => {
    if (status === 'Critical') return 'border-red-500';
    if (status === 'Warning') return 'border-orange-500';
    return 'border-blue-500';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-slate-200 rounded-full mb-2"></div>
            <div className="text-slate-400 font-medium">Loading Dashboard...</div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER - Matches Admin Layout */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.firstName} {user?.lastName}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-sm font-medium text-slate-600">System Online</span>
          </div>
        </div>

        {/* STATS GRID - Matches Admin Card Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* 1. WATER LEVEL */}
            <Card className={`p-6 shadow-sm hover:shadow-md transition border-l-4 ${getBorderColor(waterLevel.status)}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${waterLevel.status === 'Critical' ? 'bg-red-50' : waterLevel.status === 'Warning' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                        <Droplets className={`w-6 h-6 ${getStatusColor(waterLevel.status)}`} />
                    </div>
                    <Badge className={`${waterLevel.status === 'Critical' ? 'bg-red-500' : waterLevel.status === 'Warning' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        {waterLevel.status}
                    </Badge>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-slate-900 mb-1">{waterLevel.level}m</h3>
                    <p className="text-slate-500 text-sm">Marikina River Level</p>
                </div>
            </Card>

            {/* 2. OPEN CENTERS COUNT */}
            <Card className="p-6 shadow-sm hover:shadow-md transition border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-50 rounded-full">
                        <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                        Active
                    </Badge>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-slate-900 mb-1">{centers.length}</h3>
                    <p className="text-slate-500 text-sm">Open Evacuation Centers</p>
                </div>
            </Card>

            {/* 3. LATEST ALERT STATUS */}
            <Card className={`p-6 shadow-sm hover:shadow-md transition border-l-4 ${latestAlert ? 'border-red-500' : 'border-slate-300'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${latestAlert ? 'bg-red-50' : 'bg-slate-100'}`}>
                        <Bell className={`w-6 h-6 ${latestAlert ? 'text-red-600' : 'text-slate-400'}`} />
                    </div>
                    {latestAlert && (
                        <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded animate-pulse">
                            New Alert
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">
                        {latestAlert ? 'Emergency Alert' : 'No Alerts'}
                    </h3>
                    <p className="text-slate-500 text-sm truncate">
                        {latestAlert ? latestAlert.title : 'System is normal'}
                    </p>
                </div>
            </Card>

            {/* 4. DATE / TIME */}
            <Card className="p-6 shadow-sm hover:shadow-md transition border-l-4 border-purple-500">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 rounded-full">
                        <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-slate-500 text-sm">
                         {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </Card>

        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: LATEST ANNOUNCEMENT (Takes up 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Latest Announcement
                </h2>
                
                {latestAlert ? (
                    <Card className="p-6 border-l-4 border-red-500 shadow-sm bg-white">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                latestAlert.level === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                                {latestAlert.level} Priority
                            </span>
                            <span className="text-slate-400 text-sm">
                                {new Date(latestAlert.created_at).toLocaleString()}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">{latestAlert.title}</h3>
                        <div className="prose prose-slate max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            {latestAlert.message}
                        </div>
                    </Card>
                ) : (
                    <Card className="p-8 text-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
                        <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-600">No Active Announcements</h3>
                        <p className="text-slate-400">Stay tuned for official updates from the barangay.</p>
                    </Card>
                )}
            </div>

            {/* RIGHT COLUMN: EVACUATION CENTERS LIST */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Open Centers
                </h2>

                {centers.length === 0 ? (
                    <Card className="p-6 text-center text-slate-500 bg-white shadow-sm">
                        <p>No centers currently open.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {centers.map((center) => (
                            <Card key={center.id} className="p-4 shadow-sm hover:shadow-md transition border border-slate-100 bg-white group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition">
                                        {center.name}
                                    </h4>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                                        OPEN
                                    </Badge>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                                    <Navigation className="w-4 h-4" />
                                    {center.location}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                        Capacity: {center.capacity}
                                    </span>
                                    <a 
                                        href={`tel:${center.contact_number}`} 
                                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Phone className="w-4 h-4" />
                                    </a>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
}