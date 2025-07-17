import React from 'react';
import { Service } from '../types';

interface ServiceSelectionProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ services, onServiceSelect }) => {
  // Add a null check for services
  if (!services || services.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Service</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Service</h2>
      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onServiceSelect(service)}
            className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {service.name}
              </h3>
              <div className="text-right">
                <div className="text-lg font-bold text-indigo-600">
                  {Number(service?.price) === 0 ? 'Free' : service?.price}
                </div>
                <div className="text-sm text-gray-500">Duration: {service.durationMin} min</div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection;