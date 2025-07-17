import React from 'react';
import { Check } from 'lucide-react';
import { BookingFormData, SelectedServices } from '../types';

interface ConfirmationPageProps {
  selectedServices: SelectedServices;
  selectedDate: Date | null;
  selectedTime: string | null;
  formData: BookingFormData;
  onReset: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  selectedServices,
  selectedDate,
  selectedTime,
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

  const formatTotalPrice = () => {
    return selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice}`;
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
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span><strong>Date:</strong></span>
                <span>{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Time:</strong></span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Duration:</strong></span>
                <span>{selectedServices.totalDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Total Price:</strong></span>
                <span>{formatTotalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span><strong>Attendee:</strong></span>
                <span>{formData.name}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Services Booked:</h4>
              <div className="space-y-1">
                {selectedServices.services.map((service, index) => (
                  <div key={service.id} className="flex justify-between text-sm text-gray-600">
                    <span>{index + 1}. {service.name}</span>
                    <span>{service.durationMin} min</span>
                  </div>
                ))}
              </div>
            </div>
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