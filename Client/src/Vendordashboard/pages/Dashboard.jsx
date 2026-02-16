import React, { useState, useEffect } from "react";
import { Calendar, DollarSign, Star, TrendingUp, Package, Clock, CheckCircle, ArrowUp, ArrowDown, Users, Wrench, ShoppingCart, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useRefreshVendor } from "../../hooks/useRefreshVendor";

export default function UserDashboard() {
  const [vendorInfo, setVendorInfo] = useState(null);
  const navigate = useNavigate();

  // Refresh vendor data periodically
  const { data: refreshedVendorData } = useRefreshVendor();

  useEffect(() => {
    // Get vendor data from localStorage
    const storedVendor = localStorage.getItem('pendingVendor');
    if (storedVendor) {
      setVendorInfo(JSON.parse(storedVendor));
    }
  }, []);

  // Update vendorInfo when refreshed data arrives
  useEffect(() => {
    if (refreshedVendorData?.data?.vendor) {
      setVendorInfo(refreshedVendorData.data.vendor);
    }
  }, [refreshedVendorData]);

  // Check if vendor is verified
  if (vendorInfo && !vendorInfo.isVerified) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Required</h2>
            <p className="text-gray-600 mb-6">
              Your account is pending physical verification by our team. You'll be able to access the dashboard once your account is verified.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/vendor/documents')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Verification Status
              </button>
              <button
                onClick={() => navigate('/vendor/profile')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit Profile
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Hard-coded dummy data
  const stats = {
    totalBookings: 127,
    pendingBookings: 8,
    completedBookings: 98,
    cancelledBookings: 21,
    revenue: 12450,
    avgRating: 4.8,
    growthRate: 23,
    activeUsers: 342,
    totalServices: 15
  };

  const recentBookings = [
    { 
      id: 1, 
      customer_name: "John Doe", 
      service_name: "Oil Change & Filter", 
      status: "pending", 
      preferred_date: "2025-10-28",
      preferred_time: "10:00 AM",
      price: 89 
    },
    { 
      id: 2, 
      customer_name: "Jane Smith", 
      service_name: "Brake Repair", 
      status: "in_progress", 
      preferred_date: "2025-10-27",
      preferred_time: "2:00 PM",
      price: 150 
    },
    { 
      id: 3, 
      customer_name: "Mike Johnson", 
      service_name: "Tire Rotation", 
      status: "completed", 
      preferred_date: "2025-10-26",
      preferred_time: "9:00 AM",
      price: 65 
    },
    { 
      id: 4, 
      customer_name: "Sarah Williams", 
      service_name: "Engine Diagnostic", 
      status: "completed", 
      preferred_date: "2025-10-25",
      preferred_time: "11:00 AM",
      price: 120 
    },
    { 
      id: 5, 
      customer_name: "Tom Brown", 
      service_name: "AC Service", 
      status: "pending", 
      preferred_date: "2025-10-29",
      preferred_time: "3:00 PM",
      price: 95 
    },
  ];

  // Monthly revenue data for the chart
  const monthlyData = [
    { month: 'Jan', revenue: 8500, bookings: 85 },
    { month: 'Feb', revenue: 9200, bookings: 92 },
    { month: 'Mar', revenue: 10100, bookings: 101 },
    { month: 'Apr', revenue: 9800, bookings: 98 },
    { month: 'May', revenue: 11200, bookings: 112 },
    { month: 'Jun', revenue: 12450, bookings: 127 },
  ];

  // Service distribution
  const serviceDistribution = [
    { name: 'Oil Change', count: 45, percentage: 35, color: 'bg-blue-500' },
    { name: 'Brake Repair', count: 30, percentage: 24, color: 'bg-green-500' },
    { name: 'Tire Service', count: 25, percentage: 20, color: 'bg-purple-500' },
    { name: 'Engine Work', count: 15, percentage: 12, color: 'bg-orange-500' },
    { name: 'Others', count: 12, percentage: 9, color: 'bg-pink-500' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome Back{vendorInfo?.shopName ? `, ${vendorInfo.shopName}` : ''}! 🎉
            </h1>
            <p className="text-indigo-100 text-lg">Here's what's happening with your services today</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-sm text-indigo-100">Today's Date</p>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className="text-xs text-gray-600 mt-1">All time bookings</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
                <p className="text-xs text-gray-600 mt-1">Awaiting confirmation</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedBookings}</p>
                <p className="text-xs text-gray-600 mt-1">Successfully done</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.revenue}</p>
                <p className="text-xs text-gray-600 mt-1">This month</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-pink-50 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 mb-1">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgRating}</p>
                <p className="text-xs text-gray-600 mt-1">Out of 5.0</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Growth</p>
                <p className="text-3xl font-bold text-gray-900">+{stats.growthRate}%</p>
                <p className="text-xs text-gray-600 mt-1">vs last month</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {booking.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{booking.customer_name}</p>
                    <p className="text-sm text-gray-600">{booking.service_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">${booking.price}</p>
                    <p className="text-xs text-gray-500">{booking.preferred_date}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart & Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {monthlyData.map((data, index) => {
                const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
                const barWidth = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{data.month}</span>
                      <span className="text-sm font-bold text-indigo-600">${data.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{data.bookings} bookings</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Total Growth</span>
                </div>
                <span className="text-2xl font-bold text-green-600">+{stats.growthRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-600" />
              Service Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {serviceDistribution.map((service, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${service.color}`}></div>
                      <span className="text-sm font-semibold text-gray-700">{service.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{service.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`${service.color} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{service.percentage}% of total</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-xs text-gray-600">Active Users</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl text-center">
                <ShoppingCart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                <p className="text-xs text-gray-600">Total Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Success Rate</p>
                <p className="text-4xl font-bold">82%</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-sm">+5% from last week</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Avg Response Time</p>
                <p className="text-4xl font-bold">2.5h</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-sm">-30 min improvement</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Customer Satisfaction</p>
                <p className="text-4xl font-bold">96%</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-white" />
                  <span className="text-sm">Excellent rating</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Star className="w-8 h-8 fill-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}