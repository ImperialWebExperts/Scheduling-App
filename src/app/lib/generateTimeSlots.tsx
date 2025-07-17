// src/app/lib/generateTimeSlots.tsx
import { Appointment } from '../types';

function generateTimeSlots(
  start: string, 
  end: string, 
  serviceDuration: number = 30,
  selectedDate: Date,
  existingAppointments: Appointment[] = []
): string[] {
  const slots: string[] = [];

  const format = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    const [, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const startTime = parseTime(start);
  const endTime = parseTime(end);
  
  // Filter appointments for the selected date
  const appointmentsForDate = existingAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toDateString() === selectedDate.toDateString() &&
           appointment.status === 'SCHEDULED'; // Only consider scheduled appointments
  });

  const isTimeSlotAvailable = (slotTime: Date, duration: number): boolean => {
    const slotStart = new Date(slotTime);
    const slotEnd = new Date(slotTime.getTime() + (duration * 60 * 1000));

    return !appointmentsForDate.some(appointment => {
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.durationMin * 60 * 1000));

      // Check if there's any overlap
      return (
        (slotStart < appointmentEnd && slotEnd > appointmentStart)
      );
    });
  };

  const current = new Date(startTime);
  
  // Generate slots ensuring there's enough time for the full service duration
  while (current.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
    // Create a date object for the current slot on the selected date
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(current.getHours(), current.getMinutes(), 0, 0);
    
    // Check if this time slot is available
    if (isTimeSlotAvailable(slotDateTime, serviceDuration)) {
      slots.push(format(new Date(current)));
    }
    
    current.setMinutes(current.getMinutes() + 30); // Still increment by 30-minute intervals
  }

  return slots;
}

export default generateTimeSlots;