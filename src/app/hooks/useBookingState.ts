// src/app/hooks/useBookingState.ts
'use client';
import { useState, useMemo } from 'react';
import { Service, BookingFormData, FormErrors, BookingStep, SelectedServices } from '../types';

export const useBookingState = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingStep, setBookingStep] = useState<BookingStep>('services');
  const [selectedServicesArray, setSelectedServicesArray] = useState<Service[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    email: ''
  });

  // Calculate selectedServices object with totals
  const selectedServices: SelectedServices = useMemo(() => {
    const totalDuration = selectedServicesArray.reduce((sum, service) => {
      return sum + parseInt(service.durationMin);
    }, 0);
    
    const totalPrice = selectedServicesArray.reduce((sum, service) => {
      return sum + parseFloat(service.price);
    }, 0);

    return {
      services: selectedServicesArray,
      totalDuration,
      totalPrice
    };
  }, [selectedServicesArray]);

  const resetBooking = () => {
    setBookingStep('services');
    setSelectedServicesArray([]);
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
    selectedServices,
    setSelectedServices: setSelectedServicesArray, // This is the key fix
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    resetBooking,
  };
};