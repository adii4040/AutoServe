// PATCH: Vendor updates booking state
export const updateVendorBookingState = async (bookingId, newState) => {
  const res = await fetch(`/api/v1/vendor/booking/${bookingId}/state`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ newState }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update booking state');
  }
  return res.json();
};
