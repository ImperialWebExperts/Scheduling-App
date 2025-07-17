import React from 'react';
import { Service } from '../types';
import { Check, Plus, Minus } from 'lucide-react';

interface ServiceSelectionProps {
  services: Service[];
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
  onContinue: () => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ 
  services, 
  selectedServices,
  onServiceToggle,
  onContinue
}) => {
  // Add a null check for services
  if (!services || services.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Services</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  const isServiceSelected = (service: Service) => {
    return selectedServices.some(s => s.id === service.id);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.durationMin), 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseFloat(service.price), 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Services</h2>
      <p className="text-gray-600 mb-6">Select one or more services for your appointment</p>
      
      <div className="space-y-4 mb-6">
        {services.map((service) => {
          const isSelected = isServiceSelected(service);
          return (
            <div
              key={service.id}
              onClick={() => onServiceToggle(service)}
              className={`border rounded-xl p-6 cursor-pointer group transition-all duration-200 ${
                isSelected 
                  ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500' 
                      : 'border-gray-300 group-hover:border-indigo-400'
                  }`}>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Plus className={`w-4 h-4 ${
                        isSelected ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'
                      }`} />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-semibold transition-colors ${
                      isSelected 
                        ? 'text-indigo-900' 
                        : 'text-gray-900 group-hover:text-indigo-600'
                    }`}>
                      {service.name}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    isSelected ? 'text-indigo-600' : 'text-indigo-600'
                  }`}>
                    {Number(service?.price) === 0 ? 'Free' : `$${service?.price}`}
                  </div>
                  <div className="text-sm text-gray-500">Duration: {service.durationMin} min</div>
                </div>
              </div>
              <p className={`transition-colors ${
                isSelected ? 'text-indigo-800' : 'text-gray-600'
              }`}>
                {service.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Selected Services ({selectedServices.length})</h4>
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{service.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">{service.durationMin} min</span>
                  <span className="text-indigo-600 font-medium">
                    {Number(service.price) === 0 ? 'Free' : `$${service.price}`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceToggle(service);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <div className="text-right">
              <div className="font-semibold text-indigo-600">
                {getTotalPrice() === 0 ? 'Free' : `$${getTotalPrice().toFixed(2)}`}
              </div>
              <div className="text-sm text-gray-600">{getTotalDuration()} minutes</div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={selectedServices.length === 0}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          selectedServices.length > 0
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue to Calendar ({selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected)
      </button>
    </div>
  );
};

export default ServiceSelection;