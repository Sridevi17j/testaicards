import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router';


const MessageDisplay = ({ message, type }) => {
  const bgColor = type === 'loading' ? 'bg-blue-100' : 'bg-yellow-100';
  const textColor = type === 'loading' ? 'text-blue-700' : 'text-yellow-700';
  const icon = type === 'loading' ? '🔄' : '⚠️';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className={`${bgColor} ${textColor} px-6 py-4 rounded-lg shadow-md max-w-sm w-full mx-4`}>
        <div className="flex items-center">
          <span className="text-2xl mr-2">{icon}</span>
          <p className="font-semibold">{message}</p>
        </div>
      </div>
    </div>
  );
  };

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [generatedCard, setGeneratedCard] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser(session.user);
      // Fetch user's plan data here
      fetchUserPlan(session.user.id);
    }else if (status === 'unauthenticated') {
      router.push('/index');  // Redirect to main page if not authenticated
    }
  }, [session, status, router]);

  const fetchUserPlan = async (userId) => {
    try {
      const response = await fetch(`/api/user-plan?userId=${userId}`);
      if (response.ok) {
        const planData = await response.json();
        setPlan(planData);
      } else {
        console.error('Failed to fetch user plan');
      }
    } catch (error) {
      console.error('Error fetching user plan:', error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCard = async () => {
    // TODO: Implement API call to generate card
    console.log('Generating card with prompt:', prompt);
    // Placeholder: set a dummy generated card
    setGeneratedCard('https://via.placeholder.com/400x300?text=Generated+Card');
  };
  useEffect(() => {
    // Set a timeout to redirect if plan doesn't load within 5 seconds
    const timeoutId = setTimeout(() => {
      if (!plan && !isLoading) {
        console.log('Plan data not loaded in time, redirecting...');
        router.push('/');
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [plan, isLoading, router]);
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <MessageDisplay message="Please sign in to view your dashboard." type="warning" />;
  }

  if (!plan) {
    return <MessageDisplay message="Loading your plan information..." type="loading" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sm:p-10">
          <h1 className="text-3xl font-bold text-white">Welcome, {user.name}!</h1>
          <p className="mt-2 text-white opacity-90">Ready to create some amazing cards?</p>
        </div>
        <div className="p-6 sm:p-10">
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800">Your Current Plan: {plan.name}</h2>
            <p className="text-blue-600 mt-2">Cards Remaining: {plan.cardsRemaining}</p>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Generate a New Card</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your card prompt"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleGenerateCard}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Generate
              </button>
            </div>
          </div>
          
          {generatedCard && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Your Generated Card</h3>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <img src={generatedCard} alt="Generated Card" className="w-full h-auto" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;