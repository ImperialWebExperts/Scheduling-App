import React from 'react';
import { Clock, Check, Globe, Shield, Zap } from 'lucide-react';
import { SelectedServices } from '../types';

interface InfoPanelProps {
  selectedServices: SelectedServices;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedServices }) => {
  const formatTotalPrice = () => {
    return selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Book a meeting with 
          <span className="text-indigo-600"> Imperial Web Experts</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Web Development & Digital Business Solutions. Let&apos;s discuss your project and how we can help bring your vision to life.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-indigo-600" />
          {selectedServices.services.length > 0 
            ? `${selectedServices.services.length} Service${selectedServices.services.length > 1 ? 's' : ''} Selected`
            : 'Multiple Services Available'
          }
        </h3>
        
        {selectedServices.services.length > 0 && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-indigo-900">Total Duration:</span>
              <span className="text-indigo-700">{selectedServices.totalDuration} min</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-indigo-900">Total Price:</span>
              <span className="text-indigo-700">{formatTotalPrice()}</span>
            </div>
            <div className="text-sm text-indigo-600 mt-2">
              Services: {selectedServices.services.map(s => s.name).join(', ')}
            </div>
          </div>
        )}

        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            Custom website designs that don&apos;t just look good but also convert visitors into customers
          </li>
          <li className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            Website hosting & maintenance services to keep your site running smoothly
          </li>
          <li className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            Automated booking system to streamline your scheduling process
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <Globe className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Clear</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <Shield className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Secure</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <Zap className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Instant</p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;