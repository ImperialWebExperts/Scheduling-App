// src/app/components/TimeSelection.tsx
import React from 'react';
import { SelectedServices, Availability, Appointment } from '../types';
import generateTimeSlots, { TimeSlot } from '../lib/generateTimeSlots';
import { Clock, User } from 'lucide-react';

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

  const getTimeSlots = (): TimeSlot[] => {
    if (!selectedDate || selectedServices.services.length === 0) return [];
    
    // Use the total duration of all selected services
    const totalDuration = selectedServices.totalDuration;
    
    return availability
      .filter(a => a.dayOfWeek === selectedDate.getDay())
      .flatMap(({ startTime, endTime }) => 
        generateTimeSlots(startTime, endTime, totalDuration, selectedDate, existingAppointments)
      );
  };

  const timeSlots = getTimeSlots();
  const availableSlots = timeSlots.filter(slot => slot.available);
  const takenSlots = timeSlots.filter(slot => !slot.available);

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
          
          {/* Show service breakdown */}
          {selectedServices.services.length > 1 && (
            <div className="mt-2 pt-2 border-t border-indigo-200">
              <p className="text-xs text-indigo-700 font-medium mb-1">Services:</p>
              <div className="space-y-1">
                {selectedServices.services.map((service) => (
                  <div key={service.id} className="flex justify-between items-center text-xs text-indigo-600">
                    <span>{service.name}</span>
                    <span>{service.durationMin} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-indigo-600 rounded"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-gray-600">Taken</span>
          </div>
        </div>
      </div>
      
      {timeSlots.length > 0 ? (
        <div className="space-y-4">
          {/* Available Time Slots */}
          {availableSlots.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-600" />
                Available Times ({availableSlots.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => onTimeSelect(slot.time)}
                    className="p-3 border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 text-center bg-white text-indigo-600 font-medium"
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Taken Time Slots */}
          {takenSlots.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-red-600" />
                Unavailable Times ({takenSlots.length})
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {takenSlots.map(slot => (
                  <div
                    key={slot.time}
                    className="p-3 border border-red-200 rounded-lg bg-red-50 cursor-not-allowed"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-red-700 font-medium">{slot.time}</span>
                      <span className="text-xs text-red-600">
                        {slot.conflictingAppointment ? 'Booked' : 'Unavailable'}
                      </span>
                    </div>
                    {slot.conflictingAppointment && (
                      <div className="mt-1 text-xs text-red-600">
                        <p>Client: {slot.conflictingAppointment.clientName}</p>
                        <p>Duration: {slot.conflictingAppointment.duration} min</p>
                        {slot.conflictingAppointment.services.length > 0 && (
                          <p>Services: {slot.conflictingAppointment.services.join(', ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No available slots message */}
          {availableSlots.length === 0 && (
            <div className="text-center py-8 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-800 font-medium mb-2">No available times for this date</p>
              <p className="text-sm text-amber-600">
                All time slots are taken or your selected services ({selectedServices.totalDuration} min total) require a longer available time slot.
              </p>
              <p className="text-sm text-amber-600 mt-1">
                Please select a different date or fewer services.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No time slots available for this date</p>
          <p className="text-sm text-gray-400">
            This date may be outside business hours or marked as closed.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSelection;