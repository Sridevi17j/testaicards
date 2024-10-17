import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useRouter } from 'next/router'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const CheckoutForm = ({ plan, onClose, userEmail, userName }) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setProcessing(true)
    setError(null)

    if (!stripe || !elements) {
      setError("Stripe hasn't loaded yet. Please try again.")
      setProcessing(false)
      return
    }

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message)
      setProcessing(false)
      return
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (paymentError) {
      setError(paymentError.message)
      setProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setPaymentStatus('Payment successful!')
      
      try {
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            name: userName,
            planName: plan.name,
            cardsRemaining: plan.cards,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('User data stored successfully');
          setTimeout(() => {
            onClose();
            router.push('/dashboard');
          }, 2000);
        } else {
          console.error('Failed to store user data:', data);
          setError(`Failed to store user data: ${data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error storing user data:', error);
        setError(`Error storing user data: ${error.message}`);
      }
    } else {
      setError('Something went wrong with the payment.')
    }

    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {paymentStatus && <div className="text-green-500 mt-2">{paymentStatus}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {processing ? 'Processing...' : `Pay $${plan.price}`}
      </button>
    </form>
  )
}

export default function PaymentModal({ isOpen, onClose, plan, userEmail, userName }) {
  const [isVisible, setIsVisible] = useState(false)
  const [clientSecret, setClientSecret] = useState('')

  useEffect(() => {
    if (isOpen && plan) {
      setIsVisible(true)
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price * 100,
          planName: plan.name,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error('Error creating PaymentIntent:', data.error)
          } else {
            setClientSecret(data.clientSecret)
          }
        })
        .catch((err) => console.error('Error:', err))
    } else {
      setIsVisible(false)
      setClientSecret('')
    }
  }, [isOpen, plan])

  if (!isOpen || !clientSecret) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div 
        className={`relative p-8 bg-white w-full max-w-md m-4 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Details for {plan?.name} Plan</h3>
        <p className="text-sm text-gray-600 mb-6">No auto-renewal. Top-up anytime</p>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm plan={plan} onClose={onClose} userEmail={userEmail} userName={userName} />
        </Elements>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  )
}