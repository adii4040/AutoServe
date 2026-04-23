import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import BookingMap from '../components/BookingMap';
import PaymentCheckout from '../components/PaymentCheckout';
import { getBookingById, approveServices, cancelBooking } from '../Services/bookings.services';
import {
  joinBookingTracking,
  leaveBookingTracking,
  onLocationUpdate,
  onVendorArrived,
  offLocationUpdate,
} from '../Services/socket';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const { booking, vendors } = await getBookingById(bookingId);
      setBooking(booking);
      setVendors(vendors || []);
    } catch (err) {
      setError('Could not load booking.');
      console.error('Fetch booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  // Setup real-time socket listeners
  useEffect(() => {
    try {
      // Try to initialize socket (will fail gracefully if not installed)
      joinBookingTracking(bookingId);

      const handleLocationUpdate = (data) => {
        console.log('[Real-time] Location update:', data);
        setRealTimeData((prev) => ({
          ...prev,
          location: data.coordinates,
          distance: data.distance,
          eta: data.eta,
        }));
      };

      const handleVendorArrived = (data) => {
        console.log('[Real-time] Vendor arrived');
        toast({
          title: 'Vendor Arrived',
          description: 'Your service vendor has arrived at the location.',
        });
        // Refetch booking to update state
        fetchBooking();
      };

      onLocationUpdate(bookingId, handleLocationUpdate);
      onVendorArrived(bookingId, handleVendorArrived);

      // Cleanup
      return () => {
        leaveBookingTracking(bookingId);
        offLocationUpdate();
      };
    } catch (err) {
      // Socket.io not available, continue without real-time updates
      console.log('[Socket] Not available, using polling');
    }
  }, [bookingId]);

  const handleApproveServices = async () => {
    if (!booking?.diagnosis?.suggestedServices) {
      toast({
        title: 'No services to approve',
        description: 'Diagnosis information is missing.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      // For now, approve all services (indexes 0 to N-1)
      const allIndexes = booking.diagnosis.suggestedServices.map((_, idx) => idx);
      await approveServices(bookingId, allIndexes, []);

      toast({
        title: 'Services approved',
        description: 'You have approved the services. Proceeding to payment.',
      });

      // Refresh booking data
      await fetchBooking();
    } catch (err) {
      toast({
        title: 'Failed to approve services',
        description: err.message,
        variant: 'destructive',
      });
      console.error('Approve services error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectServices = async () => {
    toast({
      title: 'Service rejection not yet implemented',
      description: 'Please cancel the booking instead.',
      variant: 'destructive',
    });
  };

  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for cancellation.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      await cancelBooking(bookingId, cancellationReason);

      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been cancelled.',
      });

      setShowCancelForm(false);
      await fetchBooking();
    } catch (err) {
      toast({
        title: 'Failed to cancel booking',
        description: err.message,
        variant: 'destructive',
      });
      console.error('Cancel booking error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    toast({
      title: 'Payment completed',
      description: 'Your payment has been processed successfully.',
    });
    await fetchBooking();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  const bookingState = booking?.bookingState || booking?.status || 'N/A';
  const isWaitingForApproval = bookingState === 'WAITING_FOR_USER_APPROVAL';
  const isServiceInProgress = bookingState === 'SERVICE_IN_PROGRESS';
  const isCompleted = bookingState === 'COMPLETED';
  const isCancelled = bookingState === 'CANCELLED';
  const canCancel = !isCompleted && !isCancelled;
  const inspectionAmount = booking?.payments?.inspection?.amount || booking?.inspection?.amount || 0;
  const serviceAmount = booking?.payments?.service?.amount || booking?.service?.amount || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        className="mb-4 text-blue-600 hover:underline text-sm"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Booking Details</h1>

      {/* Real-time Status Indicator */}
      {realTimeData && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Real-time Update:</span> Vendor {realTimeData.distance ? `is ${realTimeData.distance}km away` : 'location being tracked'}
              {realTimeData.eta && ` • ETA: ${realTimeData.eta} mins`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Booking Info Card */}
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle>Booking Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Service:</span>
              <p className="text-gray-900">
                {Array.isArray(booking?.serviceCategory)
                  ? booking.serviceCategory.join(', ')
                  : booking?.requestedServiceCategories?.join(', ') || 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className="text-lg font-semibold text-blue-600 capitalize">{bookingState}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <p className="text-gray-900">
                {booking?.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Address:</span>
              <p className="text-gray-900">
                {booking?.serviceLocation?.serviceAddress?.formattedAddress ||
                  booking?.serviceLocation?.formattedAddress ||
                  'N/A'}
              </p>
            </div>
            {booking?.vendorId && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Assigned Vendor:</span>
                <p className="text-gray-900">
                  {booking.vendorId.shopName} ({booking.vendorId.fullname})
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis Card (if available) */}
      {booking?.diagnosis && (
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle>Diagnosis Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {booking.diagnosis.issues && (
              <div className="mb-4">
                <span className="font-medium text-gray-700">Issues Found:</span>
                <ul className="list-disc list-inside mt-2">
                  {booking.diagnosis.issues.map((issue, idx) => (
                    <li key={idx} className="text-gray-900">
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {booking.diagnosis.suggestedServices && booking.diagnosis.suggestedServices.length > 0 && (
              <div className="mb-4">
                <span className="font-medium text-gray-700">Suggested Services:</span>
                <div className="mt-2 space-y-2">
                  {booking.diagnosis.suggestedServices.map((service, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <p className="font-semibold text-gray-900">
                        {service.serviceName || service.customServiceName || 'Service'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ₹{service.quotedPrice || 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.diagnosis.inspectionFeeFinal && (
              <div>
                <span className="font-medium text-gray-700">Inspection Fee:</span>
                <p className="text-gray-900">₹{booking.diagnosis.inspectionFeeFinal}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Status Card */}
      {(inspectionAmount > 0 || serviceAmount > 0) && (
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {inspectionAmount > 0 && (
              <div className="mb-3 pb-3 border-b">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Inspection:</span>
                  <div className="text-right">
                    <p className="text-gray-900 font-semibold">₹{(inspectionAmount / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {booking?.payments?.inspection?.status || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {serviceAmount > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Service:</span>
                  <div className="text-right">
                    <p className="text-gray-900 font-semibold">₹{(serviceAmount / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {booking?.payments?.service?.status || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {/* Approve/Reject Services */}
            {isWaitingForApproval && (
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-700 mb-3">
                  Please review the diagnosis and approve or reject the suggested services.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleApproveServices}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Services
                  </Button>
                  <Button
                    onClick={handleRejectServices}
                    variant="outline"
                    disabled={actionLoading}
                  >
                    Reject Services
                  </Button>
                </div>
              </div>
            )}

            {/* Payment Button */}
            {isServiceInProgress && (
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-gray-700 mb-3">Service is in progress. Complete payment to finalize.</p>
                <div className="flex gap-2">
                  {inspectionAmount > 0 && booking?.payments?.inspection?.status !== 'PAID' && (
                    <PaymentCheckout
                      bookingId={bookingId}
                      paymentType="inspection"
                      amount={inspectionAmount}
                      userEmail={booking?.userId?.email}
                      userName={booking?.userId?.fullname}
                      userPhone={booking?.userId?.phone}
                      onPaymentSuccess={handlePaymentSuccess}
                      buttonLabel={`Pay Inspection ₹${(inspectionAmount / 100).toFixed(2)}`}
                      variant="default"
                    />
                  )}
                  {serviceAmount > 0 && booking?.payments?.service?.status !== 'PAID' && (
                    <PaymentCheckout
                      bookingId={bookingId}
                      paymentType="service"
                      amount={serviceAmount}
                      userEmail={booking?.userId?.email}
                      userName={booking?.userId?.fullname}
                      userPhone={booking?.userId?.phone}
                      onPaymentSuccess={handlePaymentSuccess}
                      buttonLabel={`Pay Service ₹${(serviceAmount / 100).toFixed(2)}`}
                      variant="default"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Cancel Booking */}
            {canCancel && (
              <div>
                {!showCancelForm ? (
                  <Button
                    onClick={() => setShowCancelForm(true)}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancel Booking
                  </Button>
                ) : (
                  <div className="p-4 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-gray-700 mb-2">Reason for cancellation:</p>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Please provide a reason..."
                      className="w-full p-2 border rounded text-sm mb-2"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancelBooking}
                        disabled={actionLoading || !cancellationReason.trim()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Confirm Cancellation
                      </Button>
                      <Button
                        onClick={() => {
                          setShowCancelForm(false);
                          setCancellationReason('');
                        }}
                        variant="outline"
                      >
                        Keep Booking
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isCompleted && (
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="text-gray-900 font-semibold">✓ Booking completed</p>
              </div>
            )}

            {isCancelled && (
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-900 font-semibold">✗ Booking cancelled</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Location & Nearby Vendors</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <BookingMap booking={booking} vendors={vendors} />
        </CardContent>
      </Card>
    </div>
  );
}
