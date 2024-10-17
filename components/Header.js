import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/router'

export default function Header({ scrollToCards, scrollToPrompts, scrollToPlansandPricing }) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleAuth = async () => {
    if (session) {
      await signOut({ redirect: false })
      router.push('/')
    } else {
      await signIn('google')
    }
  }

  const handleNavigation = (action) => {
    if (router.pathname === '/') {
      action()
    } else {
      router.push('/').then(() => {
        setTimeout(action, 100)
      })
    }
  }

  return (
    <header className="bg-black text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold">
              <span className="text-blue-400">AI</span>
              <span className="text-red-500">Cards</span>
            </div>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <button onClick={() => handleNavigation(scrollToCards)} className="hover:text-gray-300">
                    Sample Cards
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation(scrollToPrompts)} className="hover:text-gray-300">
                    Sample Prompts
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation(scrollToPlansandPricing)} className="hover:text-gray-300">
                    Plans and pricing
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          <button 
            onClick={handleAuth}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            {session ? 'Log out' : 'Log in'}
          </button>
        </div>
      </div>
    </header>
  )
}