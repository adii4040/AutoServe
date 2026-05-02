import Layout from '../components/Layout';
import '../styles/bookings.css';
import { useFetchVendorRequestedBookings } from '../hooks/useFetchVendorTabs';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { acceptVendorBooking, rejectVendorBooking } from '../services/auth';

function RequestedBookings() {
  const queryClient = useQueryClient();
  const { data: requestedData, isLoading, isError, error, refetch } = useFetchVendorRequestedBookings();
  const [timers, setTimers] = useState({});
  const [processing, setProcessing] = useState({ id: null, action: null }); // { id: bookingId, action: 'accept' | 'reject' }
  // console.log(requestedData?.data?.bookings, 'REQUESSTTT')
  const bookings = requestedData?.data?.bookings || [];
  // useEffect(() => {
  //   console.log('Requested bookings:', bookings);
  // }, [bookings]);

  useEffect(() => {
    if (!bookings.length) return;
    setTimers(prevTimers => {
      const newTimers = { ...prevTimers };
      bookings.forEach(b => {
        if (!newTimers[b.bookingId]) {
          newTimers[b.bookingId] = 20;
        }
      });
      // Remove timers for bookings that no longer exist
      Object.keys(newTimers).forEach(id => {
        if (!bookings.find(b => b.bookingId === id)) {
          delete newTimers[id];
        }
      });
      return newTimers;
    });
  }, [bookings]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(id => {
          if (updated[id] > 0) updated[id] -= 1;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  // Accept booking handler

  const handleAccept = async (bookingId) => {
    setProcessing({ id: bookingId, action: 'accept' });
    setTimers(prev => ({ ...prev, [bookingId]: 0 })); // Stop timer immediately
    try {
      await acceptVendorBooking(bookingId);
      refetch();
      queryClient.invalidateQueries(["vendorOngoingBookings"]);
    } catch (err) {
      alert(err.message || 'Failed to accept booking');
    } finally {
      setProcessing({ id: null, action: null });
    }
  };

  // Reject booking handler
  const handleReject = async (bookingId) => {
    setProcessing({ id: bookingId, action: 'reject' });
    setTimers(prev => ({ ...prev, [bookingId]: 0 })); // Stop timer immediately
    try {
      await rejectVendorBooking(bookingId);
      refetch();
    } catch (err) {
      alert(err.message || 'Failed to reject booking');
    } finally {
      setProcessing({ id: null, action: null });
    }
  };

  return (
    <Layout>
      <div className="page-shell">
        <div className="page-header app-hero">
          <div>
            <div className="chip" data-tone="warning">Incoming requests</div>
            <h1 className="page-title" style={{ marginTop: 12 }}>Requested bookings</h1>
            <p className="page-subtitle">Review new booking requests, respond before the timer expires, and keep your live queue moving.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-panel" data-variant="loading">
            <div>
              <div className="state-title">Loading requested bookings</div>
              <div className="state-copy">Checking for the latest customer requests.</div>
            </div>
          </div>
        ) : isError ? (
          <div className="state-panel" data-variant="error" role="alert">
            <div>
              <div className="state-title">Could not load requests</div>
              <div className="state-copy">{error?.message || 'Failed to load requested bookings.'}</div>
            </div>
          </div>
        ) : bookings && bookings.length === 0 ? (
          <div className="empty-state surface-panel">
            <h3>No requested bookings</h3>
            <p>You have no pending customer requests right now. New requests will appear here as soon as they are assigned.</p>
          </div>
        ) : (
          <div className="form-grid">
            {bookings.map((booking) => {
              const remaining = timers[booking.bookingId] || 0;
              const isExpired = remaining <= 0;
              const isProcessing = processing.id === booking.bookingId;

              return (
                <article key={booking.bookingId} className="card surface-panel">
                  <div className="page-header" style={{ alignItems: 'center' }}>
                    <div>
                      <div className="section-title">{booking.requestedServiceCategories?.join(', ') || 'Requested service'}</div>
                      <p className="helper-text">
                        {booking.user?.fullname || 'Unknown customer'} {booking.user?.phone ? `• ${booking.user.phone}` : ''}
                      </p>
                    </div>
                    <div className="chip" data-tone={isExpired ? 'danger' : remaining <= 5 ? 'warning' : 'primary'}>
                      {isExpired ? 'Expired' : `${remaining}s remaining`}
                    </div>
                  </div>

                  <div className="section-divider" />

                  <div className="form-grid two-col">
                    <div>
                      <div className="field-label">Customer</div>
                      <div className="helper-text">{booking.user?.fullname || '-'}</div>
                    </div>
                    <div>
                      <div className="field-label">Distance</div>
                      <div className="helper-text">{booking.distanceKm != null ? `${booking.distanceKm} km` : '-'}</div>
                    </div>
                    <div className="field">
                      <div className="field-label">Problem</div>
                      <div className="helper-text">{booking.problemDescription || 'No description provided.'}</div>
                    </div>
                    <div className="field">
                      <div className="field-label">Request timer</div>
                      <div className="helper-text">Respond before the booking expires to keep the request active.</div>
                    </div>
                  </div>

                  <div className="section-divider" style={{ marginTop: 18 }} />

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      className="btn-secondary"
                      disabled={isExpired || isProcessing}
                      onClick={() => handleReject(booking.bookingId)}
                    >
                      {isProcessing && processing.action === 'reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button
                      className="btn-primary"
                      disabled={isExpired || isProcessing}
                      onClick={() => handleAccept(booking.bookingId)}
                    >
                      {isProcessing && processing.action === 'accept' ? 'Accepting...' : 'Accept'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default RequestedBookings;
