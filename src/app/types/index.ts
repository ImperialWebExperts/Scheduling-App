// src/app/types/index.ts
export interface Service {
  id: string;
  name: string;
  description: string;    
  durationMin: string;
  price: string;
  businessId: string;
}

export interface Setting {
  id: string;
  bufferMinutes: number;
  maxAdvanceDays: number;
  businessId: string;
}

export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  businessId: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isBeyondLimit: boolean;
  isClosed?: boolean;
  dayNumber: number;
}

export interface BookingFormData {
  name: string;
  email: string;
  message: string;
}

export interface FormErrors {
  name: string;
  email: string;
}

export interface SelectedServices {
  services: Service[];
  totalDuration: number;
  totalPrice: number;
}

export interface AppointmentService {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  businessId: string;
}

export interface Appointment {
  id: string;
  date: Date;
  durationMin: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW';
  services: AppointmentService[];
}

export interface AppointmentResponse {
  id: string;
  date: string;
  durationMin: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW';
  services: AppointmentService[];
}



export type BookingStep = 'services' | 'calendar' | 'times' | 'form' | 'confirmation';