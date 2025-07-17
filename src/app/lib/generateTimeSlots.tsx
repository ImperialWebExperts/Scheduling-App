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

  // Format time for display (12-hour format)
  const format = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Parse time string to Date object
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
  
  // Filter appointments for the selected date and only consider scheduled appointments
  const appointmentsForDate = existingAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const isSameDate = appointmentDate.toDateString() === selectedDate.toDateString();
    const isScheduled = appointment.status === 'SCHEDULED';
    
    if (isSameDate && isScheduled) {
      console.log('Found existing appointment:', {
        date: appointmentDate.toISOString(),
        duration: appointment.durationMin,
        client: appointment.clientName
      });
    }
    
    return isSameDate && isScheduled;
  });

  console.log(`Checking availability for ${selectedDate.toDateString()}`);
  console.log(`Found ${appointmentsForDate.length} existing appointments`);
  console.log(`Service duration needed: ${serviceDuration} minutes`);

  // Check if a time slot is available (no conflicts with existing appointments)
  const isTimeSlotAvailable = (slotTime: Date, duration: number): boolean => {
    const slotStart = new Date(slotTime);
    const slotEnd = new Date(slotTime.getTime() + (duration * 60 * 1000));

    // Check each existing appointment for conflicts
    for (const appointment of appointmentsForDate) {
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.durationMin * 60 * 1000));

      // Check for any overlap between the proposed slot and existing appointment
      const hasOverlap = (
        slotStart < appointmentEnd && slotEnd > appointmentStart
      );

      if (hasOverlap) {
        console.log('Time conflict detected:', {
          proposedSlot: `${format(slotStart)} - ${format(slotEnd)}`,
          existingAppointment: `${format(appointmentStart)} - ${format(appointmentEnd)}`,
          client: appointment.clientName
        });
        return false;
      }
    }

    return true;
  };

  const current = new Date(startTime);
  const slotInterval = 30; // Generate slots every 30 minutes
  
  // Generate time slots, ensuring there's enough time for the full service duration
  while (current.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
    // Create a date object for the current slot on the selected date
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(current.getHours(), current.getMinutes(), 0, 0);
    
    // Check if this time slot is available
    if (isTimeSlotAvailable(slotDateTime, serviceDuration)) {
      slots.push(format(new Date(current)));
    }
    
    // Move to next slot (every 30 minutes)
    current.setMinutes(current.getMinutes() + slotInterval);
  }

  console.log(`Generated ${slots.length} available time slots:`, slots);
  return slots;
}

export default generateTimeSlots;