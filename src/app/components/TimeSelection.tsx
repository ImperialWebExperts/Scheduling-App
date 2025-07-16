import React from 'react';
import { Service, Availability } from '../types';
import generateTimeSlots from '../lib/generateTimeSlots';

interface TimeSelectionProps {
  selectedServices: Service[];
  selectedDate: Date | null;
  availability: Availability[];
  onTimeSelect: (time: string) => void;
  onBack: () => void;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  selectedServices,
  selectedDate,
  availability,
  onTimeSelect,
  onBack
}) => {
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.durationMin), 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseFloat(service.price || '0'), 0);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const getAvailableTimes = () => {
    if (!selectedDate) return [];
    
    return availability
      .filter(a => a.dayOfWeek === selectedDate.getDay())
      .flatMap(({ startTime, endTime }) => generateTimeSlots(startTime, endTime));
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← Back to calendar
      </button>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Time</h2>
        
        {/* Booking Summary */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-indigo-900">
                {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : ''} Selected
              </p>
              <p className="text-sm text-indigo-600">{formatDate(selectedDate)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-indigo-900">{formatPrice(getTotalPrice())}</p>
              <p className="text-sm text-indigo-600">{getTotalDuration()} min total</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div key={service.id} className="flex justify-between items-center text-sm bg-white rounded px-3 py-2">
                <span className="text-gray-800">{index + 1}. {service.name}</span>
                <div className="text-right">
                  <span className="text-gray-600">{service.durationMin} min</span>
                  {parseFloat(service.price || '0') > 0 && (
                    <span className="ml-2 text-indigo-600">${service.price}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {getAvailableTimes().map(time => (
          <button
            key={time}
            onClick={() => onTimeSelect(time)}
            className="text-[#23508e] p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 text-center"
          >
            {time}
          </button>
        ))}
      </div>

      {getAvailableTimes().length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No available time slots for this date.</p>
          <p className="text-sm text-gray-400 mt-2">Please select a different date.</p>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;