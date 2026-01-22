'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BlogCTA() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log('Subscribing:', email);
    setEmail('');
  };

  return (
    <section className="py-20 px-4 md:px-10 bg-orange-500">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Stay Informed
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Get the latest real estate insights delivered to your inbox every week.
        </p>
        
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 py-6 px-4 rounded-full border-0 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-white"
          />
          <Button
            type="submit"
            className="bg-[#1B1B1B] text-white rounded-full px-8 py-6 hover:bg-gray-800 font-semibold whitespace-nowrap"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}


