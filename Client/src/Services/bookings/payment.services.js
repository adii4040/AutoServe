import axiosInstance from './axiosInstance';

const PAYMENT_BASE = '/api/v1/payment';

/**
 * Create a Razorpay order for a booking
 * @param {string} bookingId - The booking ID
 * @param {string} paymentType - 'inspection' or 'service'
 * @returns {Promise} { order: { id, amount, currency, receipt, status }, paymentType }
 */
export async function createPaymentOrder(bookingId, paymentType) {
  if (!['inspection', 'service'].includes(paymentType)) {
    throw new Error('Invalid payment type. Must be "inspection" or "service"');
  }

  try {
    const res = await axiosInstance.post(`${PAYMENT_BASE}/create-order`, {
      bookingId,
      paymentType,
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create payment order');
  }
}

/**
 * Verify Razorpay payment signature
 * @param {string} bookingId - The booking ID
 * @param {string} paymentType - 'inspection' or 'service'
 * @param {string} razorpay_order_id - Razorpay order ID
 * @param {string} razorpay_payment_id - Razorpay payment ID
 * @param {string} razorpay_signature - Razorpay signature
 * @returns {Promise} { bookingId, message: "Payment verified" }
 */
export async function verifyPayment({
  bookingId,
  paymentType,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  try {
    const res = await axiosInstance.post(`${PAYMENT_BASE}/verify`, {
      bookingId,
      paymentType,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
}

/**
 * Fetch latest payment status for a booking and payment type.
 * @param {string} bookingId
 * @param {'inspection'|'service'} paymentType
 */
export async function fetchPaymentStatus(bookingId, paymentType) {
  try {
    const res = await axiosInstance.get(`${PAYMENT_BASE}/status/${bookingId}`, {
      params: { paymentType },
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payment status');
  }
}

/**
 * Load Razorpay script
 * @returns {Promise<boolean>} true if script loaded successfully
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay checkout
 * @param {object} options - Razorpay checkout options
 * @param {string} options.key - Razorpay API key
 * @param {object} options.order - Order object from createPaymentOrder
 * @param {string} options.prefill - User details { name, email, contact }
 * @returns {Promise} Resolves with payment response
 */
export function openRazorpayCheckout(options) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay script not loaded'));
      return;
    }

    const razorpay = new window.Razorpay({
      ...options,
      handler: (response) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('PAYMENT_CANCELLED'));
        },
      },
    });

    razorpay.open();
  });
}
