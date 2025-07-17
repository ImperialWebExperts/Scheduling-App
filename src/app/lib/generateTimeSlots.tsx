function generateTimeSlots(start: string, end: string, serviceDuration: number = 30): string[] {
  const slots: string[] = [];

  // Format time to 12-hour format with AM/PM
  const format = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Parse time in 24-hour format (HH:MM)
  const parseTime = (timeStr: string) => {
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  try {
    const startTime = parseTime(start);
    const endTime = parseTime(end);
    
    console.log('Start Time:', startTime);
    console.log('End Time:', endTime);
    console.log('Service Duration:', serviceDuration, 'minutes');

    const current = new Date(startTime);
    
    // Generate slots ensuring there's enough time for the full service duration
    while (current.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
      slots.push(format(new Date(current)));
      current.setMinutes(current.getMinutes() + 30); // 30-minute intervals
    }
  } catch (error) {
    console.error('Error parsing time:', error);
    return [];
  }

  return slots;
}

export default generateTimeSlots;