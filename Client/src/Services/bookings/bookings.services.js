import { myBookingsUrl } from '../routes';

export const fetchMyBookings = async () => {
  const res = await fetch(myBookingsUrl, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to fetch bookings');
  }
  return res.json();
};
