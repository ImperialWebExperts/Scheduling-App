// src/app/hooks/useBookingSubmission.ts
import { useState } from 'react';
import { SelectedServices, BookingFormData } from '../types';

export const useBookingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitBooking = async (
    selectedServices: SelectedServices,
    selectedDate: Date | null,
    selectedTime: string | null,
    formData: BookingFormData
  ) => {
    if (!selectedDate || !selectedTime || selectedServices.services.length === 0) {
      setSubmitError('Missing required booking information');
      return false;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      setSubmitError('Please fill in all required fields');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const serviceIds = selectedServices.services.map(service => service.id);
      const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Convert time to 24-hour format for API
      const time24 = convertTo24Hour(selectedTime);

      console.log('Submitting booking with:', {
        serviceIds,
        date: dateString,
        time: time24,
        clientName: formData.name,
        clientEmail: formData.email,
        totalDuration: selectedServices.totalDuration,
        totalPrice: selectedServices.totalPrice
      });

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceIds,
          date: dateString,
          time: time24,
          clientName: formData.name,
          clientEmail: formData.email,
          notes: formData.message || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create appointment');
      }

      console.log('Appointment created successfully:', result);
      return true;

    } catch (error) {
      console.error('Error submitting booking:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit booking';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('time slot')) {
          errorMessage = 'This time slot is no longer available. Please select a different time.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSubmitError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12: string): string => {
    try {
      const [time, modifier] = time12.split(' ');
      let [hours] = time.split(':');
      const [, minutes] = time.split(':');
      
      if (hours === '12') {
        hours = '00';
      }
      
      if (modifier?.toUpperCase() === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      
      return `${hours.padStart(2, '0')}:${minutes}:00`;
    } catch (error) {
      console.error('Error converting time format:', error);
      throw new Error('Invalid time format');
    }
  };

  const clearError = () => {
    setSubmitError(null);
  };

  return {
    submitBooking,
    isSubmitting,
    submitError,
    clearError,
  };
};