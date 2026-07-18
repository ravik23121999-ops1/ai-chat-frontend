'use client';

import { useState, useEffect, useRef } from 'react';
import { socketService } from '../lib/socket';
import type { User } from '../types/user';

interface PaymentProps {
  user: User;
  onPaymentSuccess: () => void;
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: { name: string; email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

const PREMIUM_FEATURES = [
  'AI-powered reply suggestions',
  'Chat summarization',
  'Priority support',
  'Unlimited messages'
] as const;

const PREMIUM_AMOUNT = 99;

export function Payment({ user, onPaymentSuccess }: PaymentProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState('');
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  const lastCheckedUserId = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    onPaymentSuccessRef.current = onPaymentSuccess;
  }, [onPaymentSuccess]);

  useEffect(() => {
    let mounted = true;

    if (user.id !== lastCheckedUserId.current) {
      lastCheckedUserId.current = null;
    }

    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        if (mounted) {
          setRazorpayLoaded(true);
          scriptLoadedRef.current = true;
        }
      };
      script.onerror = () => {
        if (mounted) {
          scriptLoadedRef.current = true;
          setError('Could not load the payment form. Please refresh the page.');
        }
      };
      document.body.appendChild(script);
    }

    const checkPremiumStatus = async () => {
      if (!user.id || !mounted) return;

      if (lastCheckedUserId.current === user.id) {
        return;
      }

      lastCheckedUserId.current = user.id;
      setCheckingStatus(true);

      const timeoutId = setTimeout(() => {
        if (mounted) {
          setCheckingStatus(false);
          setError('Taking longer than usual to check your plan. Please refresh.');
        }
      }, 10000);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/premium-status/${user.id}`
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (mounted) {
            setError('Could not check your premium status. Please try again later.');
          }
          return;
        }

        const data = await response.json();
        if (data.success && mounted) {
          setIsPremium(data.isPremium);
          setError('');
        }
      } catch {
        clearTimeout(timeoutId);
        if (mounted) {
          setError('Could not check your premium status. Please try again later.');
        }
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          setCheckingStatus(false);
        }
      }
    };

    if (user.id) {
      checkPremiumStatus();
    }

    const socket = socketService.getSocket();
    const handlePaymentEvent = (data: { userId: string }) => {
      if (mounted && data.userId === user.id) {
        setIsPremium(true);
        onPaymentSuccessRef.current();
      }
    };

    socket?.on('payment-success', handlePaymentEvent);

    return () => {
      mounted = false;
      socket?.off('payment-success', handlePaymentEvent);
    };
  }, [user.id]);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      setError('Payment is still loading. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: PREMIUM_AMOUNT,
            currency: 'INR'
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Could not start payment');
      }

      const keyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/key-id`
      );
      const keyData = await keyResponse.json();

      if (!keyData.success) {
        throw new Error(keyData.error || 'Could not load payment settings');
      }

      const options: RazorpayOptions = {
        key: keyData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'AI Chat Premium',
        description: 'Unlock premium AI features',
        order_id: orderData.order.id,
        handler: async (response) => {
          const verifyResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/verify`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                userId: user.id
              }),
            }
          );

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            setIsPremium(true);
            onPaymentSuccess();
          } else {
            setError('We could not confirm your payment. Please contact support if money was deducted.');
          }
          setLoading(false);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 sm:p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold">Premium unlocked!</h3>
            <p className="text-yellow-100 text-xs sm:text-sm">You have access to all AI features</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Upgrade to Premium</h3>
        <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 text-xs sm:text-sm font-medium rounded-full">
          ₹{PREMIUM_AMOUNT}/month
        </span>
      </div>

      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {PREMIUM_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2 sm:gap-3 text-gray-600 text-sm sm:text-base">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="break-words">{feature}</span>
          </li>
        ))}
      </ul>

      {error && (
        <p className="mb-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || !razorpayLoaded}
        className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="hidden sm:inline">Processing...</span>
            <span className="sm:hidden">Processing</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Upgrade now</span>
            <span className="sm:hidden">Upgrade</span>
            <span className="text-blue-200">→</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center mt-2 sm:mt-3">
        Secure payment powered by Razorpay
      </p>
    </div>
  );
}
