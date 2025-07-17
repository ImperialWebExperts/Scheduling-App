import React from 'react';
import { CalendarDay, Availability, Setting, SelectedServices, Appointment } from '../types';
import generateTimeSlots from '../lib/generateTimeSlots';

interface CalendarSelectionProps {
  selectedServices: SelectedServices;
  selectedDate: Date | null;
  currentMonth: Date;
  availability: Availability[];
  existingAppointments: Appointment[];
  settings: Setting | undefined;
  onDateSelect: (day: CalendarDay) => void;
  onMonthChange: (month: Date) => void;
  onBack: () => void;
}

const CalendarSelection: React.FC<CalendarSelectionProps> = ({
  selectedServices,
  selectedDate,
  currentMonth,
  availability,
  existingAppointments,
  settings,
  onDateSelect,
  onMonthChange,
  onBack
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + (settings?.maxAdvanceDays || 3));
    return maxDate;
  };

  const isMonthBeyondLimit = (month: Date) => {
    const maxDate = getMaxDate();
    return month > maxDate;
  };

  // Function to get available time slots for a specific date
  const getAvailableTimesForDate = (date: Date): number => {
    if (selectedServices.services.length === 0) return 0;

    const totalDuration = selectedServices.totalDuration;
    
    const slots = availability
      .filter(a => a.dayOfWeek === date.getDay())
      .filter(a => a.startTime !== 'Close')
      .flatMap(({ startTime, endTime }) => 
        generateTimeSlots(startTime, endTime, totalDuration, date, existingAppointments)
      );
    
    return slots.length;
  };

  // Function to determine availability status for calendar styling
  const getAvailabilityStatus = (date: Date) => {
    const availableSlots = getAvailableTimesForDate(date);
    
    if (availableSlots === 0) return 'unavailable';
    if (availableSlots <= 2) return 'limited';
    return 'available';
  };

  const generateCalendar = (): CalendarDayWithAvailability[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDayWithAvailability[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = getMaxDate();

    const closedDayNumbers = availability
      .filter(a => a.startTime === 'Close')
      .map(a => a.dayOfWeek);

    for (let i = 0; i < 42; i++) {
      const isClosed = closedDayNumbers.includes(currentDate.getDay());
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPast = currentDate.getTime() < today.getTime();
      const isBeyondLimit = currentDate > maxDate;
      
      // Get availability status for styling
      const availabilityStatus = isCurrentMonth && !isPast && !isBeyondLimit && !isClosed 
        ? getAvailabilityStatus(new Date(currentDate))
        : null;

      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        isPast,
        isBeyondLimit,
        isClosed,
        dayNumber: currentDate.getDate(),
        availabilityStatus
      } as CalendarDayWithAvailability);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const canNavigateNext = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    return !isMonthBeyondLimit(nextMonth);
  };

  const canNavigatePrev = () => {
    const today = new Date();
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    return prevMonth.getMonth() >= today.getMonth() && prevMonth.getFullYear() >= today.getFullYear();
  };

  const days = generateCalendar();

  interface CalendarDayWithAvailability extends CalendarDay {
    availabilityStatus?: 'available' | 'limited' | 'unavailable' | null;
  }

  const getDateButtonStyles = (day: CalendarDayWithAvailability) => {
    const baseClasses = "aspect-square p-2 text-sm rounded-lg transition-all duration-200 relative";
    
    if (day.isClosed) {
      return `${baseClasses} bg-red-50 text-red-300 cursor-not-allowed`;
    }
    
    if (day.isToday) {
      return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700`;
    }
    
    if (selectedDate?.toDateString() === day.date.toDateString()) {
      return `${baseClasses} bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500`;
    }
    
    if (!day.isCurrentMonth || day.isPast || day.isBeyondLimit) {
      return `${baseClasses} text-gray-300 cursor-not-allowed`;
    }
    
    // Apply availability-based styling
    switch (day.availabilityStatus) {
      case 'unavailable':
        return `${baseClasses} text-gray-400 bg-gray-100 cursor-not-allowed`;
      case 'limited':
        return `${baseClasses} text-orange-600 hover:bg-orange-50 hover:text-orange-700 bg-orange-50`;
      case 'available':
        return `${baseClasses} text-gray-900 hover:bg-indigo-50 hover:text-indigo-600`;
      default:
        return `${baseClasses} text-gray-900 hover:bg-indigo-50 hover:text-indigo-600`;
    }
  };

  const getAvailabilityIndicator = (day: CalendarDayWithAvailability) => {
    if (!day.isCurrentMonth || day.isPast || day.isBeyondLimit || day.isClosed) {
      return null;
    }

    const availableSlots = getAvailableTimesForDate(day.date);
    
    if (availableSlots === 0) {
      return <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-400 rounded-full"></div>;
    } else if (availableSlots <= 2) {
      return <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-400 rounded-full"></div>;
    } else {
      return <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full"></div>;
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← Back to services
      </button>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select a Date</h2>
        <p className="mb-2 text-[#23508e]">
          Plan ahead—appointments are available up to {settings?.maxAdvanceDays || 3} months in advance!
        </p>
        <div className="bg-indigo-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-indigo-900">
                {selectedServices.services.length} Service{selectedServices.services.length !== 1 ? 's' : ''} Selected
              </p>
              <p className="text-sm text-indigo-600">
                {selectedServices.totalDuration} min • {selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice.toFixed(2)}`}
              </p>
            </div>
          </div>
          {selectedServices.services.length > 1 && (
            <div className="mt-2 pt-2 border-t border-indigo-200">
              <p className="text-xs text-indigo-700 font-medium">Services:</p>
              <div className="text-xs text-indigo-600">
                {selectedServices.services.map(service => service.name).join(' • ')}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            disabled={!canNavigatePrev()}
            className={`p-2 rounded-lg transition-colors ${
              canNavigatePrev() 
                ? 'hover:bg-gray-100 text-gray-700' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            ←
          </button>
          <span className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            disabled={!canNavigateNext()}
            className={`p-2 rounded-lg transition-colors ${
              canNavigateNext() 
                ? 'hover:bg-gray-100 text-gray-700' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 mb-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          <span className="text-gray-600">Limited</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span className="text-gray-600">Fully booked</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(day)}
            disabled={day.isPast || !day.isCurrentMonth || day.isBeyondLimit || day.isClosed || day.availabilityStatus === 'unavailable'}
            className={getDateButtonStyles(day)}
          >
            {day.dayNumber}
            {getAvailabilityIndicator(day)}
          </button>
        ))}
      </div>

      {isMonthBeyondLimit(currentMonth) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            📅 Appointments are only available up to {settings?.maxAdvanceDays || 3} months in advance. Please select an earlier date.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarSelection;