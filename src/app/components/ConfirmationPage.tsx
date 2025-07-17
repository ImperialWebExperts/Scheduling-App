import React from 'react';
import { Check } from 'lucide-react';
import { BookingFormData, SelectedServices } from '../types';

interface ConfirmationPageProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedServices: SelectedServices;
  formData: BookingFormData;
  onReset: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  selectedDate,
  selectedTime,
  selectedServices,
  formData,
  onReset
}) => {
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your meeting has been scheduled successfully.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Meeting Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Total Duration:</strong> {selectedServices.totalDuration} minutes</p>
              <p><strong>Total Price:</strong> {formatPrice(selectedServices.totalPrice)}</p>
              <p><strong>Attendee:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              {formData.message && (
                <p><strong>Message:</strong> {formData.message}</p>
              )}
            </div>
            
            {selectedServices.services.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Services:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {selectedServices.services.map((service) => (
                    <li key={service.id} className="flex justify-between">
                      <span>{service.name}</span>
                      <span>{service.durationMin} min • {Number(service.price) === 0 ? 'Free' : service.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button 
            onClick={onReset}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Schedule Another Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;