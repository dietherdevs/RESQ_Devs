import { useState, useEffect } from 'react';
import { History, Clock, User, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const NAVY = '#0D1B2A';
const ORANGE = '#FF6B2B';

// Define the shape of our log data based on the Laravel backend
interface SmsLog {
  id: number;
  user: {
    id: number;
    name: string;
  };
  sender_role: string;
  message: string;
  recipients_count: number;
  status: string;
  created_at: string;
}

export function SmsLogs() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('auth_token'); // Using the correct key!

      if (!token) {
        setError('Session expired. Please log in again to view logs.');
        setLoading(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/admin/sms-logs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setLogs(result.data);
      } else {
        setError(result.message || 'Failed to fetch SMS logs.');
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format the Laravel timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-black text-2xl flex items-center gap-2" style={{ color: NAVY }}>
          <History size={24} style={{ color: ORANGE }} />
          Broadcast History
        </h1>
        <p className="text-gray-500 text-sm mt-1">Review previously sent emergency alerts and their delivery status</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4 min-w-[300px]">Message</th>
                <th className="px-6 py-4 text-center">Recipients</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 && !error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No broadcast logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>

                    {/* Sender */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-800">{log.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 capitalize">{log.sender_role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Message */}
                    <td className="px-6 py-4 text-gray-600">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs leading-relaxed">
                        {log.message}
                      </div>
                    </td>

                    {/* Recipients */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                        <Users size={12} />
                        {log.recipients_count}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {log.status === 'success' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold text-xs">
                          <CheckCircle size={12} />
                          Success
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-semibold text-xs">
                          <XCircle size={12} />
                          Failed
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}