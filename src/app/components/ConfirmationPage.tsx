import React from 'react';
import { Check } from 'lucide-react';
import { Service, BookingFormData } from '../types';

interface ConfirmationPageProps {
  selectedServices: Service[];
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

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + parseInt(service.durationMin), 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + parseFloat(service.price || '0'), 0);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
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
          
          <div className="bg-gray-50 text-indigo-500 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Meeting Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Duration:</span>
                <span className="font-medium">{getTotalDuration()} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Attendee:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium text-indigo-600">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            {/* Services List */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Services Booked:</h4>
              <div className="space-y-2">
                {selectedServices.map((service, index) => (
                  <div key={service.id} className="flex justify-between items-center bg-white rounded px-3 py-2">
                    <span className="text-gray-800">{index + 1}. {service.name}</span>
                    <div className="text-right text-sm">
                      <span className="text-gray-600">{service.durationMin} min</span>
                      {parseFloat(service.price || '0') > 0 && (
                        <span className="ml-2 text-indigo-600">${service.price}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formData.message && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Your Message:</h4>
                <p className="text-gray-600 text-sm bg-white rounded p-3">{formData.message}</p>
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