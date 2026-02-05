import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, MessageSquare, MapPin, AlertTriangle, TrendingUp, Activity, Droplets } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; 
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { user } = useAuth?.() || { user: { firstName: 'Admin', lastName: 'User', role: 'admin' } };

  // 1. State for ALL Real Backend Data
  const [stats, setStats] = useState({
    total_sent: 0,
    active_now: 0,
    active_evacuees: 0, // ADDED: New state for evacuees
    latest_alert: null as any
  });

  // 2. State for Flood Level
  const [waterLevel, setWaterLevel] = useState({
    level_meters: 0,
    status: 'Normal',
    recorded_at: null
  });

  // 3. Fetch Data on Page Load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Parallel requests to get ALL real data
      const [evacRes, waterRes, alertsRes] = await Promise.all([
        axios.get('/evacuees/stats'),    // Your NEW Endpoint
        axios.get('/water-level/latest'), // Your Water Level Endpoint
        axios.get('/alerts')              // Your Alerts Endpoint (to count active)
      ]);

      // Calculate Active Alerts Logic
      const activeAlerts = alertsRes.data ? alertsRes.data.filter((a: any) => a.status === 'Active').length : 0;
      const totalSent = alertsRes.data ? alertsRes.data.length : 0;
      const latest = alertsRes.data && alertsRes.data.length > 0 ? alertsRes.data[0] : null;

      setStats({
        total_sent: totalSent,
        active_now: activeAlerts,
        active_evacuees: evacRes.data.active_count || 0, // Real count from DB
        latest_alert: latest
      });

      setWaterLevel(waterRes.data);

    } catch (error) {
      console.error("Failed to load dashboard data", error);
      // Optional: don't show toast on load error to avoid spamming
    }
  };

  // 4. Helper to Simulate Sensor (Kept for testing)
  const simulateSensorUpdate = async () => {
    try {
        const randomLevel = (Math.random() * 20).toFixed(1); 
        const status = randomLevel > 15 ? 'Critical' : randomLevel > 10 ? 'Warning' : 'Normal';
        
        await axios.post('/water-level', {
            location: 'Marikina River (Sensor 1)',
            level_meters: parseFloat(randomLevel),
            status: status
        });

        toast.success(`Sensor Updated: ${randomLevel}m (${status})`);
        fetchDashboardData(); 
    } catch (e) {
        toast.error("Failed to update sensor");
    }
  };

  // 5. Configuration for the Cards
  const statsConfig = [
    {
      label: 'Active Evacuees', // UPDATED: Now shows real evacuee count
      value: stats.active_evacuees.toString(),
      icon: Users,
      color: 'bg-green-500', // Changed to Green to indicate safety/evacuation
      change: 'Live Count',
    },
    {
      label: 'Current Flood Level', 
      value: `${waterLevel.level_meters}m`,
      icon: Droplets, 
      color: waterLevel.status === 'Critical' ? 'bg-red-600' : waterLevel.status === 'Warning' ? 'bg-orange-500' : 'bg-blue-400',
      change: waterLevel.status || 'Normal', 
    },
    {
      label: 'SMS Alerts Sent', 
      value: stats.total_sent.toString(),
      icon: MessageSquare,
      color: 'bg-blue-500',
      change: 'Total',
    },
    {
      label: 'Active Emergencies', 
      value: stats.active_now.toString(), 
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: stats.active_now > 0 ? 'Active' : 'None',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 mt-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName} {user?.lastName}</p>
            <Badge className="mt-2 capitalize bg-blue-500 text-white">{user?.role}</Badge>
          </div>
          
          <button 
            onClick={simulateSensorUpdate}
            className="mt-4 md:mt-0 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition"
          >
            🔄 Simulate Sensor Update
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-full shadow-lg shadow-opacity-20`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* RECENT ACTIVITIES */}
          <Card className="p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Activities
            </h2>
            <div className="space-y-4">
              {stats.latest_alert && (
                 <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 rounded-full mt-2 bg-red-500"></div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-red-800">BROADCAST SENT: {stats.latest_alert.title}</div>
                        <div className="text-xs text-red-600">{new Date(stats.latest_alert.created_at).toLocaleString()}</div>
                    </div>
                 </div>
              )}
              {waterLevel.recorded_at && (
                 <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
                    <div className="flex-1">
                        <div className="text-sm font-bold text-blue-800">SENSOR UPDATE: Water Level at {waterLevel.level_meters}m</div>
                        <div className="text-xs text-blue-600">{new Date(waterLevel.recorded_at).toLocaleString()}</div>
                    </div>
                 </div>
              )}
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full mt-2 bg-gray-400"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">System check completed</div>
                    <div className="text-xs text-gray-500">Auto-check</div>
                  </div>
              </div>
            </div>
          </Card>

          {/* QUICK ACTIONS */}
          <Card className="p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href='/send-sms'} 
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors group border border-blue-100"
              >
                <div className="font-semibold text-blue-900 group-hover:text-blue-700">Send Emergency SMS</div>
                <div className="text-sm text-blue-700">Broadcast alert to all users</div>
              </button>
              
              <button 
                // CONNECTED: Redirects to your new Evacuees Page
                onClick={() => window.location.href='/admin-evacuees'}
                className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors group border border-orange-100"
              >
                <div className="font-semibold text-orange-900 group-hover:text-orange-700">Manage Evacuees</div>
                <div className="text-sm text-orange-700">Check-In Families & Track Counts</div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}