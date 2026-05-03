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
        <div className="app-hero">
          <div className="z-10">
            <span className="inline-block mb-4 px-3 py-1 bg-amber-600/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
              Dispatch Center
            </span>
            <h1 className="page-title">Service Requests</h1>
            <p className="page-subtitle">Real-time incoming requests. Accept or decline assignments to optimize your shop's schedule.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-panel" data-variant="loading">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <div className="state-title">Loading requests</div>
              <div className="state-copy">Checking for incoming customer bookings.</div>
            </div>
          </div>
        ) : isError ? (
          <div className="state-panel" data-variant="error" role="alert">
            <div>
              <div className="state-title">Connection error</div>
              <div className="state-copy">{error?.message || 'Failed to load requested bookings.'}</div>
            </div>
          </div>
        ) : bookings && bookings.length === 0 ? (
          <div className="empty-state surface-panel">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
             </div>
            <h3>No requests right now</h3>
            <p>New booking requests will appear here as soon as they are assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const remaining = timers[booking.bookingId] || 0;
              const isExpired = remaining <= 0;
              const isProcessing = processing.id === booking.bookingId;
              const timerColor = remaining <= 5 ? 'chip-error' : remaining <= 10 ? 'chip-warning' : 'chip-primary';

              return (
                <article key={booking.bookingId} className="metric-card !p-0 overflow-hidden flex flex-col group">
                   <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col">
                           <h4 className="text-lg font-bold text-gray-900 mb-1">{booking.requestedServiceCategories?.join(', ') || 'Service Request'}</h4>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-600">{booking.user?.fullname || 'Customer'}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="text-sm font-medium text-blue-600">{booking.distanceKm != null ? `${booking.distanceKm} km away` : 'Distance unknown'}</span>
                           </div>
                        </div>
                        <div className={`chip ${timerColor} !px-3 !py-1 !text-xs font-black animate-pulse`}>
                          {isExpired ? 'EXPIRED' : `${remaining}S`}
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 mb-6">
                         <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-2">Customer Reported Problem</span>
                         <p className="text-sm text-gray-700 italic">"{booking.problemDescription || 'No description provided.'}"</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          className="btn-ghost flex-1 py-3 text-sm"
                          disabled={isExpired || isProcessing}
                          onClick={() => handleReject(booking.bookingId)}
                        >
                          {isProcessing && processing.action === 'reject' ? '...' : 'Reject'}
                        </button>
                        <button
                          className="btn-primary flex-1 py-3 text-sm"
                          disabled={isExpired || isProcessing}
                          onClick={() => handleAccept(booking.bookingId)}
                        >
                          {isProcessing && processing.action === 'accept' ? '...' : 'Accept Request'}
                        </button>
                      </div>
                   </div>
                   <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        Respond now to avoid expiration
                      </p>
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
