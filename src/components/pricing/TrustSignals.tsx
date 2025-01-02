import React from 'react';

export const TrustSignals = () => {
  return (
    <div className="mt-16 text-center">
      <p className="text-gray-400 mb-4">Vertrouwd door toonaangevende bedrijven</p>
      <div className="flex justify-center items-center space-x-8 opacity-50 hover:opacity-75 transition-opacity">
        <div className="text-gray-500">TechCorp</div>
        <div className="text-gray-500">InnovateCo</div>
        <div className="text-gray-500">FutureTech</div>
      </div>
    </div>
  );
};