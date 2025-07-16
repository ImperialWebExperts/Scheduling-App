import { useState } from 'react';
import { Service, BookingFormData, FormErrors, BookingStep } from '../types';

export const useBookingState = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingStep, setBookingStep] = useState<BookingStep>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    email: ''
  });

  const resetBooking = () => {
    setBookingStep('services');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setFormData({ name: '', email: '', message: '' });
    setFormErrors({ name: '', email: '' });
    setCurrentMonth(new Date());
  };

  return {
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
  };
};