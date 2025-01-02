import React from 'react';
import { Shield, Clock } from 'lucide-react';

export const PricingHeader = () => {
  return (
    <div className="text-center mb-16 animate-fadeIn">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
        Transformeer Je Content met AI
      </h1>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-4">
        Al meer dan <span className="font-bold text-purple-300">1,000+ tevreden gebruikers</span> vertrouwen op onze AI voor hun content
      </p>
      <div className="flex justify-center items-center space-x-4 text-sm text-gray-400">
        <Shield className="h-4 w-4" />
        <span>7 dagen gratis uitproberen</span>
        <Clock className="h-4 w-4" />
        <span>Direct toegang</span>
      </div>
    </div>
  );
};