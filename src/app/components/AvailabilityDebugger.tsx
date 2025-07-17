// src/app/components/AvailabilityDebugger.tsx
import React, { useState } from 'react';
import { Availability, Appointment, SelectedServices } from '../types';
import generateTimeSlots from '../lib/generateTimeSlots';

interface AvailabilityDebuggerProps {
  availability: Availability[];
  appointments: Appointment[];
  selectedServices: SelectedServices;
}

const AvailabilityDebugger: React.FC<AvailabilityDebuggerProps> = ({
  availability,
  appointments,
  selectedServices
}) => {
  const [selectedDebugDate, setSelectedDebugDate] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const analyzeDate = (dateStr: string) => {
    if (!dateStr || selectedServices.services.length === 0) return null;
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    
    // Get business hours for this day
    const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek);
    
    // Get appointments for this date
    const dayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString() && apt.status === 'SCHEDULED';
    });
    
    // Generate available slots
    const availableSlots = dayAvailability
      .filter(a => a.startTime !== 'Close')
      .flatMap(({ startTime, endTime }) => 
        generateTimeSlots(startTime, endTime, selectedServices.totalDuration, date, appointments)
      );
    
    return {
      date,
      dayOfWeek,
      dayAvailability,
      dayAppointments,
      availableSlots,
      totalDuration: selectedServices.totalDuration
    };
  };

  const analysis = selectedDebugDate ? analyzeDate(selectedDebugDate) : null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm"
      >
        🔍 Debug Availability
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Availability Debugger</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Date to Debug:</label>
            <select
              value={selectedDebugDate}
              onChange={(e) => setSelectedDebugDate(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Choose a date...</option>
              {getDateOptions().map(date => (
                <option key={date.toISOString()} value={date.toISOString()}>
                  {date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>

          {selectedServices.services.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 text-sm">
                ⚠️ No services selected. Please select services to see availability.
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded p-4">
                <h4 className="font-semibold mb-2">Analysis for {analysis.date.toDateString()}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Day of Week:</strong> {analysis.dayOfWeek} (0=Sunday)</p>
                    <p><strong>Service Duration:</strong> {analysis.totalDuration} minutes</p>
                    <p><strong>Available Slots:</strong> {analysis.availableSlots.length}</p>
                  </div>
                  <div>
                    <p><strong>Existing Appointments:</strong> {analysis.dayAppointments.length}</p>
                    <p><strong>Business Hours:</strong> {analysis.dayAvailability.length} periods</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded p-4">
                  <h5 className="font-semibold mb-2 text-blue-900">Business Hours</h5>
                  {analysis.dayAvailability.length === 0 ? (
                    <p className="text-sm text-blue-700">No availability configured for this day</p>
                  ) : (
                    <div className="space-y-1">
                      {analysis.dayAvailability.map((avail, idx) => (
                        <div key={idx} className="text-sm text-blue-700">
                          {avail.startTime === 'Close' ? (
                            <span className="text-red-600">🚫 Closed</span>
                          ) : (
                            <span>🕒 {avail.startTime} - {avail.endTime}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-orange-50 rounded p-4">
                  <h5 className="font-semibold mb-2 text-orange-900">Existing Appointments</h5>
                  {analysis.dayAppointments.length === 0 ? (
                    <p className="text-sm text-orange-700">No appointments scheduled</p>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {analysis.dayAppointments.map((apt, idx) => (
                        <div key={idx} className="text-sm text-orange-700">
                          📅 {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                          ({apt.durationMin}m) - {apt.clientName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded p-4">
                <h5 className="font-semibold mb-2 text-green-900">Available Time Slots</h5>
                {analysis.availableSlots.length === 0 ? (
                  <p className="text-sm text-green-700">No available slots for {analysis.totalDuration}-minute appointment</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {analysis.availableSlots.map((slot, idx) => (
                      <div key={idx} className="text-sm text-green-700 bg-green-100 rounded px-2 py-1 text-center">
                        {slot}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded p-4">
                <h5 className="font-semibold mb-2">Raw Data</h5>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600">Show JSON data</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                    {JSON.stringify({
                      selectedServices: selectedServices,
                      availability: analysis.dayAvailability,
                      appointments: analysis.dayAppointments,
                      availableSlots: analysis.availableSlots
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityDebugger;