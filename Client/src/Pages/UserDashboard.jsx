import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Car, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  MapPin,
  Star,
  Sparkles,
  Zap,
  Shield,
  User,
  Mail,
  Phone,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

import { useFetchCurrentUser } from '../hooks/useFetchCurrentUser';

export default function UserDashboard() {
  // Mock data - replace with real data from API
    const { data: userData, loading, error, isError } = useFetchCurrentUser();



  const userInfo = userData?.data?.user

  console.log(userInfo)
  // const userData? = {
  //   name: user?.fullname ,
  //   email: user?.email,
  //   phone: user?.phone ,
  //   memberSince: 'January 2023',
  //   avatar: null // Set to null to show initials instead
  // };

  const stats = [
    {
      title: 'Total Bookings',
      value: '24',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Active Services',
      value: '3',
      icon: Clock,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50'
    },
    {
      title: 'Completed',
      value: '18',
      icon: CheckCircle2,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      title: 'Total Spent',
      value: '₹2,340',
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
  ];

  const recentBookings = [
    {
      id: 1,
      service: 'Oil Change & Filter',
      provider: 'QuickFix Auto',
      date: '2024-10-25',
      time: '10:00 AM',
      status: 'completed',
      price: '₹89',
      rating: 4.5,
      location: 'Downtown Service Center'
    },
    {
      id: 2,
      service: 'Brake Inspection',
      provider: 'AutoCare Pro',
      date: '2024-10-28',
      time: '2:00 PM',
      status: 'in-progress',
      price: '₹120',
      location: 'West Side Garage'
    },
    {
      id: 3,
      service: 'Full Car Diagnostic',
      provider: 'Expert Mechanics',
      date: '2024-10-30',
      time: '11:00 AM',
      status: 'upcoming',
      price: '₹150',
      location: 'East End Auto Shop'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  User Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Welcome back! Here's your service overview
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/home">
                <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                  <Zap className="w-4 h-4 mr-2" />
                  Book Service
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* User Information Section */}
        <Card className="shadow-lg border border-gray-200 overflow-hidden bg-white/80 backdrop-blur-sm">
          <div className="relative">
            {/* Profile Content */}
            <CardContent className="relative p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative w-24 h-24 rounded-2xl  flex items-center justify-center text-white text-3xl font-bold shadow-2xl ring-4 ring-white transform group-hover:scale-105 transition duration-300">
                    {userInfo?.avatar ? (
                      <img src={userInfo?.avatar?.url} alt={userInfo?.fullname} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <span>{userInfo?.fullname?.split(' ').map(n => n[0]).join('')}</span>
                    )}
                  </div>
                  {/* Status Badge */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {/* User Details */}
                <div className="pt-5 flex-1 w-full">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      {/* Name and Badge */}
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{userInfo?.fullname}</h2>
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-3 py-1">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          Premium
                        </Badge>
                      </div>
                      
                      {/* Member Info */}
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        Member since {userInfo?.createdAt?.split('T')[0]}
                      </p>
                      
                      {/* Contact Information Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Email</p>
                            <p className="text-sm text-gray-900 font-medium truncate">{userInfo?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Phone</p>
                            <p className="text-sm text-gray-900 font-medium">{userInfo?.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="pt-5 flex flex-col gap-2">
                      <Link to="/update-profile">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all w-full md:w-auto">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className={`bg-gradient-to-br ₹{stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ₹{stat.gradient} flex items-center justify-center shadow-md`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="shadow-xl border-0 rounded-t-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Recent Bookings
              </CardTitle>
              <Link to="/my-bookings">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="p-5 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{booking.service}</h3>
                        <Badge className={`₹{getStatusColor(booking.status)} font-semibold`}>
                          {booking.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          <span>{booking.provider}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.location}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{booking.price}</p>
                      {booking.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{booking.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Need a Service?</h3>
              <p className="text-blue-100 mb-6">Book your next car service in just a few clicks</p>
              <Link to="/home">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 w-full font-semibold">
                  Book Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Track Your Car</h3>
              <p className="text-purple-100 mb-6">Get real-time updates on your service status</p>
              <Link to="/my-bookings">
                <Button className="bg-white text-purple-600 hover:bg-purple-50 w-full font-semibold">
                  Track Service
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium Support</h3>
              <p className="text-green-100 mb-6">24/7 customer support for all your needs</p>
              <Link to="/profile">
                <Button className="bg-white text-green-600 hover:bg-green-50 w-full font-semibold">
                  Get Help
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
