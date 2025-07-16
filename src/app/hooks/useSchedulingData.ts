import { useState, useEffect } from 'react';
import { Service, Setting, Availability } from '../types';

export const useSchedulingData = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [settings, setSettings] = useState<Setting | undefined>();
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);

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

    fetchServices();
    fetchSettings();
    fetchAvailability();
  }, []);

  return {
    services,
    serviceLoading,
    settings,
    settingsLoading,
    availability,
    availabilityLoading,
  };
};