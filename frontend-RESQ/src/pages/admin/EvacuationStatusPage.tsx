import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Users, Home, AlertCircle, Save, RefreshCw, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

interface EvacuationCenter {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: 'Open' | 'Closed' | 'Full';
  contact_number: string;
}

export function EvacuationStatusPage() {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track which center is currently being edited
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await axios.get('/centers');
      setCenters(response.data);
    } catch (error) {
      toast.error("Failed to load evacuation centers");
    } finally {
      setLoading(false);
    }
  };

  // --- 1. FIXED: Input Logic (No Negatives) ---
  const handleCapacityChange = (id: number, newCapacity: string) => {
    // Prevent typing negative signs or non-numbers
    if (newCapacity.includes('-')) return;

    const val = parseInt(newCapacity);
    
    // Ensure value is never negative
    if (val < 0) return; 

    setCenters(centers.map(c => 
      c.id === id ? { ...c, capacity: isNaN(val) ? 0 : val } : c
    ));
  };

  const saveCapacity = async (center: EvacuationCenter) => {
    if (center.capacity < 0) {
        toast.error("Capacity cannot be negative");
        return;
    }
    
    setSavingId(center.id);
    try {
      await axios.put(`/centers/${center.id}`, {
        capacity: center.capacity
      });
      toast.success("Capacity updated!");
    } catch (error) {
      toast.error("Failed to save capacity");
    } finally {
      setSavingId(null);
    }
  };

  // --- Update Status ---
  const updateStatus = async (id: number, newStatus: string) => {
    try {
      // Optimistic Update
      setCenters(centers.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
      await axios.put(`/centers/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Update failed");
      fetchCenters(); 
    }
  };

  // --- 2. NEW: Initialize the 3 Specific Centers ---
  const initializeCenters = async () => {
    const confirmReset = window.confirm(
        "This will add 'Civic Center', 'Nangka Elementary', and 'St. Mary Elementary'. Continue?"
    );
    if (!confirmReset) return;

    const standardCenters = [
        {
            name: 'Civic Center',
            location: 'Nangka Compound',
            capacity: 500,
            status: 'Closed',
            contact_number: '0917-111-1111'
        },
        {
            name: 'Nangka Elementary School',
            location: 'Kabatuhan St.',
            capacity: 1000,
            status: 'Closed',
            contact_number: '0917-222-2222'
        },
        {
            name: 'St. Mary Elementary School',
            location: 'General Luna St.',
            capacity: 800,
            status: 'Closed',
            contact_number: '0917-333-3333'
        }
    ];

    try {
        // Create them one by one
        for (const center of standardCenters) {
            await axios.post('/centers', center);
        }
        
        // Refresh the list immediately
        await fetchCenters();
        toast.success("Standard Evacuation Centers Added!");
    } catch (e) {
        console.error(e);
        toast.error("Error creating centers");
    }
  };

  if (loading) return <div className="p-8">Loading Centers...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Evacuation Status</h1>
            <p className="text-slate-600">Manage center availability and capacity</p>
          </div>
          
          {/* Button to Generate the 3 Centers */}
          <button 
                onClick={initializeCenters} 
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition shadow-sm text-sm"
            >
                <RefreshCw className="w-4 h-4" />
                Add Standard Centers
          </button>
        </div>

        {/* Grid of Centers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center) => (
            <Card key={center.id} className="p-6 border-t-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Center Name & Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 min-h-[50px]">
                    <Home className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    {center.name}
                  </h3>
                  <div className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {center.location}
                  </div>
                </div>
                <Badge className={`
                    ${center.status === 'Open' ? 'bg-green-500 hover:bg-green-600' : 
                      center.status === 'Full' ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-400 hover:bg-slate-500'}
                `}>
                    {center.status}
                </Badge>
              </div>

              {/* Editable Capacity Section */}
              <div className="bg-slate-50 p-3 rounded-lg mb-6 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Max Capacity
                </div>
                <div className="flex items-center gap-2">
                    {/* FIXED INPUT: Min 0, No Negatives */}
                    <input 
                        type="number" 
                        min="0"
                        value={center.capacity}
                        onChange={(e) => handleCapacityChange(center.id, e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        onClick={() => saveCapacity(center)}
                        disabled={savingId === center.id}
                        className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 disabled:opacity-50 transition"
                        title="Save Capacity"
                    >
                        {savingId === center.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button 
                    onClick={() => updateStatus(center.id, 'Open')}
                    disabled={center.status === 'Open'}
                    className={`py-2 rounded-md font-medium text-xs md:text-sm transition
                        ${center.status === 'Open' ? 'bg-green-100 text-green-800 opacity-50 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}
                    `}
                >
                    Open
                </button>
                <button 
                    onClick={() => updateStatus(center.id, 'Full')}
                    disabled={center.status === 'Full'}
                    className={`py-2 rounded-md font-medium text-xs md:text-sm transition
                        ${center.status === 'Full' ? 'bg-red-100 text-red-800 opacity-50 cursor-not-allowed' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}
                    `}
                >
                    Full
                </button>
                <button 
                    onClick={() => updateStatus(center.id, 'Closed')}
                    disabled={center.status === 'Closed'}
                    className={`py-2 rounded-md font-medium text-xs md:text-sm transition
                        ${center.status === 'Closed' ? 'bg-slate-100 text-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'}
                    `}
                >
                    Close
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}