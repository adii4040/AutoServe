import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Car, 
  Clock,
  Filter,
  ArrowRight,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function MyBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with real API data
  const bookings = [
    {
      id: 1,
      service: 'Oil Change & Filter Replacement',
      provider: 'QuickFix Auto Service',
      providerAvatar: 'QF',
      date: '2024-10-25',
      time: '10:00 AM',
      status: 'completed',
      price: '$89.99',
      location: 'Downtown Service Center, 123 Main St',
      rating: 4.5,
      carInfo: 'Toyota Camry 2020'
    },
    {
      id: 2,
      service: 'Brake Inspection & Repair',
      provider: 'AutoCare Pro',
      providerAvatar: 'AP',
      date: '2024-10-28',
      time: '2:00 PM',
      status: 'in-progress',
      price: '$120.00',
      location: 'West Side Garage, 456 Oak Ave',
      carInfo: 'Honda Accord 2019'
    },
    {
      id: 3,
      service: 'Full Car Diagnostic',
      provider: 'Expert Mechanics',
      providerAvatar: 'EM',
      date: '2024-10-30',
      time: '11:00 AM',
      status: 'upcoming',
      price: '$150.00',
      location: 'East End Auto Shop, 789 Elm Rd',
      carInfo: 'Ford F-150 2021'
    },
    {
      id: 4,
      service: 'Tire Rotation & Alignment',
      provider: 'Speedy Auto Repair',
      providerAvatar: 'SA',
      date: '2024-10-22',
      time: '3:00 PM',
      status: 'completed',
      price: '$75.00',
      location: 'North Plaza Service, 321 Pine St',
      rating: 5.0,
      carInfo: 'Chevrolet Silverado 2018'
    },
    {
      id: 5,
      service: 'Air Conditioning Service',
      provider: 'CoolCar Solutions',
      providerAvatar: 'CC',
      date: '2024-10-20',
      time: '1:00 PM',
      status: 'cancelled',
      price: '$95.00',
      location: 'South Bay Auto Center, 654 Maple Dr',
      carInfo: 'Nissan Altima 2022'
    },
  ];

  const statusFilters = [
    { value: 'all', label: 'All Bookings' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'upcoming':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600">Track and manage all your service appointments</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by service or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={filterStatus === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(filter.value)}
                    className={filterStatus === filter.value ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'You haven\'t made any bookings yet'}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Book a Service
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Provider Avatar */}
                    <div className="flex items-center lg:items-start">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {booking.providerAvatar}
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{booking.service}</h3>
                          <p className="text-gray-600">{booking.provider}</p>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.replace('-', ' ')}
                        </Badge>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Car className="w-4 h-4" />
                          <span>{booking.carInfo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time}</span>
                        </div>
                      </div>

                      {booking.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(booking.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{booking.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{booking.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {booking.status === 'upcoming' && (
                          <Button size="sm" variant="destructive">
                            Cancel
                          </Button>
                        )}
                        {booking.status === 'completed' && !booking.rating && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Rate Service
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
