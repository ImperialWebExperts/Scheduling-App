import React from 'react';
import { Service, CalendarDay, Availability, Setting, BookingFormData, FormErrors, BookingStep, SelectedServices } from '../types';
import ServiceSelection from './ServiceSelection';
import CalendarSelection from './CalendarSelection';
import TimeSelection from './TimeSelection';
import BookingForm from './BookingForm';

interface BookingInterfaceProps {
  bookingStep: BookingStep;
  services: Service[];
  selectedServices: SelectedServices;
  selectedDate: Date | null;
  selectedTime: string | null;
  currentMonth: Date;
  availability: Availability[];
  settings: Setting | undefined;
  formData: BookingFormData;
  formErrors: FormErrors;
  onServiceToggle: (service: Service) => void;
  onServicesContinue: () => void;
  onDateSelect: (day: CalendarDay) => void;
  onTimeSelect: (time: string) => void;
  onMonthChange: (month: Date) => void;
  onFormDataChange: (data: BookingFormData) => void;
  onFormErrorsChange: (errors: FormErrors) => void;
  onSubmit: () => void;
  onStepChange: (step: BookingStep) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const BookingInterface: React.FC<BookingInterfaceProps> = ({
  bookingStep,
  services,
  selectedServices,
  selectedDate,
  selectedTime,
  currentMonth,
  availability,
  settings,
  formData,
  formErrors,
  onServiceToggle,
  onServicesContinue,
  onDateSelect,
  onTimeSelect,
  onMonthChange,
  onFormDataChange,
  onFormErrorsChange,
  onSubmit,
  onStepChange,
  isSubmitting = false,
  submitError = null
}) => {
  const handleDateSelect = (day: CalendarDay) => {
    if (day.isPast || !day.isCurrentMonth || day.isBeyondLimit || day.isClosed) return;
    onDateSelect(day);
    onStepChange('times');
  };

  const handleTimeSelect = (time: string) => {
    onTimeSelect(time);
    onStepChange('form');
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {bookingStep === 'services' && (
        <ServiceSelection
          services={services}
          selectedServices={selectedServices}
          onServiceToggle={onServiceToggle}
          onContinue={onServicesContinue}
        />
      )}

      {bookingStep === 'calendar' && (
        <CalendarSelection
          selectedServices={selectedServices}
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          availability={availability}
          settings={settings}
          onDateSelect={handleDateSelect}
          onMonthChange={onMonthChange}
          onBack={() => onStepChange('services')}
        />
      )}

      {bookingStep === 'times' && (
        <TimeSelection
          selectedServices={selectedServices}
          selectedDate={selectedDate}
          availability={availability}
          onTimeSelect={handleTimeSelect}
          onBack={() => onStepChange('calendar')}
        />
      )}

      {bookingStep === 'form' && (
        <BookingForm
          selectedServices={selectedServices}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          formData={formData}
          formErrors={formErrors}
          onFormDataChange={onFormDataChange}
          onFormErrorsChange={onFormErrorsChange}
          onSubmit={onSubmit}
          onBack={() => onStepChange('times')}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </div>
  );
};

export default BookingInterface;