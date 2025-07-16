import React from 'react';
import { Service } from '../types';
import { Check, Plus, X } from 'lucide-react';

interface ServiceSelectionProps {
  services: Service[];
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
  onProceed: () => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ 
  services, 
  selectedServices, 
  onServiceToggle,
  onProceed 
}) => {
  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.durationMin), 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseFloat(service.price || '0'), 0);
  };

  const formatPrice = (price: string) => {
    const numPrice = Number(price);
    return numPrice === 0 ? 'Free' : `$${numPrice}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Services</h2>
      <p className="text-gray-600 mb-6">Select one or more services you&apos;d like to book. You can combine multiple services into a single appointment.</p>
      
      <div className="space-y-4 mb-6">
        {services.map((service) => {
          const selected = isServiceSelected(service.id);
          return (
            <div
              key={service.id}
              onClick={() => onServiceToggle(service)}
              className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selected 
                  ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selected 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}>
                    {selected ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <Plus className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold transition-colors ${
                      selected ? 'text-indigo-700' : 'text-gray-900 group-hover:text-indigo-600'
                    }`}>
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mt-2">{service.description}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-lg font-bold ${selected ? 'text-indigo-700' : 'text-indigo-600'}`}>
                    {formatPrice(service.price)}
                  </div>
                  <div className="text-sm text-gray-500">{service.durationMin} min</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">Selected Services ({selectedServices.length})</h3>
          <div className="space-y-3 mb-4">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-600">{service.durationMin} min</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-indigo-700">{formatPrice(service.price)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceToggle(service);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-indigo-200 pt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-indigo-700">Total Duration: <span className="font-semibold">{getTotalDuration()} minutes</span></p>
            </div>
            <div>
              <p className="text-lg font-bold text-indigo-900">
                Total: {getTotalPrice() === 0 ? 'Free' : `$${getTotalPrice()}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Proceed Button */}
      <button
        onClick={onProceed}
        disabled={selectedServices.length === 0}
        className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
          selectedServices.length > 0
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        <span>Continue to Calendar</span>
        {selectedServices.length > 0 && <span>({selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''})</span>}
      </button>
    </div>
  );
};

export default ServiceSelection;