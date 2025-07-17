import React from 'react';
import { CalendarDay, Availability, Setting, SelectedServices } from '../types';

interface CalendarSelectionProps {
  selectedServices: SelectedServices;
  selectedDate: Date | null;
  currentMonth: Date;
  availability: Availability[];
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

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = getMaxDate();

    const closedDayNumbers = availability
      .filter(a => a.startTime === 'Close' || a.startTime === 'close' || a.startTime === 'closed' || a.startTime === 'Closed')
      .map(a => a.dayOfWeek);

    for (let i = 0; i < 42; i++) {
      const isClosed = closedDayNumbers.includes(currentDate.getDay());
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPast = currentDate.getTime() < today.getTime();
      const isBeyondLimit = currentDate > maxDate;

      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        isPast,
        isBeyondLimit,
        isClosed,
        dayNumber: currentDate.getDate()
      });

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

  const handleDateClick = (day: CalendarDay) => {
    console.log('Date clicked:', day); // Debug log
    
    // Check if the day is clickable
    if (day.isPast || !day.isCurrentMonth || day.isBeyondLimit || day.isClosed) {
      console.log('Date not clickable:', { 
        isPast: day.isPast, 
        isCurrentMonth: day.isCurrentMonth, 
        isBeyondLimit: day.isBeyondLimit, 
        isClosed: day.isClosed 
      });
      return;
    }
    
    console.log('Calling onDateSelect with:', day);
    onDateSelect(day);
  };

  const isDateSelected = (day: CalendarDay) => {
    if (!selectedDate) return false;
    return selectedDate.toDateString() === day.date.toDateString();
  };

  const days = generateCalendar();

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

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = isDateSelected(day);
          const isClickable = day.isCurrentMonth && !day.isPast && !day.isBeyondLimit && !day.isClosed;
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={!isClickable}
              className={`
                aspect-square p-2 text-sm rounded-lg transition-all duration-200 font-medium
                ${day.isClosed ? 'bg-red-50 text-red-300 cursor-not-allowed line-through' : ''}
                ${day.isToday && isClickable ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                ${isSelected && !day.isToday ? 'bg-indigo-500 text-white' : ''}
                ${!day.isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                ${day.isPast && day.isCurrentMonth ? 'text-gray-400 cursor-not-allowed' : ''}
                ${day.isBeyondLimit && day.isCurrentMonth ? 'text-gray-300 cursor-not-allowed opacity-50' : ''}
                ${isClickable && !isSelected && !day.isToday ? 'text-gray-900 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer' : ''}
              `}
            >
              {day.dayNumber}
            </button>
          );
        })}
      </div>

      {isMonthBeyondLimit(currentMonth) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            📅 Appointments are only available up to {settings?.maxAdvanceDays || 3} months in advance. Please select an earlier date.
          </p>
        </div>
      )}
      
      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <p>Selected date: {selectedDate?.toDateString() || 'None'}</p>
          <p>Available days this week: {availability.filter(a => a.startTime !== 'Close').length}</p>
        </div>
      )}
    </div>
  );
};

export default CalendarSelection;