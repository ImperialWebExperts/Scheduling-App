function generateTimeSlots(start: string, end: string,): string[] {
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
  const current = new Date(startTime);
  while (current < endTime) {
    slots.push(format(new Date(current)));
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
}

export default generateTimeSlots;