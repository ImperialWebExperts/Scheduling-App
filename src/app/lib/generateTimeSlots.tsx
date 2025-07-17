function generateTimeSlots(start: string, end: string, serviceDuration: number = 30): string[] {
  const slots: string[] = [];

  // Format function for 12-hour time with AM/PM
  const format = (date: Date) =>
    date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

  // Parse time from 24-hour format (e.g., "09:00", "17:30")
  const parseTime24Hour = (timeStr: string) => {
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  // Handle both 24-hour format (from database) and 12-hour format (if needed)
  const parseTime = (timeStr: string) => {
    // Check if it's 24-hour format (no AM/PM)
    if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
      return parseTime24Hour(timeStr);
    }

    // Handle 12-hour format with AM/PM
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

  try {
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    
    console.log('Start Time:', startTime, 'Formatted:', format(startTime));
    console.log('End Time:', endTime, 'Formatted:', format(endTime));
    console.log('Service Duration:', serviceDuration, 'minutes');

    const current = new Date(startTime);
    
    // Generate slots ensuring there's enough time for the full service duration
    while (current.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
      slots.push(format(new Date(current)));
      current.setMinutes(current.getMinutes() + 30); // 30-minute intervals
    }

    console.log('Generated slots:', slots);
    return slots;

  } catch (error) {
    console.error('Error generating time slots:', error);
    return [];
  }
}

export default generateTimeSlots;