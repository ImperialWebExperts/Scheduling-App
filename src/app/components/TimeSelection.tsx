import React from 'react';
import { SelectedServices, Availability } from '../types';
import generateTimeSlots from '../lib/generateTimeSlots';

interface TimeSelectionProps {
  selectedServices: SelectedServices | null;
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
    
    const dayOfWeek = selectedDate.getDay();
    // Use a default duration if no service is selected
    const serviceDuration = selectedServices && selectedServices.services.length > 0 
      ? parseInt(selectedServices.services[0].durationMin) 
      : 30;
    
    // Get all availability slots for this day
    const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek);
    console.log(dayAvailability)
    // Generate time slots for each availability period and combine them
    const allSlots: string[] = [];
    
    dayAvailability.forEach(({ startTime, endTime }) => {
      // Skip if it's marked as closed
      if (startTime === 'Closed' || endTime === 'Closed') return;
      
      const slots = generateTimeSlots(startTime, endTime, serviceDuration);
      allSlots.push(...slots);
    });
    
    // Remove duplicates and sort
    const uniqueSlots = [...new Set(allSlots)];
    
    // Sort the time slots chronologically
    uniqueSlots.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a}`);
      const timeB = new Date(`1970/01/01 ${b}`);
      return timeA.getTime() - timeB.getTime();
    });
    
    return uniqueSlots;
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
            {selectedServices?.services[0]?.name || 'Service'}
          </p>
          <p className="text-sm text-indigo-600">
            {formatDate(selectedDate)} • {selectedServices?.totalDuration || 0} min • {selectedServices?.totalPrice === 0 ? 'Free' : `${selectedServices?.totalPrice || 0}`}
          </p>
        </div>
      </div>
      
      {availableTimes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No available times for this date.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default TimeSelection;