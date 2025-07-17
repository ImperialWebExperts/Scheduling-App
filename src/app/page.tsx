// src/app/page.tsx
'use client';
import React from 'react';
import { useSchedulingData } from './hooks/useSchedulingData';
import { useBookingState } from './hooks/useBookingState';
import { useBookingSubmission } from './hooks/useBookingSubmission';
import InfoPanel from './components/InfoPanel';
import ServiceSelection from './components/ServiceSelection';
import CalendarSelection from './components/CalendarSelection';
import TimeSelection from './components/TimeSelection';
import BookingForm from './components/BookingForm';
import ConfirmationPage from './components/ConfirmationPage';
import { CalendarDay } from './types';

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
    toggleService,
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

  const handleSubmit = async () => {
    const success = await submitBooking(selectedServices, selectedDate, selectedTime, formData);
    
    if (success) {
      setBookingStep('confirmation');
      // Refresh appointments to update available times
      await refreshAppointments();
    }
  };

  const handleServiceContinue = () => {
    if (selectedServices.services.length > 0) {
      setBookingStep('calendar');
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
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {bookingStep === 'services' && (
              <ServiceSelection
                services={services}
                selectedServices={selectedServices.services}
                onServiceToggle={toggleService}
                onContinue={handleServiceContinue}
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
                onMonthChange={setCurrentMonth}
                onBack={() => setBookingStep('services')}
              />
            )}

            {bookingStep === 'times' && (
              <TimeSelection
                selectedServices={selectedServices}
                selectedDate={selectedDate}
                availability={availability}
                existingAppointments={appointments}
                onTimeSelect={(time) => {
                  setSelectedTime(time);
                  setBookingStep('form');
                }}
                onBack={() => setBookingStep('calendar')}
              />
            )}

            {bookingStep === 'form' && (
              <BookingForm
                selectedServices={selectedServices}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                formData={formData}
                formErrors={formErrors}
                onFormDataChange={setFormData}
                onFormErrorsChange={setFormErrors}
                onSubmit={handleSubmit}
                onBack={() => setBookingStep('times')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingApp;