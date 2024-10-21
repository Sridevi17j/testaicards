import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const pricingPlans = [
    { name: 'Basic', price: 100, cards: 10, color: 'from-blue-500 to-blue-600' },
    { name: 'Premium', price: 500, cards: 50, color: 'from-purple-500 to-purple-600' }
];

const CheckoutForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

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
      setPaymentStatus('success');
      onSuccess(paymentIntent, plan);
    } else {
      setError('Something went wrong with the payment.');
    }

    setProcessing(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        {paymentStatus !== 'success' && <PaymentElement />}
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {paymentStatus === 'success' ? (
          <div className="text-center mt-6">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="mt-4 text-xl font-semibold text-gray-800">Payment Successful</p>
            <p className="mt-2 text-sm text-gray-600">{plan.cards} cards will be added to your account.</p>
          </div>
        ) : (
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
              {processing ? 'Processing...' : `Pay $${plan.price / 100}`}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  // New state variables for payment
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const userData = await fetchUserData(session.user.email, session.user.name);
          setUser(userData);
        } catch (err) {
          console.error('Error in fetchData:', err);
          setError('Failed to load user data. Please try refreshing the page.');
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        router.push('/');
      }
    };

    if (status !== 'loading') {
      fetchData();
    }
  }, [session, status, router]);

  const fetchUserData = async (email, name) => {
    console.log('Fetching user data for:', email);
    try {
      const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (response.ok) {
        if (data.newUser) {
          // User not found, create new user
          return await createNewUser(email, name);
        } else {
          return data;
        }
      } else {
        throw new Error(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const createNewUser = async (email, name) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          planName: 'Free Plan',
          cardsRemaining: 4
        }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to create new user');
      }
    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  };

  const handleGenerateCard = async () => {
    if (user && user.cards_remaining > 0) {
      try {
        // TODO: Implement card generation logic
        console.log('Generating card with prompt:', prompt);
        const updatedUser = await updateUserData(user.email, user.name, user.plan_name, user.cards_remaining - 1);
        setUser(updatedUser);
        setPrompt('');
      } catch (error) {
        console.error('Error generating card:', error);
        setError('Failed to generate card. Please try again.');
      }
    }
  };

  const updateUserData = async (email, name, planName, cardsRemaining) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, planName, cardsRemaining }),
      });
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error in updateUserData:', error);
      throw error;
    }
  };

  // New functions for payment handling
  const handleUpgrade = async (planName) => {
    const plan = pricingPlans.find(p => p.name === planName);
    if (plan) {
      setSelectedPlan(plan);
      await initializePayment(plan);
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
      setShowPaymentForm(true);
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
    }
  };

  const handlePaymentSuccess = async (paymentIntent, plan) => {
    try {
      const updatedCardsRemaining = user.cards_remaining + plan.cards;
      const updatedUser = await updateUserData(user.email, user.name, plan.name, updatedCardsRemaining);
      setUser(updatedUser);
      console.log(`Added ${plan.cards} cards. New total: ${updatedCardsRemaining}`);
      setTimeout(() => {
        setShowPaymentForm(false);
      }, 3000); // Hide payment form after 3 seconds
    } catch (error) {
      console.error('Error updating user plan:', error);
    }
  };

  

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">No user data available. Please try signing in again.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="starry-background"></div>
      <header className="bg-gray-900 bg-opacity-80 shadow relative z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-400">AI</span>
            <span className="text-red-500">Cards</span>
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-300">Welcome, {user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
  
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-800 bg-opacity-80 shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Current Plan: {user?.plan_name}</h2>
                <p className="text-lg">Cards Remaining: {user?.cards_remaining}</p>
                {user?.plan_name === 'Free Plan' && user?.cards_remaining === 4 && (
                  <p className="text-green-400 font-semibold mt-2">Welcome! Here are your 4 free cards to get started!</p>
                )}
              </div>
              
              <div className="flex space-x-4">
                <div className="group relative">
                  <button
                    onClick={() => handleUpgrade('Basic')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Upgrade to Basic
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    $1 for 10 cards
                  </div>
                </div>
                <div className="group relative">
                  <button
                    onClick={() => handleUpgrade('Premium')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Upgrade to Premium
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    $5 for 50 cards
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Generate a New Card</h3>
              {user?.cards_remaining > 0 ? (
                <div className="flex">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your card prompt"
                    className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                  <button
                    onClick={handleGenerateCard}
                    className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-900 border-l-4 border-yellow-500 text-yellow-200 p-4 mb-4" role="alert">
                  <p className="font-bold">Warning</p>
                  <p>You have no remaining cards. Please purchase more credits to continue generating cards.</p>
                  <Link href="/plans-and-pricing" className="text-blue-400 hover:text-blue-300 underline">
                    View Plans and Pricing
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {showPaymentForm && clientSecret && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Complete Your Payment</h3>
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
    </div>
  );
};

export default Dashboard;