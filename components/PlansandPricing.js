import React from 'react';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/router';

const pricingPlans = [
    { name: 'Basic', price: 100, cards: 10, color: 'from-blue-300 to-blue-500', buttonColor: 'bg-blue-700' },
    { name: 'Premium', price: 500, cards: 50, color: 'from-purple-300 to-purple-500', buttonColor: 'bg-purple-800' }
];

export default function PlansAndPricing() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handlePlanSelection = async (plan) => {
    if (status === "unauthenticated") {
      // For new users, redirect to sign in
      const callbackUrl = `${window.location.origin}/maindashboard`;
      await signIn('google', { callbackUrl });
    } else {
      // For existing users, redirect to main dashboard
      router.push('/maindashboard');
    }
  };

  return (
    <section className="bg-gradient-to-b from-gray-600 via-gray-500 to-gray-400 text-white py-16 pt-8">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-8">Pay as you Go</h2>
        <p className="text-center text-gray-300 mb-12">Choose a plan that fits your needs and start creating amazing cards today.</p>
        
        <div className="flex flex-wrap justify-center gap-8">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="w-full sm:w-80 md:w-96">
              <div className={`bg-gradient-to-br ${plan.color} rounded-full p-8 text-white text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
                <div className="text-5xl font-bold mb-2">${plan.price / 100}</div>
                <p className="mb-6">{plan.cards} cards</p>
                <ul className="text-sm mb-8 text-left pl-4">
                  <li className="mb-2">✓ AI-powered designs</li>
                  <li className="mb-2">✓ Customizable templates</li>
                  <li>✓ {plan.cards} unique cards</li>
                </ul>
                <button 
                  onClick={() => handlePlanSelection(plan)}
                  className={`${plan.buttonColor} text-white font-bold py-2 px-6 rounded-full transition-all duration-300 hover:opacity-90`}
                >
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}