function generateTimeSlots(start: string, end: string, serviceDuration: number = 30): string[] {
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
  
  console.log('Start Time:', startTime);
  console.log('End Time:', endTime);
  console.log('Service Duration:', serviceDuration, 'minutes');

  const current = new Date(startTime);
  
  // Generate slots ensuring there's enough time for the full service duration
  while (current.getTime() + (serviceDuration * 60 * 1000) <= endTime.getTime()) {
    slots.push(format(new Date(current)));
    current.setMinutes(current.getMinutes() + 30); // Still increment by 30-minute intervals
  }

  return slots;
}

export default generateTimeSlots;