import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import InspectionForm from '../components/InspectionForm';
import { useLocationTracking } from '../hooks/useLocationTracking';

const stateActions = {
  VENDOR_ASSIGNED: { label: 'Start Journey', next: 'VENDOR_EN_ROUTE' },
  VENDOR_EN_ROUTE: { label: 'Mark Arrived', next: 'INSPECTION_IN_PROGRESS' },
  SERVICE_IN_PROGRESS: { label: 'Mark as Completed', next: 'COMPLETED' },
};

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Start location tracking when vendor is en-route
  const isEnRoute = booking?.bookingState === 'VENDOR_EN_ROUTE' || booking?.state === 'VENDOR_EN_ROUTE';
  const { lastLocation, isTracking } = useLocationTracking(bookingId, isEnRoute);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/bookings/vendor/${bookingId}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setBooking(data?.data?.booking || null))
      .catch(() => setError('Failed to load booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleStateAction = async (nextState) => {
    setProcessing(true);
    try {
      let endpoint = '';
      let method = 'PATCH';
      let body = {};
      
      // Map nextState to correct endpoint
      switch (nextState) {
        case 'VENDOR_EN_ROUTE':
          endpoint = `/api/v1/bookings/${bookingId}/en-route`;
          break;
        case 'INSPECTION_IN_PROGRESS':
          endpoint = `/api/v1/bookings/${bookingId}/arrived`;
          break;
        case 'COMPLETED':
          endpoint = `/api/v1/bookings/${bookingId}/complete`;
          method = 'POST';
          body = {};
          break;
        default:
          setError(`Unknown state transition: ${nextState}`);
          setProcessing(false);
          return;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: method === 'POST' ? JSON.stringify(body) : undefined,
      });

      if (res.ok) {
        // Refetch booking
        const data = await res.json();
        setBooking(data?.data?.booking || booking);
        setError(null);
        console.log(`Booking state updated to ${nextState}`);
      } else {
        const errData = await res.json();
        setError(errData?.message || 'Failed to update booking state');
      }
    } catch (err) {
      setError('Failed to update booking state: ' + err.message);
      console.error('State action error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="state-panel" data-variant="loading">
          <div>
            <div className="state-title">Loading booking</div>
            <div className="state-copy">Fetching the booking details and workflow state.</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="state-panel" data-variant="error" role="alert">
          <div>
            <div className="state-title">Could not load booking</div>
            <div className="state-copy">{error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="empty-state surface-panel">
          <h3>Booking not found</h3>
          <p>The booking may have been removed or you may not have access to it.</p>
        </div>
      </Layout>
    );
  }

  const bookingState = booking.bookingState || booking.state;

  return (
    <Layout>
      <div className="page-shell">
        <div className="app-hero">
          <div className="z-10 flex items-center justify-between w-full">
            <div className="flex flex-col">
              <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-6" onClick={() => navigate(-1)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Pipeline
              </button>
              <h1 className="page-title">{booking.requestedServiceCategories?.join(', ') || 'Service Detail'}</h1>
              <p className="page-subtitle">Reviewing job specifics, customer data, and live tracking status.</p>
            </div>
            <StatusBadge status={bookingState} />
          </div>
        </div>

        {error && (
          <div className="state-panel" data-variant="error">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <div className="state-title">Error</div>
              <div className="state-copy">{error}</div>
            </div>
          </div>
        )}

        {/* Location tracking info */}
        {isEnRoute && (
          <div className="state-panel" data-variant={isTracking ? 'success' : 'loading'}>
             <svg className={`w-5 h-5 ${isTracking ? 'text-emerald-600' : 'text-blue-600 animate-pulse'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
            <div>
              <div className="state-title">{isTracking ? 'Location tracking active' : 'Connecting to GPS...'}</div>
              <div className="state-copy">
                {lastLocation 
                  ? `Your current position: ${lastLocation.coordinates[1].toFixed(4)}, ${lastLocation.coordinates[0].toFixed(4)}`
                  : 'Waiting for coordinates. Please ensure location services are enabled.'}
              </div>
            </div>
          </div>
        )}

        <div className="surface-panel">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Job Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="field">
              <label className="field-label">Vehicle</label>
              <div className="helper-text font-medium text-gray-800">
                {booking.vehicleInfo ? `${booking.vehicleInfo.brand} ${booking.vehicleInfo.model} (${booking.vehicleInfo.vehicleType})` : '-'}
              </div>
            </div>
            <div className="field">
              <label className="field-label">Customer</label>
              <div className="helper-text font-medium text-gray-800">{booking.userId?.fullname || '-'}</div>
            </div>
            <div className="field">
              <label className="field-label">Phone</label>
              <div className="helper-text font-medium text-gray-800">{booking.userId?.phone || '-'}</div>
            </div>
            <div className="field">
              <label className="field-label">Address</label>
              <div className="helper-text font-medium text-gray-800">{booking.serviceLocation?.serviceAddress?.formattedAddress || '-'}</div>
            </div>
            <div className="field col-span-full">
              <label className="field-label">Problem description</label>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic">
                "{booking.problemDescription || 'No description provided'}"
              </div>
            </div>
            <div className="field">
              <label className="field-label">Distance from shop</label>
              <div className="helper-text font-bold text-blue-600">{booking.liveTracking?.distanceKm != null ? `${booking.liveTracking.distanceKm} km` : '-'}</div>
            </div>
            <div className="field">
              <label className="field-label">Estimated travel time</label>
              <div className="helper-text font-bold text-blue-600">{booking.liveTracking?.etaMinutes != null ? `${booking.liveTracking.etaMinutes} min` : '-'}</div>
            </div>
            <div className="field">
              <label className="field-label">Inspection fee</label>
              <div className="helper-text font-bold text-gray-900">₹{booking.inspection?.inspectionFeeFinal != null ? booking.inspection.inspectionFeeFinal : '-'}</div>
            </div>
          </div>
        </div>

        {booking.diagnosis && booking.diagnosis.suggestedServices && booking.diagnosis.suggestedServices.length > 0 && (
          <div className="surface-panel">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Service Diagnosis</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                  <thead className="bg-gray-100/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service Item</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Quoted Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {booking.diagnosis.suggestedServices.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-100/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-800">{s.customServiceName || s.serviceId}</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-700">₹{s.vendorQuotedPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {booking.diagnosis.issues && booking.diagnosis.issues.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Identified Issues</h4>
                  <p className="text-sm text-amber-900">{booking.diagnosis.issues.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 py-8">
          {stateActions[bookingState] && (
            <button
              className="btn-primary w-full max-w-md mx-auto"
              onClick={() => handleStateAction(stateActions[bookingState].next)}
              disabled={processing}
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : stateActions[bookingState].label}
            </button>
          )}

          {bookingState === 'WAITING_FOR_USER_APPROVAL' && (
            <div className="state-panel max-w-md mx-auto w-full" data-variant="loading">
              <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <div>
                <div className="state-title">Waiting for customer approval</div>
                <div className="state-copy">The customer is reviewing the diagnosis.</div>
              </div>
            </div>
          )}
        </div>

        {bookingState === 'INSPECTION_IN_PROGRESS' && (
          <div className="max-w-2xl mx-auto w-full">
            <InspectionForm
              onSubmit={async ({ services, issues }) => {
                setProcessing(true);
                try {
                  const res = await fetch(`/api/v1/bookings/${bookingId}/diagnosis`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                      services: services.map(s => ({ customServiceName: s.customServiceName, quotedPrice: Number(s.quotedPrice) })),
                      issues,
                      inspectionFeeFinal: 200,
                    }),
                  });
                  
                  if (res.ok) {
                    const data = await res.json();
                    setBooking(data?.data?.booking || booking);
                    setError(null);
                    console.log('Diagnosis submitted successfully');
                  } else {
                    const errData = await res.json();
                    setError(errData?.message || 'Failed to submit diagnosis');
                  }
                } catch (err) {
                  setError('Failed to submit diagnosis: ' + err.message);
                  console.error('Diagnosis error:', err);
                } finally {
                  setProcessing(false);
                }
              }}
              loading={processing}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
