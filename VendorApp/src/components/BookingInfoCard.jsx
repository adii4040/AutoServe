import React from 'react';
import StatusBadge from './StatusBadge';

const BookingInfoCard = ({ booking }) => {
  if (!booking) return null;
  return (
    <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <h2 className="text-xl font-bold mb-2">{booking.serviceName}</h2>
        <div className="mb-2"><span className="font-semibold">Vehicle:</span> {booking.vehicle}</div>
        <div className="mb-2"><span className="font-semibold">Customer:</span> {booking.customerName}</div>
        <div className="mb-2"><span className="font-semibold">Phone:</span> {booking.phone}</div>
        <div className="mb-2"><span className="font-semibold">Address:</span> {booking.address}</div>
        <div className="mb-2"><span className="font-semibold">Problem:</span> {booking.problemDescription}</div>
      </div>
      <div>
        <div className="mb-2"><span className="font-semibold">Distance:</span> {booking.distance} km</div>
        <div className="mb-2"><span className="font-semibold">ETA:</span> {booking.eta} min</div>
        <div className="mb-2"><span className="font-semibold">Inspection Fee:</span> ₹{booking.inspectionFee}</div>
        <div className="mb-2 flex items-center gap-2">
          <span className="font-semibold">Status:</span>
          <StatusBadge status={booking.status} />
        </div>
      </div>
    </div>
  );
};

export default BookingInfoCard;
