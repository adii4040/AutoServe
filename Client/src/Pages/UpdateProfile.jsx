import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save,
  Car,
  Calendar,
  Award,
  Settings
} from 'lucide-react';
import { useFetchCurrentUser } from '@/hooks/useFetchCurrentUser';
import { updateCurrentUser } from '@/Services/auth/User.services';
import { toast } from '@/components/ui/use-toast';

export default function UpdateProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  // Bootstrap current user to prefill form
  const { data, isLoading, error, refetch } = useFetchCurrentUser();
  const currentUser = data?.data?.user;

  const [profileData, setProfileData] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    totalBookings: '24',
    membershipLevel: 'Gold Member'
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData((prev) => ({
        ...prev,
        fullname: currentUser.fullname || '',
        email: currentUser.email || '',
        phone: currentUser.phone ? String(currentUser.phone) : '',
        address: currentUser.address || '',
        joinDate: currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : prev.joinDate,
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!currentUser?._id) return;

    try {
      const formData = new FormData();
      // Server validator expects address, include it even if unchanged
      formData.append('address', profileData.address || '');
      if (profileData.fullname) formData.append('fullname', profileData.fullname);
      const emailChanged = profileData.email && profileData.email !== currentUser.email;
      if (emailChanged) formData.append('email', profileData.email);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await updateCurrentUser(currentUser._id, formData);
      toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
      if (emailChanged) {
        toast({
          title: 'Verification email sent',
          description: `We sent a verification link to ${profileData.email}. Please verify your new email.`,
        });
      }
      setIsEditing(false);
      setAvatarFile(null);
      // Refresh current user info
      refetch();
    } catch (err) {
      toast({ title: 'Update failed', description: err.message || 'Could not update profile.', variant: 'destructive' });
      console.error('Update profile error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Avatar Section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {currentUser?.avatar?.url ? (
                    <img src={currentUser.avatar.url} alt={profileData.fullname} className="w-full h-full object-cover" />
                  ) : (
                    profileData.fullname.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setAvatarFile(f);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 shadow-lg"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="fullname"
                      value={profileData.fullname}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleChange}
                      disabled={true}
                      className="pl-10 bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Phone number cannot be changed.</p>
                  </div>
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={profileData.joinDate}
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{profileData.totalBookings}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
                  <p className="text-2xl font-bold text-gray-900">{profileData.joinDate}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Membership</p>
                  <p className="text-xl font-bold text-gray-900">{profileData.membershipLevel}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
