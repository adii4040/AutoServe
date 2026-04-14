import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingMap from '../components/BookingMap';
import { getBookingById } from '../Services/bookings.services';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      setError(null);
      try {
        const { booking, vendors } = await getBookingById(bookingId);
        setBooking(booking);
        setVendors(vendors || []);
      } catch (err) {
        setError('Could not load booking.');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  // Always show the map, even if booking is missing or incomplete

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        className="mb-4 text-blue-600 hover:underline text-sm"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-2">Booking Details</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-6 border border-gray-100">
        <div className="mb-2">
          <span className="font-medium">Service:</span> {Array.isArray(booking.serviceCategory) ? booking.serviceCategory[0] : (booking.requestedServiceCategories ? booking.requestedServiceCategories[0] : 'N/A')}
        </div>
        <div className="mb-2">
          <span className="font-medium">Date:</span> {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
        </div>
        <div className="mb-2">
          <span className="font-medium">Status:</span> <span className="capitalize text-blue-600 font-semibold">{booking.bookingState || booking.status || 'N/A'}</span>
        </div>
        <div className="mb-2">
          <span className="font-medium">Address:</span> {booking.serviceLocation?.serviceAddress?.formattedAddress || booking.serviceLocation?.formattedAddress || 'N/A'}
        </div>
        {booking.vendorId && (
          <div className="mb-2">
            <span className="font-medium">Assigned Vendor:</span> {booking.vendorId.shopName} ({booking.vendorId.fullname})
          </div>
        )}
        {booking.diagnosis && (
          <div className="mb-2">
            <span className="font-medium">Diagnosis:</span> {typeof booking.diagnosis === 'object' ? JSON.stringify(booking.diagnosis) : booking.diagnosis}
          </div>
        )}
        {booking.notes && (
          <div className="mb-2">
            <span className="font-medium">Notes:</span> {booking.notes}
          </div>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-2">Service Location & Vendors</h2>
      <BookingMap booking={booking} vendors={vendors} />
    </div>
  );
}
