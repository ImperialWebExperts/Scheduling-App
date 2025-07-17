import React from 'react';
import { Service, SelectedServices } from '../types';
import { Check, X } from 'lucide-react';

interface ServiceSelectionProps {
  services: Service[];
  selectedServices: SelectedServices;
  onServiceToggle: (service: Service) => void;
  onContinue: () => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ 
  services, 
  selectedServices,
  onServiceToggle,
  onContinue
}) => {
  const isServiceSelected = (service: Service) => {
    return selectedServices.services.some(s => s.id === service.id);
  };

  const formatPrice = (price: string) => {
    return Number(price) === 0 ? 'Free' : price;
  };

  const formatTotalPrice = () => {
    return selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Services</h2>
      
      {selectedServices.services.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-indigo-900 mb-2">Selected Services</h3>
          <div className="space-y-2">
            {selectedServices.services.map((service) => (
              <div key={service.id} className="flex items-center justify-between text-sm">
                <span className="text-indigo-800">{service.name}</span>
                <button
                  onClick={() => onServiceToggle(service)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-indigo-200 mt-3 pt-3 flex justify-between text-sm font-semibold text-indigo-900">
            <span>Total: {selectedServices.totalDuration} min</span>
            <span>{formatTotalPrice()}</span>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {services.map((service) => {
          const isSelected = isServiceSelected(service);
          return (
            <div
              key={service.id}
              onClick={() => onServiceToggle(service)}
              className={`border rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group ${
                isSelected 
                  ? 'border-indigo-300 bg-indigo-50' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <h3 className={`text-xl font-semibold transition-colors ${
                    isSelected 
                      ? 'text-indigo-600' 
                      : 'text-gray-900 group-hover:text-indigo-600'
                  }`}>
                    {service.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">
                    {formatPrice(service.price)}
                  </div>
                  <div className="text-sm text-gray-500">Duration: {service.durationMin} min</div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{service.description}</p>
            </div>
          );
        })}
      </div>

      {selectedServices.services.length > 0 && (
        <button
          onClick={onContinue}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Continue with {selectedServices.services.length} service{selectedServices.services.length > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};

export default ServiceSelection;