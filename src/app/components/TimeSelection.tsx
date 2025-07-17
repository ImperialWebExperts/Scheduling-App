import React from 'react';
import { SelectedServices, Availability } from '../types';

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

  const generateTimeSlots = (start: string, end: string, serviceDuration: number = 30): string[] => {
    const slots: string[] = [];

    // Parse 24-hour format time (HH:MM)
    const parseTime24 = (timeStr: string) => {
      const [hourStr, minuteStr] = timeStr.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      return date;
    };

    // Format time to 12-hour format for display
    const formatTime12 = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };

    const startTime = parseTime24(start);
    const endTime = parseTime24(end);
    
    const current = new Date(startTime);
    
    // Generate slots ensuring there's enough time for the full service duration
    while (current.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
      slots.push(formatTime12(new Date(current)));
      current.setMinutes(current.getMinutes() + 30); // 30-minute intervals
    }

    return slots;
  };

  const getAvailableTimes = () => {
    if (!selectedDate) return [];
    
    // Use the selected service duration, or default to 30 minutes
    const serviceDuration = selectedServices ? parseInt(selectedServices.durationMin) : 30;
    
    return availability
      .filter(a => a.dayOfWeek === selectedDate.getDay() && a.startTime !== 'Closed')
      .flatMap(({ startTime, endTime }) => generateTimeSlots(startTime, endTime, serviceDuration));
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
          <p className="font-semibold text-indigo-900">{selectedServices?.name}</p>
          <p className="text-sm text-indigo-600">
            {formatDate(selectedDate)} • {selectedServices?.durationMin} min • {Number(selectedServices?.price) === 0 ? 'Free' : selectedServices?.price}
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
          <p className="text-gray-500 mb-2">No available times for this date</p>
          <p className="text-sm text-gray-400">Please select a different date or check back later</p>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;