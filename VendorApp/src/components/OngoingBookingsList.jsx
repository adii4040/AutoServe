import OngoingBookingCard from "./OngoingBookingCard";

export default function OngoingBookingsList({
  bookings,
  processing,
  getAllowedNextStates,
  onStateChange,
}) {
  return (
    <div>  
      {bookings.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No ongoing bookings
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <OngoingBookingCard
              key={booking.bookingId}
              booking={booking}
              processing={processing}
              getAllowedNextStates={getAllowedNextStates}
              onStateChange={onStateChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}