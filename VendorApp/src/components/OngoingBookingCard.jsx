import React from "react";
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
// import InspectionDiagnosisForm from './InspectionDiagnosisForm';

const statusConfig = {
    VENDOR_ASSIGNED: {
        label: "Vendor assigned",
        className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    },
    VENDOR_EN_ROUTE: {
        label: "En route",
        className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    },
    INSPECTION_IN_PROGRESS: {
        label: "Inspection in progress",
        className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    },
    WAITING_FOR_USER_APPROVAL: {
        label: "Awaiting approval",
        className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    },
    SERVICE_IN_PROGRESS: {
        label: "Service in progress",
        className: "bg-green-50 text-green-700 ring-1 ring-green-200",
    },
};

const avatarColors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-purple-100 text-purple-700",
];

const getAvatarColor = (name) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

const getInitials = (name) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
};

const formatPhone = (phone) => {
    const str = phone.toString();
    return `+91 ${str.slice(0, 5)} ${str.slice(5)}`;
};

export default function OngoingBookingCard({
    booking,
    processing,
    getAllowedNextStates,
    onStateChange,
}) {
    const navigate = useNavigate();
    const status = booking.status || 'CREATED';
    const initials = getInitials(booking.user?.fullname || "U");
    const avatarColor = getAvatarColor(booking.user?.fullname || "U");

    return (
        <div
            className="metric-card !p-0 cursor-pointer overflow-hidden flex flex-col group transition-all duration-300 hover:border-blue-300"
            onClick={() => navigate(`/bookings/${booking.bookingId}`)}
        >
            {/* Header / Top Section */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${avatarColor} ring-4 ring-white`}>
                            {initials}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                {booking.user?.fullname || 'Unknown User'}
                            </h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Customer ID: {booking.bookingId.slice(-6).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={status} />
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {booking.requestedServiceCategories?.map((cat) => (
                        <span key={cat} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-100">
                            {cat}
                        </span>
                    ))}
                    {booking.vehicleInfo?.brand && (
                        <span className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-wider rounded-md border border-gray-100">
                            {booking.vehicleInfo.brand} {booking.vehicleInfo.model}
                        </span>
                    )}
                </div>

                {booking.problemDescription && (
                    <div className="text-sm text-gray-600 line-clamp-2 font-medium bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-2 italic">
                        "{booking.problemDescription}"
                    </div>
                )}
            </div>

            {/* Middle Section - Live Metadata */}
            <div className="px-6 py-5 bg-gray-50/30 border-t border-gray-100 grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Arrival ETA</span>
                        <span className="text-sm font-black text-gray-900">{booking.etaMinutes || '0'} min</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-emerald-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Distance</span>
                        <span className="text-sm font-black text-gray-900">{booking.distanceKm || '0'} km away</span>
                    </div>
                </div>
            </div>

            {/* Footer - Final CTA / Address */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 mt-auto flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fee Earned</span>
                    <p className="text-lg font-black text-blue-600">₹{booking.inspectionFee || '200'}</p>
                </div>
                <button className="px-5 py-2.5 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200">
                    Manage Job
                </button>
            </div>
        </div>
    );
}
