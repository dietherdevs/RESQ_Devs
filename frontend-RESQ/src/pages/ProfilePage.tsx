import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { User, Home, Save, Phone, Camera, CheckCircle, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user } = useAuth(); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // STATE FOR IMAGE UPLOAD
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
  }, []);

  // Clean up preview URL to avoid memory leaks
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
      }
    } catch (error) {
      // Normal for new users
    }
  };

  // --- IMAGE HANDLERS ---
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

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
      console.error(error);
      toast.error("Failed to upload image. Max size 4MB.");
    } finally {
      setUploading(false);
    }
  };


  // --- FORM HANDLER ---
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      await axios.post('/profile/household', formData);
      toast.success("Family details saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save details.");
    } finally {
      setLoadingForm(false);
    }
  };

  // UPDATED: Changed default size to 64 to match the smaller image dimensions
  const finalAvatarUrl = previewUrl 
    || (user?.profile_image ? `http://localhost:8000${user.profile_image}` : null)
    || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=2563eb&color=fff&size=64`;


  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="md:flex md:items-center md:justify-between mt-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-500 mt-1">Manage your personal information and household registration.</p>
          </div>
        </div>

        {/* SECTION 1: PERSONAL IDENTITY CARD */}
        <Card className="p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-blue-400 opacity-10"></div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
                
                {/* ----- PROFILE PICTURE SECTION ----- */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        {/* EDITED: Changed from w-24 h-24 to w-16 h-16 (64px) */}
                        {/* Also reduced border width from border-4 to border-2 for better proportion */}
                        <img 
                            src={finalAvatarUrl} 
                            alt="Profile" 
                            className="w-16 h-16 rounded-full border-2 border-white shadow-xl object-cover bg-slate-100"
                        />
                        
                        <button 
                            onClick={handleImageClick}
                            type="button"
                            className="absolute bottom-0 right-0 bg-slate-800 text-white p-1.5 rounded-full shadow-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Camera className="w-3.5 h-3.5" />
                        </button>

                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                        />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full shadow-sm">
                        <CheckCircle className="w-4 h-4" />
                        Verified Resident
                    </div>
                </div>

                {/* ----- USER DETAILS SECTION ----- */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h2>
                         <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-md uppercase font-bold mt-2 tracking-wider">
                            {user?.role} Role
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{user?.email || 'No email linked'}</span>
                        </div>
                    </div>

                    {selectedImage && (
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={handleImageUpload}
                                disabled={uploading}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                {uploading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload New Picture</>}
                            </button>
                            <button
                                onClick={handleCancelPreview}
                                disabled={uploading}
                                className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Card>

        {/* SECTION 2: HOUSEHOLD FORM */}
        <form onSubmit={handleSaveForm}>
            <Card className="p-6 md:p-8 shadow-md border-t-4 border-blue-500">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
                    <div className="p-3 bg-blue-50 rounded-full shadow-sm">
                        <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Household Registration</h2>
                        <p className="text-sm text-slate-500 leading-relaxed">This critical information is used by rescuers to locate and assist your family during emergencies.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-slate-700">Street Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text"
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                placeholder="e.g. Makabayan St."
                                value={formData.street_name}
                                onChange={e => setFormData({...formData, street_name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-slate-700">House Number <span className="text-red-500">*</span></label>
                            <input 
                                type="text"
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                                placeholder="e.g. 123-A"
                                value={formData.house_number}
                                onChange={e => setFormData({...formData, house_number: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Emergency Contact Number <span className="text-red-500">*</span></label>
                        <div className="relative shadow-sm rounded-lg">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-slate-400" />
                            </div>
                            <input 
                                type="tel"
                                required
                                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="09xxxxxxxxx"
                                value={formData.contact_number}
                                onChange={e => setFormData({...formData, contact_number: e.target.value})}
                            />
                        </div>
                         <p className="text-xs text-slate-500 mt-1">We will call this number in case of evacuation alerts.</p>
                    </div>

                    <div className="md:col-span-2 border-t border-slate-100 my-4"></div>

                    <div className="md:col-span-2">
                         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            Family Composition
                          </h3>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Total Individuals Living Here</label>
                        <input 
                            type="number"
                            min="1"
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition shadow-sm text-lg font-semibold text-slate-900"
                            value={formData.total_members}
                            onChange={e => setFormData({...formData, total_members: parseInt(e.target.value) || 0})}
                        />
                    </div>
                    
                    <div className="hidden md:block"></div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">Number of Senior Citizens</label>
                        <input 
                            type="number"
                            min="0"
                            className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                            value={formData.count_seniors}
                            onChange={e => setFormData({...formData, count_seniors: parseInt(e.target.value) || 0})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">Number of PWDs</label>
                        <input 
                            type="number"
                            min="0"
                            className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                            value={formData.count_pwds}
                            onChange={e => setFormData({...formData, count_pwds: parseInt(e.target.value) || 0})}
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <button 
                        type="submit" 
                        disabled={loadingForm}
                        className={`w-full md:w-auto md:px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3
                            ${loadingForm ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'}
                        `}
                    >
                        {loadingForm ? 'Saving Information...' : (
                            <>
                                <Save className="w-6 h-6" />
                                Save Household Details
                            </>
                        )}
                    </button>
                </div>
            </Card>
        </form>

      </div>
    </div>
  );
}