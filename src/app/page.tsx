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

  const { submitBooking, isSubmitting, submitError } = useBookingSubmission();

  const handleDateSelect = (day: CalendarDay) => {
    console.log('handleDateSelect called with:', day); // Debug log
    setSelectedDate(day.date);
    // Automatically move to time selection after date is selected
    setBookingStep('times');
  };

  const handleServiceToggle = (service: Service) => {
    const currentServices = selectedServices.services;
    const isSelected = currentServices.some(s => s.id === service.id);
    
    if (isSelected) {
      // Remove service
      const newServices = currentServices.filter(s => s.id !== service.id);
      setSelectedServices(newServices);
    } else {
      // Add service
      setSelectedServices([...currentServices, service]);
    }
  };

  const handleContinueFromServices = () => {
    if (selectedServices.services.length > 0) {
      setBookingStep('calendar');
    }
  };

  const handleSubmit = async () => {
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
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Service Selection Step */}
            {bookingStep === 'services' && (
              <ServiceSelection
                services={services}
                selectedServices={selectedServices.services}
                onServiceToggle={handleServiceToggle}
                onContinue={handleContinueFromServices}
              />
            )}

            {/* Calendar Selection Step */}
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

            {/* Time Selection Step */}
            {bookingStep === 'times' && (
              <TimeSelection
                selectedServices={selectedServices}
                selectedDate={selectedDate}
                availability={availability}
                existingAppointments={appointments}
                settings={settings}
                onTimeSelect={(time) => {
                  console.log('Time selected:', time); // Debug log
                  setSelectedTime(time);
                  setBookingStep('form'); // Advance to form step
                }}
                onBack={() => setBookingStep('calendar')}
              />
            )}

            {/* Booking Form Step */}
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

            {/* Show submission error if exists */}
            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            )}

            {/* Show loading state during submission */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Creating your appointment...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingApp;