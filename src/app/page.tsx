'use client';
import React, { useState } from 'react';
import { useSchedulingData } from './hooks/useSchedulingData';
import { useBookingState } from './hooks/useBookingState';
import InfoPanel from './components/InfoPanel';
import BookingInterface from './components/BookingInterface';
import ConfirmationPage from './components/ConfirmationPage';
import { CalendarDay } from './types';

const SchedulingApp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    services,
    serviceLoading,
    settings,
    settingsLoading,
    availability,
    availabilityLoading,
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
    selectedService,
    setSelectedService,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    resetBooking,
  } = useBookingState();

  const handleDateSelect = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setSubmitError('Missing required booking information');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD format
          time: selectedTime,
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: '', // You might want to add a phone field to your form
          notes: formData.message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      const appointment = await response.json();
      console.log('Appointment created:', appointment);
      
      setBookingStep('confirmation');
    } catch (error) {
      console.error('Error creating appointment:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show confirmation page with different layout
  if (bookingStep === 'confirmation') {
    return (
      <ConfirmationPage
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        formData={formData}
        onReset={resetBooking}
      />
    );
  }

  // Show loading states
  if (serviceLoading || settingsLoading || availabilityLoading) {
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
          <InfoPanel selectedService={selectedService} />

          {/* Right Column - Booking Interface */}
          <div>
            {submitError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}
            
            <BookingInterface
              bookingStep={bookingStep}
              services={services}
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              currentMonth={currentMonth}
              availability={availability}
              settings={settings}
              formData={formData}
              formErrors={formErrors}
              onServiceSelect={setSelectedService}
              onDateSelect={handleDateSelect}
              onTimeSelect={setSelectedTime}
              onMonthChange={setCurrentMonth}
              onFormDataChange={setFormData}
              onFormErrorsChange={setFormErrors}
              onSubmit={handleSubmit}
              onStepChange={setBookingStep}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingApp;