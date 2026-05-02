import axiosInstance from './axiosInstance';

const API_BASE = '/bookings';

// Create a new booking
export async function createBooking(data) {
  // data: { serviceType, locationType, address, notes, date }
  const res = await axiosInstance.post(`${API_BASE}/`, data);
  return res.data.booking;
}

// Get booking by ID (with vendor batch for map)
export async function getBookingById(bookingId) {
  const res = await axiosInstance.get(`${API_BASE}/${bookingId}`);
  // Server returns ApiResponse: { success, statusCode, data: { booking }, message }
  const booking = res.data?.data?.booking || res.data?.booking || null;
  const vendors = res.data?.data?.vendors || res.data?.vendors || [];
  return { booking, vendors };
}

// Get all bookings for current user
export async function getMyBookings() {
  const res = await axiosInstance.get(`${API_BASE}/my-bookings`);
  // Server returns ApiResponse: { success, data: { bookings } }
  return res.data?.data?.bookings || res.data?.bookings || [];
}

/**
 * Approve diagnosis services from vendor
 * @param {string} bookingId - The booking ID
 * @param {number[]} approvedIndexes - Array of approved service indexes
 * @param {number[]} rejectedIndexes - Array of rejected service indexes
 * @returns {Promise} Updated booking object
 */
export async function approveServices(bookingId, approvedIndexes, rejectedIndexes) {
  const res = await axiosInstance.post(`${API_BASE}/${bookingId}/approve-services`, {
    approvedIndexes,
    rejectedIndexes,
  });
  return res.data.booking;
}

/**
 * Cancel a booking
 * @param {string} bookingId - The booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise} Updated booking object
 */
export async function cancelBooking(bookingId, reason) {
  const res = await axiosInstance.post(`${API_BASE}/${bookingId}/cancel`, {
    reason,
  });
  return res.data.booking;
}
