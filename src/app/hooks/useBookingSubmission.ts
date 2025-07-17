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

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const serviceIds = selectedServices.services.map(service => service.id);
      const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Convert time to 24-hour format for API
      const time24 = convertTo24Hour(selectedTime);
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
          clientPhone: '', // You could add this to the form if needed
          notes: formData.message,
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
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit booking');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert 12-hour time to 24-hour format
const convertTo24Hour = (time12: string): string => {
  const [time, modifier] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  
  let hour24 = parseInt(hours, 10);
  
  if (modifier === 'AM') {
    // For AM times: 12 AM becomes 00, all others stay the same
    if (hour24 === 12) {
      hour24 = 0;
    }
  } else if (modifier === 'PM') {
    // For PM times: 12 PM stays 12, all others add 12
    if (hour24 !== 12) {
      hour24 += 12;
    }
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
};


  return {
    submitBooking,
    isSubmitting,
    submitError,
  };
};