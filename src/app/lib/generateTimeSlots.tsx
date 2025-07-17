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
    // Handle both 12-hour format (9:00 AM) and 24-hour format (09:00)
    const twelveHourMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    const twentyFourHourMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    
    let hour: number;
    let minute: number;

    if (twelveHourMatch) {
      const [, hourStr, minuteStr, period] = twelveHourMatch;
      hour = parseInt(hourStr, 10);
      minute = parseInt(minuteStr, 10);

      if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
    } else if (twentyFourHourMatch) {
      const [, hourStr, minuteStr] = twentyFourHourMatch;
      hour = parseInt(hourStr, 10);
      minute = parseInt(minuteStr, 10);
    } else {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  try {
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    
    // Filter appointments for the selected date and only scheduled ones
    const appointmentsForDate = existingAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === selectedDate.toDateString() &&
             appointment.status === 'SCHEDULED';
    });

    console.log(`Generating slots for ${selectedDate.toDateString()}:`);
    console.log(`- Business hours: ${start} to ${end}`);
    console.log(`- Service duration: ${serviceDuration} minutes`);
    console.log(`- Existing appointments: ${appointmentsForDate.length}`);
    
    appointmentsForDate.forEach(apt => {
      console.log(`  • ${new Date(apt.date).toLocaleTimeString()} (${apt.durationMin} min) - ${apt.clientName}`);
    });

    const isTimeSlotAvailable = (slotTime: Date, duration: number): boolean => {
      const slotStart = new Date(slotTime);
      const slotEnd = new Date(slotTime.getTime() + (duration * 60 * 1000));

      // Check if slot is in the past (for today only)
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);

      if (selectedDateOnly.getTime() === today.getTime() && slotStart <= now) {
        return false;
      }

      // Check conflicts with existing appointments
      const hasConflict = appointmentsForDate.some(appointment => {
        const appointmentStart = new Date(appointment.date);
        const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.durationMin * 60 * 1000));

        // Check if there's any overlap
        const hasOverlap = (slotStart < appointmentEnd && slotEnd > appointmentStart);
        
        if (hasOverlap) {
          console.log(`    Conflict: ${format(slotStart)}-${format(slotEnd)} overlaps with ${format(appointmentStart)}-${format(appointmentEnd)}`);
        }
        
        return hasOverlap;
      });

      return !hasConflict;
    };

    const current = new Date(startTime);
    const slotInterval = 30; // 30-minute intervals
    
    // Generate slots ensuring there's enough time for the full service duration
    while (current.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
      // Create a date object for the current slot on the selected date
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(current.getHours(), current.getMinutes(), 0, 0);
      
      // Check if this time slot is available
      if (isTimeSlotAvailable(slotDateTime, serviceDuration)) {
        slots.push(format(new Date(current)));
        console.log(`    ✓ Available: ${format(new Date(current))}`);
      } else {
        console.log(`    ✗ Unavailable: ${format(new Date(current))}`);
      }
      
      // Increment by the slot interval (30 minutes)
      current.setMinutes(current.getMinutes() + slotInterval);
    }

    console.log(`Generated ${slots.length} available slots`);
    return slots;

  } catch (error) {
    console.error('Error generating time slots:', error);
    return [];
  }
}

export default generateTimeSlots;