import { useState } from 'react';
import { Service, BookingFormData, FormErrors, BookingStep } from '../types';

export const useBookingState = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingStep, setBookingStep] = useState<BookingStep>('services');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    email: ''
  });

  const addService = (service: Service) => {
    setSelectedServices(prev => {
      if (prev.find(s => s.id === service.id)) {
        return prev; // Service already selected
      }
      return [...prev, service];
    });
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.find(s => s.id === service.id);
    if (isSelected) {
      removeService(service.id);
    } else {
      addService(service);
    }
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.durationMin), 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseFloat(service.price || '0'), 0);
  };

  const resetBooking = () => {
    setBookingStep('services');
    setSelectedServices([]);
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
    setSelectedServices,
    addService,
    removeService,
    toggleService,
    getTotalDuration,
    getTotalPrice,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    resetBooking,
  };
};