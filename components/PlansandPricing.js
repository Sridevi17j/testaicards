import React, { useState, useEffect } from 'react';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const pricingPlans = [
  { name: 'Basic', price: 500, cards: 20, color: 'bg-blue-800' },
  { name: 'Standard', price: 1000, cards: 50, color: 'bg-green-800' },
  { name: 'Premium', price: 2000, cards: 100, color: 'bg-purple-800' }
];

const CheckoutForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setError("Stripe hasn't loaded yet. Please try again.");
      setProcessing(false);
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
      return;
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (paymentError) {
      setError(paymentError.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }

    setProcessing(false);
  };

  return (
    
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {processing ? 'Processing...' : `Pay ₹${plan.price / 100}`}
        </button>
      </div>
    </form>
  );
};

export default function PlansAndPricing() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  const handlePlanSelection = async (plan) => {
    if (!session) {
      setSelectedPlan(plan);
      setShowSignInPrompt(true);
    } else {
      await initializePayment(plan);
    }
  };

  const handleSignIn = async () => {
    const result = await signIn('google', { redirect: false });
    if (result.error) {
      console.error('Sign-in error:', result.error);
    } else if (result.ok && selectedPlan) {
      await initializePayment(selectedPlan);
    }
  };

  const initializePayment = async (plan) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price, planName: plan.name }),
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setSelectedPlan(plan);
      setShowPaymentForm(true);
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          planName: selectedPlan.name,
          cardsRemaining: selectedPlan.cards,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        console.error('Failed to update user plan');
      }
    } catch (error) {
      console.error('Error updating user plan:', error);
    }
  };

  return (
    <section className="bg-gradient-to-b from-gray-500 via-gray-450 to-gray-400 text-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white-900 mb-4">AI Greeting Card Generator</h2>
        <p className="text-center text-white-500 mb-8">Choose a plan that fits your needs and start creating amazing cards today.</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`${plan.color} text-white p-6 text-center`}>
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{plan.price / 100}</span>
                  <span className="text-xl">/month</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="text-gray-600 space-y-4">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {plan.cards} cards per month
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    AI-powered designs
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Customizable templates
                  </li>
                </ul>
                <button 
                  onClick={() => handlePlanSelection(plan)}
                  className={`mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${plan.color} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${plan.color.split('-')[1]}-500`}
                >
                  Choose Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showSignInPrompt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Sign In Required</h3>
            <p className="mb-4">Please sign in with Google to continue with your purchase.</p>
            <button
              onClick={handleSignIn}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}
      {showPaymentForm && clientSecret && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Complete Your Payment</h3>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                plan={selectedPlan} 
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentForm(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </section>
  );
}