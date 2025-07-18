// src/app/lib/generateTimeSlots.tsx
import { Appointment } from '../types';

export interface TimeSlot {
  time: string;
  available: boolean;
  conflictingAppointment?: {
    clientName: string;
    duration: number;
    services: string[];
  };
}

function generateTimeSlots(
  start: string, 
  end: string, 
  serviceDuration: number = 30,
  selectedDate: Date,
  existingAppointments: Appointment[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  console.log('=== GENERATE TIME SLOTS DEBUG ===');
  console.log('Business hours:', start, 'to', end);
  console.log('Service duration needed:', serviceDuration, 'minutes');
  console.log('Selected date:', selectedDate.toDateString());
  console.log('Total existing appointments:', existingAppointments.length);

  // Format time for display in Pacific Time
  const format = (date: Date) =>
    date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Los_Angeles'
    });

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
    // Since appointments are now stored with proper Pacific time conversion,
    // we can compare the UTC dates directly after converting selected date to the same reference
    const appointmentDate = new Date(appointment.date);
    
    // Convert selected date to the start of day in Pacific time, then to UTC for comparison
    const selectedDatePacific = new Date(selectedDate);
    selectedDatePacific.setHours(0, 0, 0, 0);
    
    // Check if they're on the same calendar day when viewed in Pacific time
    const appointmentPacific = appointmentDate.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
    const selectedPacific = selectedDate.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
    
    const isSameDate = appointmentPacific === selectedPacific;
    const isScheduled = appointment.status === 'SCHEDULED';
    
    if (isSameDate && isScheduled) {
      console.log('Found existing appointment (Pacific calendar day):', {
        appointmentUTC: appointmentDate.toISOString(),
        appointmentPacific: appointmentDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
        selectedPacific: selectedPacific,
        duration: appointment.durationMin,
        client: appointment.clientName
      });
    }
    
    return isSameDate && isScheduled;
  });

  console.log(`Found ${appointmentsForDate.length} existing appointments for this date`);

  // Check if a time slot has conflicts and get conflict details
  const getSlotStatus = (slotTime: Date, duration: number): { 
    available: boolean; 
    conflictingAppointment?: {
      clientName: string;
      duration: number;
      services: string[];
    }
  } => {
    const slotStart = new Date(slotTime);
    const slotEnd = new Date(slotTime.getTime() + (duration * 60 * 1000));

    // Check each existing appointment for conflicts
    for (const appointment of appointmentsForDate) {
      // Since appointments are stored correctly in UTC (representing Pacific time),
      // we can work with them directly and just display in Pacific time
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

        return {
          available: false,
          conflictingAppointment: {
            clientName: appointment.clientName,
            duration: appointment.durationMin,
            services: appointment.services?.map(s => s.name) || []
          }
        };
      }
    }

    return { available: true };
  };

  const current = new Date(startTime);
  const slotInterval = 30; // Generate slots every 30 minutes
  
  // Generate all possible time slots
  while (current.getTime() + (slotInterval * 60 * 1000) <= endTime.getTime()) {
    // Create a date object for the current slot on the selected date
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(current.getHours(), current.getMinutes(), 0, 0);
    
    // Check the status of this time slot
    const status = getSlotStatus(slotDateTime, serviceDuration);
    
    slots.push({
      time: format(new Date(current)),
      available: status.available,
      conflictingAppointment: status.conflictingAppointment
    });
    
    // Move to next slot (every 30 minutes)
    current.setMinutes(current.getMinutes() + slotInterval);
  }

  console.log(`Generated ${slots.length} time slots (${slots.filter(s => s.available).length} available, ${slots.filter(s => !s.available).length} taken)`);
  return slots;
}

export default generateTimeSlots;