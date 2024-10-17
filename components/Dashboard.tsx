import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
}

interface Plan {
  name: string;
  cardsRemaining: number;
}

interface DashboardProps {
  user: User;
  plan: Plan;
  onUpdateUserData: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, plan, onUpdateUserData }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCard, setGeneratedCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate card');
      }

      const data = await response.json();
      setGeneratedCard(data);
      onUpdateUserData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (generatedCard && generatedCard.pdf_data) {
      try {
        const byteCharacters = atob(generatedCard.pdf_data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'greeting_card.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download PDF:', err);
        setError('Failed to download PDF. Please try again.');
      }
    } else {
      setError('No PDF data available. Please generate a card first.');
    }
  };

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
                disabled={isLoading || plan.cardsRemaining === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out disabled:bg-gray-400"
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          
          {generatedCard && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Your Generated Card</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Front Page</h4>
                  <img src={generatedCard.front_image_url} alt="Front of the card" className="w-full h-auto rounded-lg shadow-md" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Inside Page</h4>
                  <img src={generatedCard.inside_image_url} alt="Inside of the card" className="w-full h-auto rounded-lg shadow-md" />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-block px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;