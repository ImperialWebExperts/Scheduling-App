'use client';
import { useState } from 'react';
import { Service, BookingFormData, FormErrors, BookingStep, SelectedServices } from '@/app/types';

interface BookingStateReturn {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  currentMonth: Date;
  setCurrentMonth: (month: Date) => void;
  bookingStep: BookingStep;
  setBookingStep: (step: BookingStep) => void;
  selectedServices: SelectedServices;
  toggleService: (service: Service) => void;
  setSelectedServices: (services: SelectedServices) => void;
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  formErrors: FormErrors;
  setFormErrors: (errors: FormErrors) => void;
  resetBooking: () => void;
}

export const useBookingState = (): BookingStateReturn => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingStep, setBookingStep] = useState<BookingStep>('services');
  
  // Updated to handle multiple services
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({
    services: [],
    totalDuration: 0,
    totalPrice: 0
  });

  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    email: ''
  });

  // Helper function to calculate totals
  const calculateTotals = (services: Service[]): SelectedServices => {
    const totalDuration = services.reduce((sum, service) => sum + parseInt(service.durationMin), 0);
    const totalPrice = services.reduce((sum, service) => sum + parseFloat(service.price), 0);
    
    return {
      services,
      totalDuration,
      totalPrice
    };
  };

  // Toggle service selection
  const toggleService = (service: Service) => {
    const isSelected = selectedServices.services.some(s => s.id === service.id);
    
    if (isSelected) {
      // Remove service
      const newServices = selectedServices.services.filter(s => s.id !== service.id);
      setSelectedServices(calculateTotals(newServices));
    } else {
      // Add service
      const newServices = [...selectedServices.services, service];
      setSelectedServices(calculateTotals(newServices));
    }
  };

  const resetBooking = () => {
    setBookingStep('services');
    setSelectedServices({
      services: [],
      totalDuration: 0,
      totalPrice: 0
    });
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
    toggleService,
    setSelectedServices,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    resetBooking,
  };
};