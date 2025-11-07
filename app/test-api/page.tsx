'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiCall = async () => {
    setIsLoading(true);
    setResult('Loading...');
    try {
      const response = await fetch('https://news02.onrender.com/api/topics/popular_all');
      const status = response.status;
      const statusText = response.statusText;
      let responseBody;
      try {
        responseBody = await response.json();
      } catch (e) {
        responseBody = await response.text();
      }

      if (response.ok) {
        setResult(`SUCCESS:\nStatus: ${status}\nResponse Body:\n${JSON.stringify(responseBody, null, 2)}`);
      } else {
        setResult(`ERROR:\nStatus: ${status} ${statusText}\nResponse Body:\n${JSON.stringify(responseBody, null, 2)}`);
      }

    } catch (error) {
      setResult(`FETCH FAILED:\n${(error as Error).message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">API Test Page for /api/topics/popular_all</h1>
      <p className="mb-4">Click the button to make a direct, raw API call from the frontend.</p>
      <button 
        onClick={testApiCall} 
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-zinc-600"
      >
        {isLoading ? 'Testing...' : 'Test API Call'}
      </button>
      <div className="mt-8 p-4 bg-zinc-800 rounded-md">
        <h2 className="font-bold mb-2">API Result:</h2>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
    </div>
  );
}
