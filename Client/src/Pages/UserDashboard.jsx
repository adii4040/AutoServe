import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Mail,
  Phone,
  Edit,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useFetchCurrentUser } from '../hooks/useFetchCurrentUser';
import { fetchMyBookings } from '@/Services/bookings/bookings.services';

const toUiStatus = (bookingState) => {
  if (bookingState === 'COMPLETED') return 'completed';
  if (bookingState === 'CANCELLED') return 'cancelled';
  if (bookingState === 'SERVICE_IN_PROGRESS' || bookingState === 'INSPECTION_IN_PROGRESS' || bookingState === 'VENDOR_EN_ROUTE') {
    return 'in-progress';
  }
  return 'upcoming';
};

const statusColorMap = {
  completed: 'bg-green-100 text-green-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  upcoming: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function UserDashboard() {
  const { data: userData, isLoading: userLoading } = useFetchCurrentUser();
  const userInfo = userData?.data?.user;

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: fetchMyBookings,
    staleTime: 15000,
  });

  const bookings = bookingsData?.data?.bookings || [];

  const derived = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.bookingState === 'COMPLETED').length;
    const active = bookings.filter((b) => toUiStatus(b.bookingState) === 'in-progress').length;
    const paid = bookings.reduce((sum, b) => {
      const amount = (b?.payments?.service?.amount || 0) + (b?.payments?.inspection?.amount || 0);
      return sum + amount;
    }, 0);

    const recent = bookings.slice(0, 3).map((booking) => ({
      id: booking._id,
      service: booking?.requestedServiceCategories?.join(', ') || 'General Service',
      provider: booking?.vendorId?.shopName || booking?.vendorId?.fullname || 'Provider will be assigned',
      date: new Date(booking.createdAt).toLocaleDateString(),
      status: toUiStatus(booking.bookingState),
      price: (booking?.payments?.service?.amount || 0) + (booking?.payments?.inspection?.amount || 0),
      location: booking?.serviceLocation?.serviceAddress?.formattedAddress
        || booking?.serviceLocation?.serviceAddress?.city
        || 'Location unavailable',
    }));

    return { total, completed, active, paid, recent };
  }, [bookings]);

  const stats = [
    {
      title: 'Total Bookings',
      value: String(derived.total),
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      title: 'Active Services',
      value: String(derived.active),
      icon: Clock,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
    },
    {
      title: 'Completed',
      value: String(derived.completed),
      icon: CheckCircle2,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      title: 'Total Paid',
      value: `INR ${derived.paid}`,
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
    },
  ];

  const initials = userInfo?.fullname
    ? userInfo.fullname.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const memberSince = userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : '-';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
                  Welcome back! Here is your service overview
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/my-bookings">
                <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                  <Zap className="w-4 h-4 mr-2" />
                  View Bookings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border border-gray-200 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="relative p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
                <div className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl ring-4 ring-white bg-gradient-to-br from-blue-500 to-indigo-600">
                  {userInfo?.avatar?.url ? (
                    <img src={userInfo.avatar.url} alt={userInfo.fullname} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="pt-5 flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{userInfo?.fullname || 'User'}</h2>
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-3 py-1">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Member
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      Member since {memberSince}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Email</p>
                          <p className="text-sm text-gray-900 font-medium truncate">{userInfo?.email || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Phone</p>
                          <p className="text-sm text-gray-900 font-medium">{userInfo?.phone || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

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
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
            {(userLoading || bookingsLoading) && (
              <p className="text-gray-600">Loading dashboard data...</p>
            )}

            {!userLoading && !bookingsLoading && derived.recent.length === 0 && (
              <p className="text-gray-600">No bookings yet. Your recent activity will appear here.</p>
            )}

            <div className="space-y-4">
              {derived.recent.map((booking) => (
                <div key={booking.id} className="p-5 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{booking.service}</h3>
                        <Badge className={`${statusColorMap[booking.status]} font-semibold`}>
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
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {booking.price > 0 ? `INR ${booking.price}` : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link to="/my-bookings">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
