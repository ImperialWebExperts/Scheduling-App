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
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-indigo-900">
                {selectedServices.services.length} Service{selectedServices.services.length !== 1 ? 's' : ''} Selected
              </p>
              <p className="text-sm text-indigo-600">
                {formatDate(selectedDate)} • {selectedServices.totalDuration} min • {selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice.toFixed(2)}`}
              </p>
            </div>
          </div>
          {selectedServices.services.length > 1 && (
            <div className="mt-2 pt-2 border-t border-indigo-200">
              <p className="text-xs text-indigo-700 font-medium">Services:</p>
              <div className="text-xs text-indigo-600">
                {selectedServices.services.map(service => service.name).join(' • ')}
              </div>
            </div>
          )}
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
          <p className="text-gray-500">No available time slots for the selected date and duration.</p>
          <p className="text-sm text-gray-400 mt-2">
            Your appointment duration is {selectedServices.totalDuration} minutes. Try selecting a different date.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;