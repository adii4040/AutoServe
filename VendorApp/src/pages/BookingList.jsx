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
      <div className="page-shell">
        <div className="page-header app-hero">
          <div>
            <div className="chip" data-tone="primary">Active queue</div>
            <h1 className="page-title" style={{ marginTop: 12 }}>Ongoing bookings</h1>
            <p className="page-subtitle">Track jobs in motion, filter by customer or service, and advance booking states with clearer feedback.</p>
          </div>
        </div>

        {loading ? (
          <div className="state-panel" data-variant="loading">
            <div>
              <div className="state-title">Loading bookings</div>
              <div className="state-copy">Pulling your active queue and workflow states.</div>
            </div>
          </div>
        ) : error ? (
          <div className="state-panel" data-variant="error" role="alert">
            <div>
              <div className="state-title">Could not load bookings</div>
              <div className="state-copy">{error}</div>
            </div>
          </div>
        ) : (
          <div className="page-shell">
            <div className="card surface-panel" style={{ display: 'grid', gap: 12 }}>
              <div className="field">
                <label className="field-label" htmlFor="booking-search">Search bookings</label>
                <input
                  id="booking-search"
                  type="search"
                  placeholder="Search by customer or service"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <p className="helper-text">
                Showing {filteredBookings.length} of {bookings.length} bookings.
              </p>
            </div>

            <OngoingBookingsList
              bookings={filteredBookings}
              processing={processing}
              getAllowedNextStates={getAllowedNextStates}
              onStateChange={handleStateChange}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}