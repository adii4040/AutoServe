import React from "react";
import { useNavigate } from 'react-router-dom';
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
        return (
                <div
                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition"
                        onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${getAvatarColor(
                            booking.user.fullname
                        )}`}
                    >
                        {getInitials(booking.user.fullname)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {booking.user.fullname}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {formatPhone(booking.user.phone)}
                        </p>
                    </div>
                </div>
                <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[booking.status]?.className ||
                        "bg-gray-100 text-gray-600"
                        }`}
                >
                    {statusConfig[booking.status]?.label || booking.status}
                </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {booking.requestedServiceCategories?.map((cat) => (
                    <span
                        key={cat}
                        className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md"
                    >
                        {cat}
                    </span>
                ))}
                {booking.vehicleInfo?.vehicleType && (
                    <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                        {booking.vehicleInfo.vehicleType}
                    </span>
                )}
                {booking.vehicleInfo?.brand && booking.vehicleInfo?.model && (
                    <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                        {booking.vehicleInfo.brand} {booking.vehicleInfo.model}
                    </span>
                )}
            </div>

            {/* Problem description */}
            {booking.problemDescription && (
                <div className="text-sm text-gray-500 mt-2">
                    {booking.problemDescription}
                </div>
            )}

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md">
                        {/* clock icon */}
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="mr-1"
                        >
                            <circle
                                cx="8"
                                cy="8"
                                r="6.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                            />
                            <path
                                d="M8 5v3.5l2 2"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span>
                            <span className="font-medium text-gray-700">
                                {booking.etaMinutes} min
                            </span>{" "}
                            ETA
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-md">
                        {/* pin icon */}
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="mr-1"
                        >
                            <path
                                d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z"
                                stroke="currentColor"
                                strokeWidth="1.2"
                            />
                            <circle
                                cx="8"
                                cy="6"
                                r="1.5"
                                stroke="currentColor"
                                strokeWidth="1.2"
                            />
                        </svg>
                        <span>
                            <span className="font-medium text-gray-700">
                                {booking.distanceKm} km
                            </span>{" "}
                            away
                        </span>
                    </div>
                </div>
                {booking.inspectionFee ? (
                    <p className="text-xs text-gray-400">
                        Inspection fee{" "}
                        <span className="text-sm font-semibold text-gray-800">
                            ₹{booking.inspectionFee}
                        </span>
                    </p>
                ) : null}
            </div>
            {/* Address */}
            <p className="text-xs text-gray-400 mt-3">{booking.user.address}</p>
        </div>
    );
}
