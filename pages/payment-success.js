'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useStripe, Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function PaymentSuccessContent() {
  const stripe = useStripe()
  const router = useRouter()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    )

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setStatus('succeeded')
          // Here you would typically update the user's plan in your database
          break
        case 'processing':
          setStatus('processing')
          break
        case 'requires_payment_method':
          setStatus('failed')
          break
        default:
          setStatus('failed')
          break
      }
    })
  }, [stripe])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
        {status === 'succeeded' && (
          <p className="text-green-600">Your payment was successful!</p>
        )}
        {status === 'processing' && (
          <p className="text-yellow-600">Your payment is processing...</p>
        )}
        {status === 'failed' && (
          <p className="text-red-600">Your payment failed. Please try again.</p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentSuccessContent />
    </Elements>
  )
}