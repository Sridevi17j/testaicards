import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useSession, signOut } from 'next-auth/react'
import PaymentModal from '../components/PaymentModal'
import Dashboard from '../components/Dashboard'
import { useRouter } from 'next/router'


const CircleLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
  </div>
);

export default function MainPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const pricingPlans = [
    { name: 'Basic', price: 5, cards: 20, color: 'bg-blue-500' },
    { name: 'Standard', price: 10, cards: 50, color: 'bg-green-500' },
    { name: 'Premium', price: 20, cards: 100, color: 'bg-purple-500' }
  ]

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else if (session?.user?.email) {
      fetchUserData(session.user.email)
    } else {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchUserData = async (email) => {
    try {
      const response = await fetch(`/api/user?email=${email}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan)
    setIsPaymentModalOpen(true)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/') // Redirect to the index page after logout
  }

  if (isLoading) {
    return <CircleLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>AICardify - AI Greeting Card Generator</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-red-600 mr-8">Cardif<span className="text-blue-600">AI</span></div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {session?.user?.name || 'Guest'}</span>
            <button 
              onClick={handleLogout}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main>
        {userData && userData.plan_name ? (
          <Dashboard 
            user={{
              id: userData.id,
              name: session?.user?.name || 'User'
            }}
            plan={{
              name: userData.plan_name, 
              cardsRemaining: userData.cards_remaining
            }} 
            onUpdateUserData={() => fetchUserData(session?.user?.email)}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Greeting Card Generator</h1>
              <p className="text-xl text-gray-600 mb-2">Create personalized greeting cards in seconds!</p>
              <p className="text-gray-500">Choose a plan that fits your needs and start creating amazing cards today.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
            <section className="bg-gradient-to-b from-gray-600 via-gray-550 to-gray-500 text-white py-20">

              {pricingPlans.map((plan, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className={`${plan.color} text-white p-6 text-center`}>
                    <h3 className="text-2xl font-semibold">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
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
        )}
      </main>

      <footer className="bg-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500">
          <p>&copy; 2024 AICardify. All rights reserved.</p>
        </div>
      </footer>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
        userEmail={session?.user?.email}
        userName={session?.user?.name}
      />
    </div>
  )
}