import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Users, Phone, Navigation, Home, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface EvacuationCenter {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: 'Open' | 'Closed' | 'Full';
  contact_number: string;
}

export function EvacuationPage() {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await axios.get('/centers');
        setCenters(response.data);
      } catch (error) {
        console.error("Failed to load centers");
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  // Filter Logic: Show All, or just Open ones
  const displayedCenters = filter === 'All' 
    ? centers 
    : centers.filter(c => c.status === filter);

  if (loading) return <div className="p-8 text-center">Finding safe zones...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-10 mt-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Evacuation Centers</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Find the nearest safe zone. Please proceed calmly to "Open" centers only.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex justify-center gap-2 mb-8">
            {['All', 'Open', 'Full', 'Closed'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        filter === status 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-white text-slate-600 border hover:bg-slate-100'
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>

        {/* LIST OF CENTERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCenters.map((center) => (
            <Card key={center.id} className="flex flex-col h-full border-t-4 border-blue-500 shadow-md hover:shadow-xl transition-shadow">
              
              {/* IMAGE PLACEHOLDER (Optional) */}
              <div className="h-32 bg-slate-200 w-full flex items-center justify-center text-slate-400 mt-6">
                <Home className="w-10 h-10 opacity-20" />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">
                        {center.name}
                    </h3>
                    <Badge className={`
                        ${center.status === 'Open' ? 'bg-green-500' : 
                          center.status === 'Full' ? 'bg-red-500' : 'bg-slate-400'}
                    `}>
                        {center.status}
                    </Badge>
                </div>

                <div className="text-sm text-slate-500 mb-4 flex items-start gap-1">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {center.location}
                </div>

                <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Capacity
                        </span>
                        <span className="font-semibold text-slate-800">{center.capacity}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2">
                            <Phone className="w-4 h-4" /> Contact
                        </span>
                        <span className="font-semibold text-slate-800">{center.contact_number}</span>
                    </div>

                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition">
                        <Navigation className="w-4 h-4" />
                        Get Directions
                    </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {displayedCenters.length === 0 && (
            <div className="text-center py-12 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No centers found with status "{filter}"</p>
            </div>
        )}

      </div>
    </div>
  );
}