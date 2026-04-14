import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import InspectionForm from '../components/InspectionForm';

const stateActions = {
  VENDOR_ASSIGNED: { label: 'Start Journey', next: 'VENDOR_EN_ROUTE' },
  VENDOR_EN_ROUTE: { label: 'Arrived', next: 'INSPECTION_IN_PROGRESS' },
  SERVICE_IN_PROGRESS: { label: 'Mark as Completed', next: 'COMPLETED' },
};

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/vendor/booking/${bookingId}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setBooking(data?.data?.booking || null))
      .catch(() => setError('Failed to load booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleStateAction = async (nextState) => {
    setProcessing(true);
    await fetch(`/api/v1/vendor/booking/${bookingId}/state`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ newState: nextState }),
    });
    setProcessing(false);
    window.location.reload();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!booking) return <div className="p-8">Booking not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button className="mb-4 text-blue-500" onClick={() => navigate(-1)}>&larr; Back</button>
      {/* Booking Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">{booking.requestedServiceCategories?.join(', ')}</div>
          <StatusBadge status={booking.bookingState} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-semibold">Vehicle:</span> {booking.vehicleInfo ? `${booking.vehicleInfo.brand} ${booking.vehicleInfo.model} (${booking.vehicleInfo.vehicleType})` : '-'}</div>
          <div><span className="font-semibold">Customer:</span> {booking.userId?.fullname || '-'}</div>
          <div><span className="font-semibold">Phone:</span> {booking.userId?.phone || '-'}</div>
          <div><span className="font-semibold">Address:</span> {booking.serviceLocation?.serviceAddress?.formattedAddress || '-'}</div>
          <div><span className="font-semibold">Problem:</span> {booking.problemDescription || '-'}</div>
          <div><span className="font-semibold">Distance:</span> {booking.liveTracking?.distanceKm != null ? `${booking.liveTracking.distanceKm} km` : '-'}</div>
          <div><span className="font-semibold">ETA:</span> {booking.liveTracking?.etaMinutes != null ? `${booking.liveTracking.etaMinutes} min` : '-'}</div>
          <div><span className="font-semibold">Inspection Fee:</span> ₹{booking.inspection?.inspectionFeeFinal != null ? booking.inspection.inspectionFeeFinal : ''}</div>
        </div>
      </div>

      {/* Diagnosis Card (if exists) */}
      {booking.diagnosis && booking.diagnosis.suggestedServices && booking.diagnosis.suggestedServices.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold mb-2">Diagnosis / Suggested Services</h3>
          <ul className="mb-2">
            {booking.diagnosis.suggestedServices.map((s, i) => (
              <li key={i} className="flex justify-between border-b py-1">
                <span>{s.customServiceName || s.serviceId}</span>
                <span className="font-semibold">₹{s.vendorQuotedPrice}</span>
              </li>
            ))}
          </ul>
          {booking.diagnosis.issues && booking.diagnosis.issues.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold">Issues:</span> {booking.diagnosis.issues.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* State Action Buttons */}
      {stateActions[booking.bookingState] && (
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 mb-4"
          onClick={() => handleStateAction(stateActions[booking.bookingState].next)}
          disabled={processing}
        >
          {stateActions[booking.bookingState].label}
        </button>
      )}

      {/* Inspection Flow UI */}
      {booking.bookingState === 'INSPECTION_IN_PROGRESS' && (
        <InspectionForm
          onSubmit={async ({ services, inspectionFee, issues }) => {
            setProcessing(true);
            await fetch(`/api/v1/bookings/${bookingId}/diagnosis`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                services: services.map(s => ({ customServiceName: s.customServiceName, quotedPrice: Number(s.quotedPrice) })),
                issues,
                inspectionFeeFinal: Number(inspectionFee),
              }),
            });
            setProcessing(false);
            window.location.reload();
          }}
          loading={processing}
        />
      )}
    </div>
  );
}
