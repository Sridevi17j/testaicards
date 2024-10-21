import Image from 'next/image'
import { useState } from 'react'

const cards = [
  { id: 1, title: 'Christmas Card', image: '/images/cards/christmas-card-1.jpg' },
  { id: 2, title: 'Cheers to Success Card', image: '/images/cards/cheers-to-success-card-1.jpg' },
  { id: 3, title: 'Halloween Card', image: '/images/cards/halloween-card-2.jpg' },
  { id: 4, title: "Valentine's Day Card", image: '/images/cards/valentines-day-card-1.jpg' },
  { id: 5, title: 'Easter Card', image: '/images/cards/easter-card-1.jpg' },
  { id: 7, title: "Mother's Day Card", image: '/images/cards/mothers-day-card-1.jpg' },
  { id: 7, title: 'Appreciation Card', image: '/images/cards/appreciation-card-1.jpg' },
  { id: 8, title: "Father's Day Card", image: '/images/cards/fathers-day-card-1.jpg' },
  { id: 9, title: 'Christmas Card', image: '/images/cards/christmas-card-2.jpg' },
  { id: 10, title: 'Miss You Card', image: '/images/cards/miss-you-card-1.jpg' },
  { id: 11, title: 'Halloween Card', image: '/images/cards/halloween-card-1.jpg' },
  { id: 12, title: 'Birthday Card', image: '/images/cards/birthday-card-2.jpg' },
  { id: 13, title: 'Thank You Card', image: '/images/cards/thank-you-card-1.jpg' },
  { id: 14, title: "Friendship Day Card", image: '/images/cards/friendship-day-card-1.jpg' },
  { id: 15, title: 'Get Well Soon Card', image: '/images/cards/get-well-soon-card-1.jpg' },
  { id: 16, title: 'Birthday Card', image: '/images/cards/birthday-card-1.jpg' },
  { id: 17, title: 'Christmas Card', image: '/images/cards/christmas-card-3.jpg' },
  { id: 18, title: "Valentine's Day Card", image: '/images/cards/valentines-day-card-2.jpg' },
  { id: 19, title: 'Baby Shower Card', image: '/images/cards/baby-shower-card-1.jpg' },
  { id: 20, title: 'Sorry Card', image: '/images/cards/sorry-card-1.jpg' }

]



export default function SampleCards() {
  const [enlargedImage, setEnlargedImage] = useState(null)

  const handleImageClick = (id) => {
    setEnlargedImage(enlargedImage === id ? null : id)
  }

  return (
    <section className="bg-gradient-to-b from-gray-700 via-gray-600 to-gray-600 text-white py-16 pt-8">
      <style jsx global>{`
        @keyframes hoverAnimation {
          0% {
            transform: translateX(-2px) scale(1.05);
          }
          50% {
            transform: translateX(2px) scale(1.05);
          }
          100% {
            transform: translateX(-2px) scale(1.05);
          }
        }
      `}</style>
      <h2 className="text-3xl font-bold text-center mb-8">Sample Cards</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative cursor-pointer transition-all duration-300 ease-in-out rounded-lg shadow-md
              ${enlargedImage === card.id ? 'scale-110 z-10' : 'hover:animate-hoverAnimation'}
            `}
            onClick={() => handleImageClick(card.id)}
          >
            <div className="aspect-[3/4] w-full overflow-hidden rounded-lg">
              <div className="w-full h-full relative">
                <Image
                  src={card.image}
                  alt={`Sample card ${card.id}`}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}