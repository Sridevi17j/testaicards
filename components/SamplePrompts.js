import React from 'react';

const prompts = [
  { category: 'Birthday', examples: ['Birthday card for my friend Sam', 'Birthday card to my son Alex'] },
  { category: 'Anniversary', examples: ['Wedding Anniversary Card for my wife Sarah', 'Work Anniversary card to my colleague Sunil'] },
  { category: 'Christmas', examples: ['Christmas card for my family', 'Christmas card to my mom'] },
  { category: 'Halloween', examples: ['Halloween Card for my boss Nikit', 'Halloween Card'] },
  { category: 'Holiday', examples: ['New Year Card for my family', 'Diwali Card for my brother Anish'] },
  { category: "Mother's, Father's Day", examples: ["Mother's Day card for mom", "Father's Day card for dad"] },
];

export default function SamplePrompts() {
  return (
    <section className="bg-gradient-to-b from-gray-600 via-gray-550 to-gray-500 text-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Sample Prompts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">{prompt.category}</h3>
              <ul className="list-disc list-inside">
                {prompt.examples.map((example, idx) => (
                  <li key={idx} className="text-gray-700 mb-2">{example}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}