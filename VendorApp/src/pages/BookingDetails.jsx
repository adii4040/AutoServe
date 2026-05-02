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
      <div className="page-header app-hero">
        <div>
          <button className="btn-ghost" onClick={() => navigate(-1)}>&larr; Back</button>
          <h1 className="page-title" style={{ marginTop: 12 }}>{booking.requestedServiceCategories?.join(', ') || 'Booking details'}</h1>
          <p className="page-subtitle">Review customer information, progress the job state, and keep the live location tracking in view.</p>
        </div>
        <StatusBadge status={bookingState} />
      </div>

      {error && (
        <div className="state-panel" data-variant="error">
          <div>
            <div className="state-title">Error</div>
            <div className="state-copy">{error}</div>
          </div>
        </div>
      )}

      {/* Live Mapping - Show prominently when en route */}
      {isEnRoute && (
        <div className="state-panel" data-variant="success">
          <div>
            <div className="state-title">📍 Location tracking active</div>
            <div className="state-copy">Your coordinates: {lastLocation?.coordinates[1].toFixed(4) || '...'}, {lastLocation?.coordinates[0].toFixed(4) || '...'}</div>
          </div>
        </div>
      )}

      {isEnRoute && (
        <div className="state-panel" data-variant={isTracking ? 'success' : 'loading'}>
          <div>
            <div className="state-title">{isTracking ? 'Location tracking active' : 'Starting location tracking'}</div>
            <div className="state-copy">{lastLocation ? `Latest coordinates: ${lastLocation.coordinates[1].toFixed(4)}, ${lastLocation.coordinates[0].toFixed(4)}` : 'The vendor location will update while the booking is en route.'}</div>
          </div>
        </div>
      )}

      {isEnRoute && locationError && (
        <div className="state-panel" data-variant="error">
          <div>
            <div className="state-title">Location permission denied</div>
            <div className="state-copy">Please enable location services to update your position.</div>
          </div>
        </div>
      )}

      <div className="card surface-panel">
        <div className="form-grid two-col">
          <div className="field">
            <div className="field-label">Vehicle</div>
            <div className="helper-text">{booking.vehicleInfo ? `${booking.vehicleInfo.brand} ${booking.vehicleInfo.model} (${booking.vehicleInfo.vehicleType})` : '-'}</div>
          </div>
          <div className="field">
            <div className="field-label">Customer</div>
            <div className="helper-text">{booking.userId?.fullname || '-'}</div>
          </div>
          <div className="field">
            <div className="field-label">Phone</div>
            <div className="helper-text">{booking.userId?.phone || '-'}</div>
          </div>
          <div className="field">
            <div className="field-label">Address</div>
            <div className="helper-text">{booking.serviceLocation?.serviceAddress?.formattedAddress || '-'}</div>
          </div>
          <div className="field">
            <div className="field-label">Problem</div>
            <div className="helper-text">{booking.problemDescription || '-'}</div>
          </div>
          <div className="field">
            <div className="field-label">Distance</div>
            <div className="helper-text">{booking.liveTracking?.distanceKm != null ? `${booking.liveTracking.distanceKm} km` : '-'}</div>
          </div>
          <div className="field">
            <div className="field-label">ETA</div>
            <div className="helper-text">{booking.liveTracking?.etaMinutes != null ? `${booking.liveTracking.etaMinutes} min` : '-'}</div>
          </div>
          <div className="field">
            <div className="field-label">Inspection fee</div>
            <div className="helper-text">₹{booking.inspection?.inspectionFeeFinal != null ? booking.inspection.inspectionFeeFinal : '-'}</div>
          </div>
        </div>
      </div>


      {booking.diagnosis && booking.diagnosis.suggestedServices && booking.diagnosis.suggestedServices.length > 0 && (
        <div className="card surface-panel">
          <h3 className="section-title">Diagnosis / suggested services</h3>
          <ul style={{ display: 'grid', gap: 10 }}>
            {booking.diagnosis.suggestedServices.map((s, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--color-border)' }}>
                <span>{s.customServiceName || s.serviceId}</span>
                <span style={{ fontWeight: 700 }}>₹{s.vendorQuotedPrice}</span>
              </li>
            ))}
          </ul>
          {booking.diagnosis.issues && booking.diagnosis.issues.length > 0 && (
            <div className="helper-text" style={{ marginTop: 12 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>Issues:</span> {booking.diagnosis.issues.join(', ')}
            </div>
          )}
        </div>
      )}

      {stateActions[bookingState] && (
        <button
          className="btn-primary"
          onClick={() => handleStateAction(stateActions[bookingState].next)}
          disabled={processing}
        >
          {processing ? 'Updating...' : stateActions[bookingState].label}
        </button>
      )}

      {bookingState === 'WAITING_FOR_USER_APPROVAL' && (
        <div className="state-panel" data-variant="loading">
          <div>
            <div className="state-title">Waiting for customer approval</div>
            <div className="state-copy">The customer is reviewing the diagnosis and suggested services. Once they approve, you can proceed with the service.</div>
          </div>
        </div>
      )}

      {bookingState === 'INSPECTION_IN_PROGRESS' && (
        <InspectionForm
          onSubmit={async ({ services, inspectionFee, issues }) => {
            setProcessing(true);
            try {
              const res = await fetch(`/api/v1/bookings/${bookingId}/diagnosis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  services: services.map(s => ({ customServiceName: s.customServiceName, quotedPrice: Number(s.quotedPrice) })),
                  issues,
                  inspectionFeeFinal: Number(inspectionFee),
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
      )}
    </div>
    </Layout>
  );
}
