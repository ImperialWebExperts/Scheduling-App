// src/app/lib/generateTimeSlots.tsx
import { Appointment } from '../types';

interface TimeSlotOptions {
  bufferMinutes?: number; // Buffer time between appointments
  slotInterval?: number;  // Interval between available slots (default 30 min)
}

function generateTimeSlots(
  start: string, 
  end: string, 
  serviceDuration: number = 30,
  selectedDate: Date,
  existingAppointments: Appointment[] = [],
  options: TimeSlotOptions = {}
): string[] {
  const { bufferMinutes = 15, slotInterval = 30 } = options;
  const slots: string[] = [];

  // Format time for display (12-hour format)
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

  // Parse time string to Date object
  const parseTime = (timeStr: string): Date => {
    // Handle various time formats
    const cleaned = timeStr.trim().toUpperCase();
    
    // Try to match different formats
    let match = cleaned.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
    if (!match) {
      // Try format without space
      match = cleaned.match(/^(\d{1,2}):(\d{2})(AM|PM)$/);
    }
    if (!match) {
      // Try 24-hour format
      const time24Match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        const [, hourStr, minuteStr] = time24Match;
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        return date;
      }
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    const [, hourStr, minuteStr, period] = match;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  try {
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    
    // Ensure start time is before end time
    if (startTime >= endTime) {
      console.warn(`Invalid time range: ${start} to ${end}`);
      return slots;
    }

    // Filter and process appointments for the selected date
    const appointmentsForDate = existingAppointments
      .filter(appointment => {
        if (appointment.status !== 'SCHEDULED') return false;
        
        // Create date objects for comparison
        const appointmentDate = new Date(appointment.date);
        const selectedDateCopy = new Date(selectedDate);
        
        // Set both to midnight for date-only comparison
        appointmentDate.setHours(0, 0, 0, 0);
        selectedDateCopy.setHours(0, 0, 0, 0);
        
        const isSameDate = appointmentDate.getTime() === selectedDateCopy.getTime();
        
        console.log('Checking appointment:', {
          appointmentDate: appointmentDate.toDateString(),
          selectedDate: selectedDateCopy.toDateString(),
          isSameDate,
          appointmentTime: new Date(appointment.date).toLocaleTimeString(),
          status: appointment.status
        });
        
        return isSameDate;
      })
      .map(appointment => {
        const appointmentStart = new Date(appointment.date);
        const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.durationMin * 60 * 1000));
        
        console.log('Processed appointment:', {
          start: appointmentStart.toLocaleTimeString(),
          end: appointmentEnd.toLocaleTimeString(),
          duration: appointment.durationMin,
          clientName: appointment.clientName
        });
        
        return {
          start: appointmentStart,
          end: appointmentEnd,
          duration: appointment.durationMin
        };
      });

    console.log(`Found ${appointmentsForDate.length} appointments for ${selectedDate.toDateString()}`);

    // Function to check if a time slot is available
    const isTimeSlotAvailable = (slotStart: Date, slotDuration: number): boolean => {
      const slotEnd = new Date(slotStart.getTime() + (slotDuration * 60 * 1000));
      const slotEndWithBuffer = new Date(slotEnd.getTime() + (bufferMinutes * 60 * 1000));
      const slotStartWithBuffer = new Date(slotStart.getTime() - (bufferMinutes * 60 * 1000));

      const hasConflict = appointmentsForDate.some(appointment => {
        // Check for overlap: slot conflicts if it overlaps with existing appointment + buffer
        const overlap = (
          slotStart < appointment.end && slotEndWithBuffer > appointment.start
        ) || (
          slotStartWithBuffer < appointment.end && slotEnd > appointment.start
        );
        
        if (overlap) {
          console.log('Time conflict detected:', {
            slotTime: slotStart.toLocaleTimeString(),
            slotDuration,
            appointmentStart: appointment.start.toLocaleTimeString(),
            appointmentEnd: appointment.end.toLocaleTimeString()
          });
        }
        
        return overlap;
      });

      return !hasConflict;
    };

    // Generate time slots
    const current = new Date(startTime);
    console.log(`Generating slots from ${formatTime(startTime)} to ${formatTime(endTime)} for ${selectedDate.toDateString()}`);
    
    while (current.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
      // Create a proper datetime for this slot on the selected date
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(current.getHours(), current.getMinutes(), 0, 0);
      
      // Check if this slot is in the past (for today only)
      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();
      const isPastSlot = isToday && slotDateTime <= now;
      
      const isAvailable = isTimeSlotAvailable(slotDateTime, serviceDuration);
      const timeString = formatTime(new Date(current));
      
      console.log(`Checking slot ${timeString}:`, {
        isPastSlot,
        isAvailable,
        slotDateTime: slotDateTime.toLocaleString()
      });
      
      // Only add slot if it's available and not in the past
      if (!isPastSlot && isAvailable) {
        slots.push(timeString);
        console.log(`✓ Added slot: ${timeString}`);
      } else {
        console.log(`✗ Skipped slot: ${timeString} (past: ${isPastSlot}, available: ${isAvailable})`);
      }
      
      // Move to next slot interval
      current.setMinutes(current.getMinutes() + slotInterval);
    }

    console.log(`Generated ${slots.length} available slots:`, slots);
    return slots;
    
  } catch (error) {
    console.error('Error generating time slots:', error);
    return [];
  }
}

export default generateTimeSlots;