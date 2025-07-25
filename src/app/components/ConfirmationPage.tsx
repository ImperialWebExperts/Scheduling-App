import React from 'react';
import { Check } from 'lucide-react';
import { BookingFormData, SelectedServices } from '@/app/types';

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
            <h3 className="font-semibold text-gray-900 mb-2">Meeting Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Services:</strong> {selectedServices.services.length} service{selectedServices.services.length !== 1 ? 's' : ''}</p>
              <div className="ml-4 space-y-1">
                {selectedServices.services.map((service) => (
                  <p key={service.id} className="text-xs">
                    • {service.name} ({service.durationMin} min{Number(service.price) > 0 ? `, $${service.price}` : ', Free'})
                  </p>
                ))}
              </div>
              <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Total Duration:</strong> {selectedServices.totalDuration} minutes</p>
              <p><strong>Total Price:</strong> {selectedServices.totalPrice === 0 ? 'Free' : `$${selectedServices.totalPrice.toFixed(2)}`}</p>
              <p><strong>Attendee:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
            </div>
            {formData.message && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600"><strong>Message:</strong></p>
                <p className="text-sm text-gray-600 mt-1">{formData.message}</p>
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