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
      <div className="bookings-container">
        <h1>Requested Bookings</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p className="error">{error?.message || "Failed to load requested bookings."}</p>
          ) : bookings && bookings.length === 0 ? (
              <div>
                <p style={{ marginBottom: 16 }}>You have no requested booking(s).</p>
              </div>
        ) : (
          <div className="requested-bookings-cards"> {
            bookings.map((booking) => (
              <div key={booking.bookingId} className="booking-card" style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16, boxShadow: '0 2px 8px #0001' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Service:</strong> {booking.requestedServiceCategories?.join(', ')}<br />
                    <strong>Customer:</strong> {booking.user?.fullname} <span style={{ fontSize: '0.9em', color: '#888' }}>({booking.user?.phone})</span><br />
                    <strong>Distance:</strong> {booking.distanceKm !== null && booking.distanceKm !== undefined ? booking.distanceKm + ' km' : '-'}<br />
                    <strong>Problem:</strong> {booking.problemDescription || '-'}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: 8 }}>
                      <strong>Timer: </strong>
                      {timers[booking.bookingId] > 0 ? (
                        <span style={{ color: timers[booking.bookingId] <= 5 ? 'red' : 'black' }}>{timers[booking.bookingId]}s</span>
                      ) : (
                        <span style={{ color: 'gray' }}>Expired</span>
                      )}
                    </div>
                    <button
                      disabled={timers[booking.bookingId] <= 0 || processing.id === booking.bookingId}
                      style={{ marginRight: 8 }}
                      onClick={() => handleAccept(booking.bookingId)}
                    >
                      {processing.id === booking.bookingId && processing.action === 'accept' ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      disabled={timers[booking.bookingId] <= 0 || processing.id === booking.bookingId}
                      onClick={() => handleReject(booking.bookingId)}
                    >
                      {processing.id === booking.bookingId && processing.action === 'reject' ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
          </div>
        )}
      </div>
    </Layout>
  );
}

export default RequestedBookings;
