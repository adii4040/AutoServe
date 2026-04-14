import React from 'react';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function BookingCard({ booking }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 mb-4 cursor-pointer hover:shadow-2xl transition border border-gray-100 flex flex-col gap-3 group"
      onClick={() => navigate(`/bookings/${booking._id}`)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 21m5.25-4l.75 4m-7.5-8.25A6.75 6.75 0 1118.75 9a6.75 6.75 0 01-13.5 0z" /></svg>
          </div>
          <div>
            <div className="font-semibold text-lg text-gray-900">{booking.requestedServiceCategories?.join(', ') || 'Service'}</div>
            <div className="text-sm text-gray-500">{booking.user?.fullname || 'Unknown'}</div>
          </div>
        </div>
        <StatusBadge status={booking.bookingState} />
      </div>
      <div className="flex gap-6 text-sm text-gray-600 mt-1">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /></svg>
          <span>{booking.distanceKm != null ? `${booking.distanceKm} km` : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{booking.etaMinutes != null ? `${booking.etaMinutes} min` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
