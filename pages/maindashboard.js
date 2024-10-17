import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">CardifAI</h1>
          <div className="flex items-center">
            <span className="mr-4">Welcome, {user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Current Plan: {user.plan_name}</h2>
            <p className="text-lg mb-4">Cards Remaining: {user.cards_remaining}</p>
            {user.plan_name === 'Free Plan' && user.cards_remaining === 4 && (
              <p className="text-green-600 font-semibold mb-4">Welcome! Here are your 4 free cards to get started!</p>
            )}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Generate a New Card</h3>
              {user.cards_remaining > 0 ? (
                <div className="flex">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your card prompt"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleGenerateCard}
                    className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              ) : (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                  <p className="font-bold">Warning</p>
                  <p>You have no remaining cards. Please purchase more credits to continue generating cards.</p>
                  <Link href="/plans-and-pricing" className="text-blue-600 hover:text-blue-800 underline">
                    View Plans and Pricing
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;