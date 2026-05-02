import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Calendar,
  MapPin,
  Car,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { fetchMyBookings } from '@/Services/bookings/bookings.services';

const stateToUiStatus = (bookingState) => {
  if (bookingState === 'COMPLETED') return 'completed';
  if (bookingState === 'CANCELLED') return 'cancelled';
  if (bookingState === 'SERVICE_IN_PROGRESS' || bookingState === 'INSPECTION_IN_PROGRESS' || bookingState === 'VENDOR_EN_ROUTE') {
    return 'in-progress';
  }
  return 'upcoming';
};

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

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};

export default function MyBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHistoryPage = location.pathname.startsWith('/history');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['myBookings'],
    queryFn: fetchMyBookings,
    staleTime: 15000,
  });

  const bookings = useMemo(() => {
    const rawBookings = data?.data?.bookings || [];

    return rawBookings.map((booking) => {
      const uiStatus = stateToUiStatus(booking.bookingState);
      const vendorName = booking?.vendorId?.shopName || booking?.vendorId?.fullname || 'Provider will be assigned';
      const location = booking?.serviceLocation?.serviceAddress?.formattedAddress
        || booking?.serviceLocation?.serviceAddress?.city
        || 'Location unavailable';
      const carInfo = [booking?.vehicleInfo?.brand, booking?.vehicleInfo?.model]
        .filter(Boolean)
        .join(' ') || booking?.vehicleInfo?.vehicleType || 'Vehicle details not set';

      const paidAmount = (booking?.payments?.service?.amount || 0) + (booking?.payments?.inspection?.amount || 0);

      return {
        id: booking._id,
        service: booking?.requestedServiceCategories?.join(', ') || 'General Service',
        provider: vendorName,
        date: booking?.createdAt,
        status: uiStatus,
        bookingState: booking?.bookingState,
        location,
        carInfo,
        price: paidAmount > 0 ? `INR ${paidAmount}` : 'Pending',
      };
    });
  }, [data]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.service.toLowerCase().includes(searchTerm.toLowerCase())
        || booking.provider.toLowerCase().includes(searchTerm.toLowerCase())
        || booking.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [bookings, filterStatus, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{isHistoryPage ? 'History' : 'My Bookings'}</h1>
              <p className="text-gray-600">
                {isHistoryPage
                  ? 'View past, completed, and cancelled bookings in one place'
                  : 'Track and manage all your service appointments'}
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by service, provider, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={filterStatus === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(filter.value)}
                    className={filterStatus === filter.value ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center text-gray-600">Loading your bookings...</CardContent>
          </Card>
        )}

        {isError && (
          <Card className="shadow-sm border-red-200">
            <CardContent className="p-8 text-center">
              <p className="text-red-600 font-medium">{error?.message || 'Could not load your bookings.'}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && filteredBookings.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'You have not created any bookings yet'}
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/home')}>
                Book a Service
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !isError && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
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
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{booking.bookingState}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{booking.price}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/booking/${booking.id}`)}>
                        View Details
                      </Button>
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
