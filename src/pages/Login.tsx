import { useState } from 'react';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-12 max-w-2xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-emerald-400">THANK YOU FOR WORKING</h1>
        <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
          YOU CAN NOW CLAIM GCASH CREDIT ON THIS SITE INSTEAD:
        </p>
        <a 
          href="https://gcashcabin.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-transform hover:scale-105"
        >
          https://gcashcabin.vercel.app/
        </a>
      </div>
    </div>
  );
}
