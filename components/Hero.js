import { useSession, signIn } from "next-auth/react"
import { useRouter } from 'next/router'

export default function Hero() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleGenerateYourCard = () => {
    if (session) {
      router.push('/maindashboard')
    } else {
      signIn('google')
    }
  }

  return (
    <section className="bg-gradient-to-b from-gray-950 via-gray-800 to-gray-700 text-white py-20">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-4">
          Where <span className="text-blue-400">AI</span> brings greetings to life
        </h1>
        <p className="text-xl mb-8">
          AICards creates personalized greeting cards for all your special occasions!
        </p>
        <button 
          onClick={handleGenerateYourCard}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold"
        >
          Generate your card
        </button>
      </div>
    </section>
  )
}