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
          <h3>No bookings yet</h3>
          <p>Assigned bookings, including completed jobs, will appear here with status context and quick actions.</p>
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