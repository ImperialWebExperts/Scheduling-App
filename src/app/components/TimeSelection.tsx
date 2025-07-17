// src/app/components/TimeSelection.tsx
import React from 'react';
import { SelectedServices, Availability, Appointment, Setting } from '../types';
import generateTimeSlots from '../lib/generateTimeSlots';

interface TimeSelectionProps {
  selectedServices: SelectedServices;
  selectedDate: Date | null;
  availability: Availability[];
  existingAppointments: Appointment[];
  settings?: Setting;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  selectedServices,
  selectedDate,
  availability,
  existingAppointments,
  settings,
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
    
    console.log('Getting available times for:', {
      selectedDate: selectedDate.toDateString(),
      selectedServices: selectedServices.services.map(s => s.name),
      totalDuration: selectedServices.totalDuration,
      existingAppointments: existingAppointments.length
    });
    
    const totalDuration = selectedServices.totalDuration;
    const bufferMinutes = settings?.bufferMinutes || 15;
    
    // Get availability for the selected day
    const dayAvailability = availability.filter(a => a.dayOfWeek === selectedDate.getDay());
    
    console.log('Day availability:', dayAvailability);
    
    if (dayAvailability.length === 0) {
      console.log('No availability found for day of week:', selectedDate.getDay());
      return [];
    }

    // Generate time slots for each availability window
    const allSlots: string[] = [];
    
    dayAvailability.forEach(({ startTime, endTime }) => {
      // Skip if the day is marked as closed
      if (startTime.toLowerCase() === 'close' || startTime.toLowerCase() === 'closed') {
        console.log('Day is closed');
        return;
      }
      
      console.log(`Generating slots for ${startTime} to ${endTime}`);
      
      const slots = generateTimeSlots(
        startTime, 
        endTime, 
        totalDuration,
        selectedDate, 
        existingAppointments,
        { 
          bufferMinutes,
          slotInterval: 30 // 30-minute intervals
        }
      );
      
      console.log(`Generated ${slots.length} slots for this window:`, slots);
      allSlots.push(...slots);
    });

    // Remove duplicates and sort
    const uniqueSlots = [...new Set(allSlots)];
    
    // Sort times chronologically
    const sortedSlots = uniqueSlots.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a}`);
      const timeB = new Date(`1970/01/01 ${b}`);
      return timeA.getTime() - timeB.getTime();
    });
    
    console.log('Final available times:', sortedSlots);
    return sortedSlots;
  };

  const availableTimes = getAvailableTimes();

  // Check if the selected date is closed
  const isDayClosed = () => {
    if (!selectedDate) return false;
    
    const dayAvailability = availability.filter(a => a.dayOfWeek === selectedDate.getDay());
    return dayAvailability.length === 0 || 
           dayAvailability.every(a => a.startTime.toLowerCase() === 'close' || a.startTime.toLowerCase() === 'closed');
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
            {selectedServices.services.length} Service{selectedServices.services.length !== 1 ? 's' : ''} Selected
          </p>
          <p className="text-sm text-indigo-600">
            {formatDate(selectedDate)} • {selectedServices.totalDuration} min • {selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice.toFixed(2)}`}
          </p>
          {selectedServices.services.length > 1 && (
            <div className="mt-2 pt-2 border-t border-indigo-200">
              <p className="text-xs text-indigo-700 font-medium">Services:</p>
              <div className="text-xs text-indigo-600">
                {selectedServices.services.map(service => service.name).join(' • ')}
              </div>
            </div>
          )}
        </div>
        
        {/* Show buffer time info */}
        {settings?.bufferMinutes && settings.bufferMinutes > 0 && (
          <div className="text-sm text-gray-600 mb-4">
            ℹ️ {settings.bufferMinutes} minute buffer included between appointments
          </div>
        )}
      </div>
      
      {isDayClosed() ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">This day is not available for appointments</p>
          <p className="text-sm text-gray-400">
            Please select a different date
          </p>
        </div>
      ) : availableTimes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {availableTimes.map(time => (
            <button
              key={time}
              onClick={() => onTimeSelect(time)}
              className="text-[#23508e] p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 text-center font-medium"
            >
              {time}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No available times for this date</p>
          <p className="text-sm text-gray-400">
            All time slots are booked or the selected services require more time than available windows allow
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Total duration needed: {selectedServices.totalDuration} minutes</p>
            {settings?.bufferMinutes && (
              <p>Plus {settings.bufferMinutes} minute buffer between appointments</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;