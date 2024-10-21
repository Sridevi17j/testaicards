import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const prompts = [
    { 
      category: 'Thank You Card', 
      shortPrompt: 'Thank You Card with Sunflowers',
      fullPrompt: 'A cheerful "Thank You" card with sunflowers and bright colors, featuring the text "Thanks, John! Your help meant the world to me." in a friendly and warm style.',
      image: '/images/cards/thank-you-card-1.jpg'
    },
    { 
        category: 'Christmas Card', 
        shortPrompt: 'Christmas Card for friend',
        fullPrompt: "A center page of the Christmas greeting card with text 'Dear Sara, Wishing you all the happiness your holiday can hold ' written on the card",
        image: '/images/cards/christmas-card-3.jpg'
    },
    { 
        category: 'Birthday Card', 
        shortPrompt: 'Birthday Card for friend',
        fullPrompt: "Generate a front page of the birthday greeting card with message 'Happy Birthday James' on the card",
        image: '/images/cards/birthday-card-2.jpg'
    },
    { 
      category: 'Get Well Soon Card', 
      shortPrompt: 'Get Well Soon Card for friend',
      fullPrompt: 'A soothing "Get Well Soon" card with soft pastels and flowers, featuring the message "Wishing you a speedy recovery, Lily. Get well soon!" in a gentle, caring font.',
      image: '/images/cards/get-well-soon-card-1.jpg'
    },
    { 
      category: "Valentine's Day Card", 
      shortPrompt: "Valentine's Day Card with Roses",
      fullPrompt: 'A realistic Valentine\'s Day card featuring fresh red roses, candles, and a heart-shaped chocolate box. The message "Hi Mila, My heart is and always will be yours." is in a handwritten-style font.',
      image: '/images/cards/valentines-day-card-1.jpg'
    },
    { 
      category: 'Halloween Card', 
      shortPrompt: 'Halloween Card with Spooky House',
      fullPrompt: 'A Halloween card with a spooky house, pumpkins, and bats flying in the sky. The message "Happy Halloween, Jake! Stay spooky!" is written in a playful, eerie font.',
      image: '/images/cards/halloween-card-1.jpg'
    },
    { 
      category: "Father's Day Card", 
      shortPrompt: "Father's Day Card with Watch and Tools",
      fullPrompt: 'A Father\'s Day card with a realistic watch, tools, and a tie. The message "Hi Dad, Happy Father\'s Day, You\'re the best dad ever." is written in bold, classic text.',
      image: '/images/cards/fathers-day-card-1.jpg'
    },
    { 
      category: 'Easter Card', 
      shortPrompt: 'Easter Card with Eggs and Bunnies',
      fullPrompt: 'An Easter card with colorful eggs, bunnies, and spring flowers. The message "Happy Easter, Noah! Hope you have an egg-citing day!" is written in cheerful, playful text.',
      image: '/images/cards/easter-card-1.jpg'
    },
    { 
      category: 'Miss You Card', 
      shortPrompt: 'Missing You Card with Night Sky',
      fullPrompt: 'A center page of missing you card with text "I miss you badly, Come Soon, With Love Carter" written on the card with night sky and rain drop background',
      image: '/images/cards/miss-you-card-1.jpg'
    },
    { 
        category: 'Christmas Card', 
        shortPrompt: 'Christmas Card with Santa',
        fullPrompt: 'Generate the front page of the Christmas greeting card with the message "Merry Christmas" on the card.',
        image: '/images/cards/christmas-card-1.jpg'
    },
    { 
      category: 'Diwali Card', 
      shortPrompt: 'Diwali Card with Crackers',
      fullPrompt: 'A center page of Diwali greeting card with text "Happy Diwali Shriya.. with love Abi..." written bold text on the card with vibrant crackers and lights with diwali background',
      image: '/images/cards/diwali-card-1.jpg'
    },
    { 
        category: "Valentine's Day", 
        shortPrompt: "Valentine's Day Card",
        fullPrompt: "Generate the front page of the Valentine's Day greeting card with the message 'Happy Valentine's Day' on the card.",
        image: '/images/cards/valentines-day-card-2.jpg'
    },   
    { 
      category: 'Birthday Card', 
      shortPrompt: 'Birthday Card for Friend',
      fullPrompt: "A vibrant birthday card cover featuring colorful balloons, confetti, and a large cheerful cake with candles, all set against a bright and playful backdrop. The words 'Happy Birthday' are written in a whimsical, fun font with sparkling accents.",
      image: '/images/cards/birthday-card-1.jpg'
    },
    { 
      category: 'Anniversary Card', 
      shortPrompt: 'Wedding Anniversary Card',
      fullPrompt: "A front page of anniversary greeting card for my friend with text 'Happy Anniversary Jade and Emma. Wishing you both a lifetime of happiness.'  written in the card with lights candles and celebration in the background",
      image: '/images/cards/anniversary-card-1.jpg'
    },
    { 
      category: 'Halloween Card', 
      shortPrompt: 'Halloween Card for a family',
      fullPrompt: "A center page of the Halloween greeting card with text 'Trick or treat and be scary, may you have a Happy Halloween' written on the card",
      image: '/images/cards/halloween-card-2.jpg'
    },
    { 
      category: 'New Year Card', 
      shortPrompt: 'New Year Card for Family',
      fullPrompt: "A new year greeting card with text 'Happy New Year 2025!' written on the card with dazzling new year celebration background.",
      image: '/images/cards/new-year-card-1.jpg'
    },
    { 
      category: "Mother's Day Card", 
      shortPrompt: "Mother's Day Card",
      fullPrompt: "A mother's day card with Mother walking with her two children in a colorful meadow, viewed from behind. Soft sunset tones, wildflowers, and a warm message: 'Hey Mom, We Love You!'",
      image: '/images/cards/mothers-day-card-1.jpg'
    },
    { 
        category: 'Miss You Card', 
        shortPrompt: 'Missing You Card with Vibrant Background',
        fullPrompt: 'A center page of missing you greeting card with text "You\'re always on my mind Olive, no matter the distance." written bold text on the card with vibrant missing you feel background',
        image: '/images/cards/miss-you-card-2.jpg'
    },
    { 
        category: 'Anniversary Card', 
        shortPrompt: 'Work Anniversary Card',
        fullPrompt: 'A front page of work anniversary greeting card for my friend with text "Cheers to your 10th work anniversary, Here’s to more achievements!" written in the card with laptop, coffee cup, and office background',
        image: '/images/cards/anniversary-card-2.jpg'
    }
  ];

  export default function SamplePrompts() {
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const cardRef = useRef(null);
  
    useEffect(() => {
      function handleClickOutside(event) {
        if (cardRef.current && !cardRef.current.contains(event.target)) {
          setSelectedPrompt(null);
        }
      }
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [cardRef]);
  
    return (
      <section className="bg-gray-600 text-white py-16 pt-8 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Sample Prompts</h2>
          <div className="relative h-12 overflow-hidden">
            <div className="absolute left-0 w-16 h-full bg-gradient-to-r from-gray-600 to-transparent z-10"></div>
            <div className="absolute right-0 w-16 h-full bg-gradient-to-l from-gray-600 to-transparent z-10"></div>
            <div className="scroll-container">
              <div className="scroll-content flex items-center">
                {prompts.map((prompt, index) => (
                  <div 
                    key={index}
                    className="text-white text-base font-semibold cursor-pointer w-48 flex-shrink-0 text-center"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <span className="block truncate px-2">{prompt.category}</span>
                  </div>
                ))}
              </div>
              <div className="scroll-content flex items-center" aria-hidden="true">
                {prompts.map((prompt, index) => (
                  <div 
                    key={index + prompts.length}
                    className="text-white text-base font-semibold cursor-pointer w-48 flex-shrink-0 text-center"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <span className="block truncate px-2">{prompt.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {selectedPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div ref={cardRef} className="bg-gray-650 bg-opacity-90 p-6 rounded-lg shadow-xl max-w-2xl w-full">
              <h3 className="text-2xl font-bold text-white mb-4">{selectedPrompt.category}</h3>
              <p className="text-gray-200 mb-4">{selectedPrompt.fullPrompt}</p>
              <div className="relative w-full" style={{ height: '400px' }}>
                <Image
                  src={selectedPrompt.image}
                  alt={selectedPrompt.category}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
        <style jsx>{`
          .scroll-container {
            width: 200%;
            display: flex;
            overflow: hidden;
          }
          .scroll-content {
            width: 100%;
            animation: scroll 60s linear infinite;
          }
          .scroll-container:hover .scroll-content {
            animation-play-state: paused;
          }
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>
    );
  }