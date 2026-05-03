import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle2, Loader, RefreshCw, XCircle } from 'lucide-react';
import {
  createPaymentOrder,
  fetchPaymentStatus,
  verifyPayment,
  loadRazorpayScript,
  openRazorpayCheckout,
} from '@/Services/bookings/payment.services';

/**
 * PaymentCheckout Component
 * Handles Razorpay payment flow for bookings
 */
export default function PaymentCheckout({
  bookingId,
  paymentType, // 'inspection' or 'service'
  amount,
  userEmail,
  userName,
  userPhone,
  onPaymentSuccess,
  onPaymentError,
  buttonLabel = 'Pay Now',
  variant = 'default',
  size = 'default',
}) {
  const [flowState, setFlowState] = useState('PAY_NOW');
  const [stateMessage, setStateMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isBusy = flowState === 'PROCESSING';

  const humanError = (message) => {
    if (!message) return 'Payment failed. Please try again.';
    if (message === 'PAYMENT_CANCELLED') return 'Payment cancelled by you.';
    if (/signature/i.test(message)) return 'Payment verification failed due to signature mismatch.';
    if (/timeout/i.test(message)) return 'Payment verification timed out. Please retry.';
    return message;
  };

  const pollStatusUntilFinal = async (timeoutMs = 120000, intervalMs = 2500) => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const statusResponse = await fetchPaymentStatus(bookingId, paymentType);
      const statusData = statusResponse?.data || {};

      if (statusData.status === 'PAID') {
        return { status: 'PAID', data: statusData };
      }

      if (statusData.failureCode || statusData.status === 'FAILED') {
        return { status: 'FAILED', data: statusData };
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return { status: 'TIMEOUT' };
  };

  const handlePayment = async () => {
    if (!bookingId || !paymentType || !amount) {
      toast({
        title: 'Missing information',
        description: 'Booking ID, payment type, and amount are required.',
        variant: 'destructive',
      });
      return;
    }

    setFlowState('PROCESSING');
    setErrorMessage('');
    setStateMessage('Preparing secure checkout...');

    try {
      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Step 2: Create order on backend
      setStateMessage('Creating payment order...');
      const orderResponse = await createPaymentOrder(bookingId, paymentType);
      const order = orderResponse.data.order;

      if (!order.id) {
        throw new Error('Failed to create payment order');
      }

      // Step 3: Get Razorpay API key from window or Vite environment
      const razorpayKey = window.RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      // Step 4: Open Razorpay checkout
      setStateMessage('Waiting for payment confirmation...');
      const paymentResponse = await openRazorpayCheckout({
        key: razorpayKey,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'AutoServe',
        description: `Payment for ${paymentType}`,
        prefill: {
          name: userName || '',
          email: userEmail || '',
          contact: userPhone || '',
        },
        notes: {
          bookingId,
          paymentType,
        },
        method: {
          upi: true,
          card: true,
          wallet: false,
          netbanking: false,
          emi: false,
          paylater: false,
        },
      });

      // Step 5: Verify payment signature
      setStateMessage('Verifying payment signature...');

      let verifyResponse;
      try {
        verifyResponse = await verifyPayment({
          bookingId,
          paymentType,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        });
      } catch (verifyErr) {
        // Backend may still settle payment through webhook; poll for true state.
        const reconciled = await pollStatusUntilFinal();
        if (reconciled.status === 'PAID') {
          verifyResponse = { data: reconciled.data };
        } else if (reconciled.status === 'FAILED') {
          throw new Error(reconciled.data?.failureReason || verifyErr.message || 'Payment verification failed');
        } else {
          throw new Error('Payment verification timeout');
        }
      }

      setFlowState('SUCCESS');
      setStateMessage('Payment successful. Booking status synced.');

      toast({
        title: 'Payment successful',
        description: `${paymentType} payment completed successfully.`,
      });

      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess(verifyResponse);
      }
    } catch (error) {
      console.error('Payment error:', error);

      const normalized = humanError(error.message);
      setFlowState('FAILED');
      setErrorMessage(normalized);
      setStateMessage('');

      toast({
        title: 'Payment failed',
        description: normalized,
        variant: 'destructive',
      });

      // Call error callback
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  const handleRetry = () => {
    setFlowState('RETRY');
    setStateMessage('Retrying payment...');
    setErrorMessage('');

    setTimeout(() => {
      setFlowState('PAY_NOW');
      setStateMessage('');
      handlePayment();
    }, 150);
  };

  if (flowState === 'SUCCESS') {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
        <CheckCircle2 className="w-4 h-4" />
        <span>{stateMessage || 'Payment successful'}</span>
      </div>
    );
  }

  if (flowState === 'FAILED') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
          <XCircle className="w-4 h-4" />
          <span>{errorMessage || 'Payment failed'}</span>
        </div>
        <Button
          onClick={handleRetry}
          variant="outline"
          size={size}
          className="gap-2 w-fit"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Payment
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handlePayment}
        disabled={isBusy}
        variant={variant}
        size={size}
        className="gap-2"
      >
        {isBusy && <Loader className="w-4 h-4 animate-spin" />}
        {isBusy ? 'Processing...' : buttonLabel}
      </Button>

      {isBusy && (
        <p className="text-xs text-muted-foreground">{stateMessage || 'Processing payment...'}</p>
      )}
    </div>
  );
}
