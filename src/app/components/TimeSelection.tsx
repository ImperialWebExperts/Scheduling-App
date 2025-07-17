// src/app/components/TimeSelection.tsx
import React from 'react';
import { SelectedServices, Availability, Appointment } from '../types';
import generateTimeSlots from '../lib/generateTimeSlots';

interface TimeSelectionProps {
  selectedServices: SelectedServices;
  selectedDate: Date | null;
  availability: Availability[];
  existingAppointments: Appointment[];
  onTimeSelect: (time: string) => void;
  onBack: () => void;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  selectedServices,
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
    if (!selectedDate || selectedServices.services.length === 0) return [];
    
    const serviceDuration = selectedServices.totalDuration;
    const dayOfWeek = selectedDate.getDay();
    
    // Find availability for the selected day
    const dayAvailability = availability.filter(a => 
      a.dayOfWeek === dayOfWeek && a.startTime !== 'Close'
    );
    
    if (dayAvailability.length === 0) {
      return [];
    }
    
    // Generate time slots for each availability period and combine them
    const allSlots = [];
    
    for (const avail of dayAvailability) {
      const slots = generateTimeSlots(
        avail.startTime, 
        avail.endTime, 
        serviceDuration, 
        selectedDate, 
        existingAppointments
      );
      allSlots.push(...slots);
    }
    
    // Remove duplicates and sort
    const uniqueSlots = [...new Set(allSlots)];
    
    // Sort the slots chronologically
    return uniqueSlots.sort((a, b) => {
      const timeA = new Date(`1970-01-01 ${a}`);
      const timeB = new Date(`1970-01-01 ${b}`);
      return timeA.getTime() - timeB.getTime();
    });
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
          <p className="font-semibold text-indigo-900">
            {selectedServices.services.length} Service{selectedServices.services.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm text-indigo-600">
            {formatDate(selectedDate)} • {selectedServices.totalDuration} min • {selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice.toFixed(2)}`}
          </p>
          {selectedServices.services.length > 1 && (
            <div className="mt-2 text-xs text-indigo-700">
              {selectedServices.services.map(service => service.name).join(' • ')}
            </div>
          )}
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