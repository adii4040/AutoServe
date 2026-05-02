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
        <div className="empty-state surface-panel">
          <h3>No ongoing bookings</h3>
          <p>Bookings currently in progress will appear here with quick state controls and status context.</p>
        </div>
      ) : (
        <div className="form-grid">
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