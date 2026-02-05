import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Users, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

export function SendSMSPage() {
  const [message, setMessage] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [sending, setSending] = useState(false);

  // Hardcoded stats for now (can be connected to backend count later)
  const totalUsers = 1234;
  const usersWithSMSEnabled = 1156;

  const presetMessages = [
    {
      title: '1st Alarm - Prepare',
      message: 'FLOOD ALERT (1st Alarm): Water level rising. Prepare emergency kits and monitor updates. - Barangay Nangka DRRM',
      type: 'warning',
    },
    {
      title: '2nd Alarm - Ready to Evacuate',
      message: 'FLOOD ALERT (2nd Alarm): Prepare to evacuate. Move valuables to higher ground. Stand by for evacuation orders. - Barangay Nangka DRRM',
      type: 'warning',
    },
    {
      title: '3rd Alarm - Evacuate Low Areas',
      message: 'URGENT: FLOOD ALERT (3rd Alarm): Evacuate low-lying areas NOW. Proceed to designated evacuation centers. - Barangay Nangka DRRM',
      type: 'danger',
    },
    {
      title: '4th Alarm - Critical Evacuation',
      message: 'CRITICAL FLOOD EMERGENCY (4th Alarm): EVACUATE IMMEDIATELY to nearest evacuation center. This is a life-threatening situation. - Barangay Nangka DRRM',
      type: 'danger',
    },
    {
      title: 'All Clear',
      message: 'ADVISORY: Flood waters receding. Normal conditions expected soon. Stay alert and follow barangay updates. - Barangay Nangka DRRM',
      type: 'info',
    },
  ];

  // --- BACKEND INTEGRATION ---
  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);

    try {
      // Send the data to your Laravel Backend
      await axios.post('/alerts', {
        title: isEmergency ? 'URGENT SMS BROADCAST' : 'Community Advisory',
        message: message,
        severity: isEmergency ? 'Critical' : 'Low', 
        // CRITICAL FIX: Explicitly set null to indicate "Broadcast to All"
        target_street_id: null, 
        status: 'Active'
      });

      toast.success(`SMS Broadcast sent to ${usersWithSMSEnabled} users!`);
      
      // Reset Form
      setMessage('');
      setIsEmergency(false);

    } catch (error) {
      console.error(error);
      toast.error("Failed to send broadcast. Check connection.");
    } finally {
      setSending(false);
    }
  };

  const usePreset = (preset: { message: string, type: string }) => {
    setMessage(preset.message);
    // Auto-toggle emergency mode if it's a "danger" preset
    if (preset.type === 'danger') {
        setIsEmergency(true);
    } else {
        setIsEmergency(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 mt-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Send SMS Alert</h1>
          <p className="text-gray-600">Broadcast emergency messages to registered users</p>
        </div>

        {/* Recipients Info */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-blue-700">{usersWithSMSEnabled}</div>
              <div className="text-sm text-blue-600">Users will receive this SMS</div>
              <div className="text-xs text-blue-500 mt-1">
                ({totalUsers - usersWithSMSEnabled} users have SMS alerts disabled)
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preset Messages */}
          <Card className="p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Preset Messages</h2>
            <div className="space-y-3">
              {presetMessages.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => usePreset(preset)}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    preset.type === 'danger' ? 'bg-red-50 hover:bg-red-100 border border-red-200' :
                    preset.type === 'warning' ? 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200' :
                    'bg-green-50 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-800 mb-1">{preset.title}</div>
                  <div className="text-xs text-gray-600 line-clamp-2">{preset.message}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Message Composer */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Compose Message</h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="message">Message Content</Label>
                <div className="text-sm text-gray-500">
                  {message.length} / 160 characters
                </div>
              </div>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 320))}
                placeholder="Type your emergency message here..."
                className="min-h-[200px]"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
              <div>
                <div className="font-semibold text-gray-800">Emergency Priority</div>
                <div className="text-sm text-gray-600">Mark as high-priority emergency alert</div>
              </div>
              <Switch
                checked={isEmergency}
                onCheckedChange={setIsEmergency}
                className="data-[state=checked]:bg-red-600"
              />
            </div>

            {isEmergency && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Emergency Alert Mode:</strong> This message will be sent with high priority 
                  and may override recipient's do-not-disturb settings.
                </div>
              </div>
            )}

            {/* Preview */}
            {message && (
              <div className="mb-6">
                <Label className="mb-2 block">Message Preview</Label>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        {isEmergency && <Badge className="bg-red-500 mr-2 text-white">EMERGENCY</Badge>}
                        From: Barangay Nangka DRRM
                      </div>
                      <div className="text-sm text-gray-800">{message}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {sending ? (
                <>Sending SMS...</>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send to {usersWithSMSEnabled} Users
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* SMS History */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent SMS History</h2>
          <div className="space-y-3">
            {[
              { time: '2 hours ago', message: 'ADVISORY: Flood waters receding...', recipients: 1156, type: 'info' },
              { time: '5 hours ago', message: 'URGENT: FLOOD ALERT (3rd Alarm)...', recipients: 1148, type: 'danger' },
              { time: '1 day ago', message: 'FLOOD ALERT (1st Alarm): Water level rising...', recipients: 1142, type: 'warning' },
            ].map((sms, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800 mb-1">{sms.message}</div>
                    <div className="text-xs text-gray-500">
                      Sent to {sms.recipients} users • {sms.time}
                    </div>
                  </div>
                  <Badge className={`text-white ${
                    sms.type === 'danger' ? 'bg-red-500' :
                    sms.type === 'warning' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}>
                    {sms.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}