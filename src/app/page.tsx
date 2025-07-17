// src/app/page.tsx
'use client';
import React from 'react';
import { useSchedulingData } from './hooks/useSchedulingData';
import { useBookingState } from './hooks/useBookingState';
import { useBookingSubmission } from './hooks/useBookingSubmission';
import InfoPanel from './components/InfoPanel';
import BookingInterface from './components/BookingInterface';
import ConfirmationPage from './components/ConfirmationPage';
import { CalendarDay, Service } from './types';

const SchedulingApp = () => {
  const {
    services,
    serviceLoading,
    settings,
    settingsLoading,
    availability,
    availabilityLoading,
    appointments,
    appointmentsLoading,
    refreshAppointments,
  } = useSchedulingData();

  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    currentMonth,
    setCurrentMonth,
    bookingStep,
    setBookingStep,
    selectedServices,
    setSelectedServices,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    resetBooking,
  } = useBookingState();

  const { submitBooking } = useBookingSubmission();

  const handleDateSelect = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.services.some(s => s.id === service.id);
    
    if (isSelected) {
      // Remove service
      setSelectedServices(selectedServices.services.filter(s => s.id !== service.id));
    } else {
      // Add service
      setSelectedServices([...selectedServices.services, service]);
    }
  };

  const handleSubmit = async () => {
    if (selectedServices.services.length === 0) return;
    
    const success = await submitBooking(selectedServices, selectedDate, selectedTime, formData);
    
    if (success) {
      setBookingStep('confirmation');
      // Refresh appointments to update available times
      await refreshAppointments();
    }
  };

  // Show confirmation page with different layout
  if (bookingStep === 'confirmation') {
    return (
      <ConfirmationPage
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedServices={selectedServices}
        formData={formData}
        onReset={resetBooking}
      />
    );
  }

  // Show loading states
  if (serviceLoading || settingsLoading || availabilityLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduling data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Info */}
          <InfoPanel selectedServices={selectedServices} />

          {/* Right Column - Booking Interface */}
          <BookingInterface
            bookingStep={bookingStep}
            services={services}
            selectedServices={selectedServices}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            currentMonth={currentMonth}
            availability={availability}
            existingAppointments={appointments}
            settings={settings}
            formData={formData}
            formErrors={formErrors}
            onServiceToggle={handleServiceToggle}
            onDateSelect={handleDateSelect}
            onTimeSelect={setSelectedTime}
            onMonthChange={setCurrentMonth}
            onFormDataChange={setFormData}
            onFormErrorsChange={setFormErrors}
            onSubmit={handleSubmit}
            onStepChange={setBookingStep}
          />
        </div>
      </div>
    </div>
  );
};

export default SchedulingApp;