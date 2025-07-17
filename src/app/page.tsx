'use client';
import React from 'react';
import { useSchedulingData } from './hooks/useSchedulingData';
import { useBookingState } from './hooks/useBookingState';
import InfoPanel from './components/InfoPanel';
import BookingInterface from './components/BookingInterface';
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
    try {
      // Validate required data
      if (!selectedService || !selectedDate || !selectedTime || !formData.name || !formData.email) {
        console.error('Missing required booking data');
        return;
      }

      // Convert time to 24-hour format for database
      const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = (parseInt(hours, 10) + 12).toString();
        }
        return `${hours.padStart(2, '0')}:${minutes}:00`;
      };

      const bookingData = {
        serviceId: selectedService.id,
        date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD format
        time: convertTo24Hour(selectedTime),
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: '', // Add phone field to form if needed
        notes: formData.message
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Booking created successfully:', result);
        setBookingStep('confirmation');
      } else {
        console.error('Failed to create booking:', result.error);
        // You might want to show an error message to the user here
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Show confirmation page with different layout
  if (bookingStep === 'confirmation') {
    return (
      <ConfirmationPage
        selectedService={selectedService} // Add this line
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
          />
        </div>
      </div>
    </div>
  );
};

export default SchedulingApp;