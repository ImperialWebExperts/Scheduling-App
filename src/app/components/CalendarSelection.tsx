import React from 'react';
import { Service, CalendarDay, Availability, Setting } from '../types';

interface CalendarSelectionProps {
  selectedServices: Service[];
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

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.durationMin), 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseFloat(service.price || '0'), 0);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

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
      .filter(a => a.startTime === 'Closed')
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
        <p className="mb-4 text-[#23508e]">
          Plan ahead—appointments are available up to {settings?.maxAdvanceDays || 3} months in advance!
        </p>
        
        {/* Selected Services Summary */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-indigo-900">
              Selected Services ({selectedServices.length})
            </h3>
            <div className="text-right">
              <p className="font-semibold text-indigo-900">{formatPrice(getTotalPrice())}</p>
              <p className="text-sm text-indigo-600">{getTotalDuration()} min total</p>
            </div>
          </div>
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div key={service.id} className="flex justify-between items-center text-sm">
                <span className="text-indigo-800">{index + 1}. {service.name}</span>
                <span className="text-indigo-600">{service.durationMin} min</span>
              </div>
            ))}
          </div>
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
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(day)}
            disabled={day.isPast || !day.isCurrentMonth || day.isBeyondLimit || day.isClosed}
            className={`
              aspect-square p-2 text-sm rounded-lg transition-all duration-200
              ${day.isClosed ? 'bg-red-50 text-red-300 cursor-not-allowed' : ''}
              ${day.isToday ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
              ${selectedDate?.toDateString() === day.date.toDateString() ? 'bg-indigo-100 text-indigo-600' : ''}
              ${!day.isCurrentMonth || day.isPast || day.isClosed || day.isBeyondLimit ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-indigo-50 hover:text-indigo-600'}
              ${day.isBeyondLimit ? 'bg-black-50 text-gray-300 opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {day.dayNumber}
          </button>
        ))}
      </div>

      {isMonthBeyondLimit(currentMonth) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            📅 Appointments are only available up to 6 months in advance. Please select an earlier date.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarSelection;