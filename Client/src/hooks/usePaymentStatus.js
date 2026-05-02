import { useEffect, useState } from 'react';
import { fetchPaymentStatus } from '@/Services/bookings/payment.services';

export default function usePaymentStatus({ bookingId, paymentType, enabled = true, pollMs = 2500 }) {
  const [status, setStatus] = useState('UNPAID');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !bookingId || !paymentType) {
      return undefined;
    }

    let active = true;
    let timerId;

    const sync = async () => {
      setLoading(true);
      try {
        const response = await fetchPaymentStatus(bookingId, paymentType);
        if (!active) return;

        const paymentData = response?.data || null;
        setData(paymentData);
        setStatus(paymentData?.status || 'UNPAID');
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    sync();
    timerId = setInterval(sync, pollMs);

    return () => {
      active = false;
      clearInterval(timerId);
    };
  }, [bookingId, paymentType, enabled, pollMs]);

  return { status, data, loading, error };
}
