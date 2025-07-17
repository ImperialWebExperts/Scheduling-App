// src/app/components/TimeSelection.tsx
import React from 'react';
import { Service, Availability, Appointment } from '../types';
import generateTimeSlots from '../lib/generateTimeSlots';

interface TimeSelectionProps {
  selectedService: Service | null;
  selectedDate: Date | null;
  availability: Availability[];
  existingAppointments: Appointment[];
  onTimeSelect: (time: string) => void;
  onBack: () => void;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  selectedService,
  selectedDate,
  availability,
  existingAppointments,
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
    if (!selectedDate || !selectedService) return [];
    
    const serviceDuration = parseInt(selectedService.durationMin);
    
    return availability
      .filter(a => a.dayOfWeek === selectedDate.getDay())
      .flatMap(({ startTime, endTime }) => 
        generateTimeSlots(startTime, endTime, serviceDuration, selectedDate, existingAppointments)
      );
  };

  const availableTimes = getAvailableTimes();

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
          <p className="font-semibold text-indigo-900">{selectedService?.name}</p>
          <p className="text-sm text-indigo-600">
            {formatDate(selectedDate)} • {selectedService?.durationMin} min • {Number(selectedService?.price) === 0 ? 'Free' : selectedService?.price}
          </p>
        </div>
      </div>
      
      {availableTimes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {availableTimes.map(time => (
            <button
              key={time}
              onClick={() => onTimeSelect(time)}
              className="text-[#23508e] p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 text-center"
            >
              {time}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No available times for this date</p>
          <p className="text-sm text-gray-400">
            Please select a different date or try a shorter service duration
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;