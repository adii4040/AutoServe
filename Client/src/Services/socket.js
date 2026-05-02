import io from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.io connection
 * Should be called once on app startup
 */
export function initSocket() {
  if (socket) {
    console.log('[Socket] Already connected');
    return socket;
  }

  socket = io(window.location.origin, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
  });

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error);
  });

  return socket;
}

/**
 * Get Socket.io instance
 * Initializes if not already connected
 */
export function getSocket() {
  if (!socket) {
    return initSocket();
  }
  return socket;
}

/**
 * Join a booking tracking room
 * @param {string} bookingId - Booking ID to track
 */
export function joinBookingTracking(bookingId) {
  const sock = getSocket();
  const roomName = `booking:${bookingId}`;
  sock.emit('tracking:join', { bookingId });
  console.log(`[Socket] Joining room: ${roomName}`);
}

/**
 * Leave booking tracking room
 * @param {string} bookingId - Booking ID
 */
export function leaveBookingTracking(bookingId) {
  const sock = getSocket();
  sock.emit('tracking:leave', { bookingId });
  console.log(`[Socket] Leaving room: booking:${bookingId}`);
}

/**
 * Listen for location updates on a booking
 * @param {string} bookingId - Booking ID
 * @param {function} callback - Called with location data: { coordinates, timestamp, distance, eta }
 */
export function onLocationUpdate(bookingId, callback) {
  const sock = getSocket();
  sock.on('location:update', (data) => {
    if (data.bookingId === bookingId) {
      callback(data);
    }
  });
}

/**
 * Listen for vendor arrival event
 * @param {string} bookingId - Booking ID
 * @param {function} callback - Called when vendor arrives
 */
export function onVendorArrived(bookingId, callback) {
  const sock = getSocket();
  sock.on('vendor:arrived', (data) => {
    if (data.bookingId === bookingId) {
      callback(data);
    }
  });
}

/**
 * Stop listening for location updates
 * @param {string} eventName - Event name to stop listening
 */
export function offLocationUpdate(eventName = 'location:update') {
  const sock = getSocket();
  sock.off(eventName);
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket] Disconnected');
  }
}
