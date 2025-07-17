// src/app/hooks/useSchedulingData.ts
import { useState, useEffect } from 'react';
import { Service, Setting, Availability, Appointment, AppointmentResponse } from '../types';

export const useSchedulingData = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [settings, setSettings] = useState<Setting | undefined>();
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setServiceLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };

    const fetchAvailability = async () => {
      try {
        const res = await fetch('/api/availability');
        const data = await res.json();
        setAvailability(data);
      } catch (error) {
        console.error('Failed to load availability:', error);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/appointments');
        const data = await res.json();
        // Convert date strings to Date objects
        const appointmentsWithDates = data.map((appointment: AppointmentResponse) => ({
          ...appointment,
          date: new Date(appointment.date)
        }));
        setAppointments(appointmentsWithDates);
      } catch (error) {
        console.error('Failed to load appointments:', error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchServices();
    fetchSettings();
    fetchAvailability();
    fetchAppointments();
  }, []);

  // Function to refresh appointments after booking
  const refreshAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      const appointmentsWithDates = data.map((appointment: AppointmentResponse) => ({
        ...appointment,
        date: new Date(appointment.date)
      }));
      setAppointments(appointmentsWithDates);
    } catch (error) {
      console.error('Failed to refresh appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  return {
    services,
    serviceLoading,
    settings,
    settingsLoading,
    availability,
    availabilityLoading,
    appointments,
    appointmentsLoading,
    refreshAppointments,
  };
};