import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { User, Home, Save, Phone, Camera, CheckCircle, Upload, X, Shield, Bell, MapPin, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user } = useAuth(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // STATE FOR IMAGE UPLOAD
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // STATE FOR SMS ALERTS
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [loadingSms, setLoadingSms] = useState(false);

  // STATE FOR HOUSEHOLD FORM
  const [loadingForm, setLoadingForm] = useState(false);
  const [formData, setFormData] = useState({
    street_name: '',
    house_number: '',
    contact_number: '',
    total_members: 1,
    count_seniors: 0,
    count_pwds: 0
  });

  // FETCH DATA
  useEffect(() => {
    fetchHouseholdData();
    if (user?.sms_enabled) {
        setSmsEnabled(true);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchHouseholdData = async () => {
    try {
      const response = await axios.get('/profile/household');
      if (response.data && response.data.id) {
        setFormData({
            street_name: response.data.street_name || '',
            house_number: response.data.house_number || '',
            contact_number: response.data.contact_number || '',
            total_members: response.data.total_members || 1,
            count_seniors: response.data.count_seniors || 0,
            count_pwds: response.data.count_pwds || 0
        });
        if (response.data.sms_enabled !== undefined) {
            setSmsEnabled(response.data.sms_enabled);
        }
      }
    } catch (error) {
       // Silent fail for new users
    }
  };

  // --- SMS TOGGLE HANDLER ---
  const handleSmsToggle = async (checked: boolean) => {
    setSmsEnabled(checked);
    setLoadingSms(true);
    try {
        await axios.post('/profile/sms-settings', { enabled: checked });
        toast.success(checked ? "SMS Alerts Enabled" : "SMS Alerts Disabled");
    } catch (error) {
        setSmsEnabled(!checked); 
        toast.error("Failed to update SMS settings");
    } finally {
        setLoadingSms(false);
    }
  };

  // --- IMAGE HANDLERS ---
  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCancelPreview = () => {
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setUploading(true);
    const imageFormData = new FormData();
    imageFormData.append('image', selectedImage);

    try {
      await axios.post('/profile/image', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Profile picture updated!");
      handleCancelPreview();
      window.location.reload(); 
    } catch (error) {
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // --- HELPER: GET INITIALS & IMAGE URL ---
  const getInitials = () => {
      const first = user?.firstName?.charAt(0).toUpperCase() || '';
      const last = user?.lastName?.charAt(0).toUpperCase() || '';
      return `${first}${last}`;
  };

  const getProfileImageUrl = () => {
    if (previewUrl) return previewUrl; 
    
    if (user?.profile_image) {
        let cleanPath = user.profile_image.replace('public/', '');
        if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
        if (!cleanPath.startsWith('/storage')) cleanPath = `/storage${cleanPath}`;
        return `http://127.0.0.1:8000${cleanPath}`;
    }
    return null; // Return null if no image exists so we show initials
  };

  const finalAvatarUrl = getProfileImageUrl();
  const initials = getInitials();

  // --- FORM HANDLER ---
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      await axios.post('/profile/household', formData);
      toast.success("Family details saved successfully!");
    } catch (error) {
      toast.error("Failed to save details.");
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20 mt-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
           <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Profile</h1>
           <p className="text-slate-500">Manage your personal information and household preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Profile & SMS */}
            <div className="space-y-6">
                
                {/* PROFILE CARD */}
                <Card className="p-6 bg-white border-t-4 border-sky-500 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative group mb-4">
                            
                            {/* --- UPDATED AVATAR LOGIC --- */}
                            {finalAvatarUrl ? (
                                <img 
                                    src={finalAvatarUrl} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-full border-4 border-sky-50 shadow-md object-cover bg-slate-100"
                                />
                            ) : (
                                // FALLBACK: Initials Circle
                                <div className="w-32 h-32 rounded-full border-4 border-sky-50 shadow-md bg-blue-600 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white tracking-widest">
                                        {initials}
                                    </span>
                                </div>
                            )}

                            <button 
                                onClick={handleImageClick}
                                className="absolute bottom-0 right-0 bg-sky-600 text-white p-2 rounded-full shadow-lg hover:bg-sky-700 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 capitalize">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-slate-500 text-sm mb-3">{user?.email}</p>
                        
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 mb-4">
                            <CheckCircle className="w-3 h-3" />
                            Verified Resident
                        </div>

                        {selectedImage && (
                            <div className="flex gap-2 w-full mt-2 animate-in fade-in zoom-in-95">
                                <Button 
                                    onClick={handleImageUpload} 
                                    disabled={uploading}
                                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-xs"
                                >
                                    {uploading ? 'Uploading...' : 'Save Photo'}
                                </Button>
                                <Button 
                                    onClick={handleCancelPreview} 
                                    variant="outline" 
                                    className="px-3"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* NOTIFICATION SETTINGS (SMS) - UPDATED VISIBILITY */}
                <Card 
                    className={`p-6 shadow-sm transition-all duration-300 ${
                        smsEnabled 
                        ? 'bg-blue-50 border-l-4 border-blue-600' // ON STATE: Blue BG & Border
                        : 'bg-white border-l-4 border-slate-200'   // OFF STATE: White BG & Gray Border
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${smsEnabled ? 'bg-white' : 'bg-slate-100'}`}>
                                <Bell className={`w-6 h-6 ${smsEnabled ? 'text-blue-600' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <h3 className={`font-bold ${smsEnabled ? 'text-blue-900' : 'text-slate-800'}`}>
                                    SMS Alerts
                                </h3>
                                <p className={`text-xs ${smsEnabled ? 'text-blue-700' : 'text-slate-500'} max-w-[150px]`}>
                                    {smsEnabled ? 'Enabled. You will receive emergency texts.' : 'Enable to receive alerts via text.'}
                                </p>
                            </div>
                        </div>
                        
                        {/* FIX: Added '!bg-blue-600' to force color override.
                           The !important flag ensures it beats any default shadcn styles.
                        */}
                        <Switch 
                            checked={smsEnabled} 
                            onCheckedChange={handleSmsToggle}
                            className={`data-[state=checked]:!bg-blue-600 ${smsEnabled ? '!bg-blue-600' : ''}`}
                        />
                    </div>
                </Card>

            </div>

            {/* RIGHT COLUMN: Household Form */}
            <div className="lg:col-span-2">
                <form onSubmit={handleSaveForm}>
                    <Card className="p-6 md:p-8 bg-white shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Home className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Household Details</h2>
                                <p className="text-sm text-slate-500">Address and family composition for emergency response.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Address Section */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" /> Location Info
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Street Name <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text"
                                            required
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                            placeholder="e.g. Makabayan St."
                                            value={formData.street_name}
                                            onChange={e => setFormData({...formData, street_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">House Number <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text"
                                            required
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                            placeholder="e.g. 123-A"
                                            value={formData.house_number}
                                            onChange={e => setFormData({...formData, house_number: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Emergency Contact <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="tel"
                                            required
                                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                            placeholder="09xxxxxxxxx"
                                            value={formData.contact_number}
                                            onChange={e => setFormData({...formData, contact_number: e.target.value})}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">This number will be used for SMS alerts if enabled.</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 my-2"></div>

                            {/* Composition Section */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-400" /> Family Composition
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-1">
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="w-16 bg-transparent text-center focus:outline-none border-b border-blue-200 focus:border-blue-500"
                                                value={formData.total_members}
                                                onChange={e => setFormData({...formData, total_members: parseInt(e.target.value) || 0})}
                                            />
                                        </div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Total Members</label>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <div className="text-3xl font-bold text-orange-500 mb-1">
                                            <input 
                                                type="number" 
                                                min="0"
                                                className="w-16 bg-transparent text-center focus:outline-none border-b border-orange-200 focus:border-orange-500"
                                                value={formData.count_seniors}
                                                onChange={e => setFormData({...formData, count_seniors: parseInt(e.target.value) || 0})}
                                            />
                                        </div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Seniors</label>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <div className="text-3xl font-bold text-purple-500 mb-1">
                                            <input 
                                                type="number" 
                                                min="0"
                                                className="w-16 bg-transparent text-center focus:outline-none border-b border-purple-200 focus:border-purple-500"
                                                value={formData.count_pwds}
                                                onChange={e => setFormData({...formData, count_pwds: parseInt(e.target.value) || 0})}
                                            />
                                        </div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">PWDs</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={loadingForm}
                                className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-6 h-auto text-lg font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                {loadingForm ? 'Saving...' : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" /> Save Details
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}