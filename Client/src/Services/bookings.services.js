import axios from 'axios';

const API_BASE = '/api/v1/bookings';

// Create a new booking
export async function createBooking(data) {
  // data: { serviceType, locationType, address, notes, date }
  const res = await axios.post(`${API_BASE}/`, data);
  return res.data.booking;
}

// Get booking by ID (with vendor batch for map)
export async function getBookingById(bookingId) {
  const res = await axios.get(`${API_BASE}/${bookingId}`);
  // Expecting: { booking, vendors: [] }
  return res.data;
}

// Get all bookings for current user
export async function getMyBookings() {
  const res = await axios.get(`${API_BASE}/my`);
  return res.data.bookings;
}
