import React from 'react';
import { Availability, SelectedServices } from '../types';
import generateTimeSlots from '../lib/generateTimeSlots';

interface TimeSelectionProps {
  selectedServices: SelectedServices;
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

  const formatTotalPrice = () => {
    return selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice}`;
  };

  const getAvailableTimes = () => {
    if (!selectedDate) return [];
    
    return availability
      .filter(a => a.dayOfWeek === selectedDate.getDay())
      .flatMap(({ startTime, endTime }) => 
        generateTimeSlots(startTime, endTime, selectedServices.totalDuration)
      );
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
        <div className="bg-indigo-50 rounded-lg p-3 mb-4">
          <p className="font-semibold text-indigo-900">
            {selectedServices.services.length} Service{selectedServices.services.length > 1 ? 's' : ''} Selected
          </p>
          <p className="text-sm text-indigo-600 mb-2">
            {formatDate(selectedDate)} • {selectedServices.totalDuration} min • {formatTotalPrice()}
          </p>
          <div className="text-sm text-indigo-700">
            {selectedServices.services.map(service => service.name).join(', ')}
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
    </div>
  );
};

export default TimeSelection;