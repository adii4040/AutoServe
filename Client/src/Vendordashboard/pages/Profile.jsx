import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Save, MapPin, Phone, Mail, Briefcase } from "lucide-react";

export default function VendorProfile() {
  const [isUploading, setIsUploading] = useState(false);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    shopName: "",
    shopAddress: "",
    personalAddress: "",
  });

  useEffect(() => {
    // Get vendor data from localStorage
    const storedVendor = localStorage.getItem('pendingVendor');
    console.log('Stored vendor from localStorage:', storedVendor);
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    if (storedVendor && storedVendor !== 'null') {
      try {
        const vendor = JSON.parse(storedVendor);
        console.log('Parsed vendor data:', vendor);
        setVendorInfo(vendor);
        
        // Populate form with vendor data - handle multiple possible structures
        setFormData({
          fullname: vendor.fullname || vendor.fullName || "",
          email: vendor.email || "",
          phone: vendor.phone || "",
          shopName: vendor.shopName || "",
          shopAddress: vendor.address?.shopAddress || vendor.shopAddress || "",
          personalAddress: vendor.address?.personalAddress || vendor.personalAddress || "",
        });
      } catch (error) {
        console.error('Error parsing vendor data:', error);
      }
    } else {
      console.log('No vendor data found in localStorage');
      console.log('Please register as a vendor first at /vendor-signup');
    }
  }, []);

  if (!vendorInfo) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No vendor data found. Please complete registration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your update logic here
    alert("Profile updated successfully!");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Add your file upload logic here
    setTimeout(() => {
      setIsUploading(false);
      alert("Avatar uploaded successfully!");
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Profile</h1>
        <p className="text-gray-600">Manage your business information and settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-none shadow-xl lg:col-span-1 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                  {formData.shopName ? formData.shopName.charAt(0).toUpperCase() : 'V'}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform border-4 border-white"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{formData.shopName || 'Vendor Shop'}</h3>
              <p className="text-sm text-indigo-600 font-medium mb-2">Service Provider</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
                <div className={`w-2 h-2 rounded-full animate-pulse ${vendorInfo?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm font-medium text-gray-700">{vendorInfo?.isVerified ? 'Verified Vendor' : 'Pending Verification'}</span>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-3 shadow-md">
                  <p className="text-2xl font-bold text-indigo-600">{vendorInfo?.rating || 'N/A'}</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-md">
                  <p className="text-2xl font-bold text-purple-600">{vendorInfo?.totalServices || 0}</p>
                  <p className="text-xs text-gray-600">Services</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="border-none shadow-xl lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-900">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="fullname" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Owner Full Name
                </label>
                <Input
                  id="fullname"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  placeholder="Enter owner's full name"
                  className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="shopName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  Business Name
                </label>
                <Input
                  id="shopName"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="Enter business name"
                  className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="h-12 bg-gray-50 border-gray-200"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="shopAddress" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Business Address
                </label>
                <Input
                  id="shopAddress"
                  value={formData.shopAddress}
                  onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                  placeholder="Enter business address"
                  className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="personalAddress" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Personal Address
                </label>
                <Input
                  id="personalAddress"
                  value={formData.personalAddress}
                  onChange={(e) => setFormData({ ...formData, personalAddress: e.target.value })}
                  placeholder="Enter personal address"
                  className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}