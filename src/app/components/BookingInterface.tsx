// src/app/components/BookingInterface.tsx
import React from 'react';
import { Service, CalendarDay, Availability, Setting, BookingFormData, FormErrors, BookingStep, Appointment, SelectedServices } from '../types';
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
  existingAppointments: Appointment[];
  settings: Setting | undefined;
  formData: BookingFormData;
  formErrors: FormErrors;
  onServicesChange: (services: Service[]) => void;
  onDateSelect: (day: CalendarDay) => void;
  onTimeSelect: (time: string) => void;
  onMonthChange: (month: Date) => void;
  onFormDataChange: (data: BookingFormData) => void;
  onFormErrorsChange: (errors: FormErrors) => void;
  onSubmit: () => void;
  onStepChange: (step: BookingStep) => void;
}

const BookingInterface: React.FC<BookingInterfaceProps> = ({
  bookingStep,
  services,
  selectedServices,
  selectedDate,
  selectedTime,
  currentMonth,
  availability,
  existingAppointments,
  settings,
  formData,
  formErrors,
  onServicesChange,
  onDateSelect,
  onTimeSelect,
  onMonthChange,
  onFormDataChange,
  onFormErrorsChange,
  onSubmit,
  onStepChange
}) => {
  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.services.some(s => s.id === service.id);
    let newServices: Service[];
    
    if (isSelected) {
      // Remove service
      newServices = selectedServices.services.filter(s => s.id !== service.id);
    } else {
      // Add service
      newServices = [...selectedServices.services, service];
    }
    
    onServicesChange(newServices);
  };

  const handleContinue = () => {
    if (selectedServices.services.length > 0) {
      onStepChange('calendar');
    }
  };

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
          selectedServices={selectedServices.services}
          onServiceToggle={handleServiceToggle}
          onContinue={handleContinue}
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
          existingAppointments={existingAppointments}
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
        />
      )}
    </div>
  );
};

export default BookingInterface;