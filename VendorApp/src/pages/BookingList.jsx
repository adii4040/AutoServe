import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import OngoingBookingsList from '../components/OngoingBookingsList';

const allowedVendorTransitions = {
  VENDOR_ASSIGNED: ['VENDOR_EN_ROUTE'],
  VENDOR_EN_ROUTE: ['INSPECTION_IN_PROGRESS'],
  INSPECTION_IN_PROGRESS: ['WAITING_FOR_USER_APPROVAL'],
  WAITING_FOR_USER_APPROVAL: [],
  SERVICE_IN_PROGRESS: ['COMPLETED'],
};

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/bookings/vendor/my-bookings', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setBookings(data?.data?.bookings || []))
      .catch(() => setError('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const getAllowedNextStates = (currentState) =>
    allowedVendorTransitions[currentState] || [];

  const handleStateChange = async (bookingId, newState) => {
    setProcessing((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ state: newState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update state');
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, status: newState } : b
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to update booking state');
    } finally {
      setProcessing((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const customer = booking.user?.fullname || '';
    const service = booking.requestedServiceCategories?.join(', ') || '';
    return (
      customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Ongoing Bookings</h1>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-16">Loading bookings...</p>
        ) : error ? (
          <p className="text-sm text-red-400 text-center py-16">{error}</p>
        ) : (
          <OngoingBookingsList
            bookings={filteredBookings}
            processing={processing}
            getAllowedNextStates={getAllowedNextStates}
            onStateChange={handleStateChange}
          />
        )}
      </div>
    </Layout>
  );
}