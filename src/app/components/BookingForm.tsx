import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Service, BookingFormData, FormErrors } from '../types';

interface BookingFormProps {
  selectedServices: Service[];
  selectedDate: Date | null;
  selectedTime: string | null;
  formData: BookingFormData;
  formErrors: FormErrors;
  onFormDataChange: (data: BookingFormData) => void;
  onFormErrorsChange: (errors: FormErrors) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  selectedServices,
  selectedDate,
  selectedTime,
  formData,
  formErrors,
  onFormDataChange,
  onFormErrorsChange,
  onSubmit,
  onBack
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
    return price === 0 ? 'Free' : `${price}`;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: ''
    };

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    onFormErrorsChange(errors);
    return !errors.name && !errors.email;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
    
    // Clear errors when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      onFormErrorsChange({ ...formErrors, [field]: '' });
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
      >
        ← Back to time selection
      </button>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h2>
      
      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-semibold text-gray-900 mb-2">
              {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : ''} Booked
            </p>
            <p className="text-sm text-gray-600 mb-3">{formatDate(selectedDate)} at {selectedTime}</p>
            
            {/* Service List */}
            <div className="space-y-2">
              {selectedServices.map((service, index) => (
                <div key={service.id} className="flex justify-between items-center text-sm bg-white rounded px-3 py-2">
                  <span className="text-gray-800">{index + 1}. {service.name}</span>
                  <div className="text-right">
                    <span className="text-gray-600">{service.durationMin} min</span>
                    {parseFloat(service.price || '0') > 0 && (
                      <span className="ml-2 text-indigo-600">${service.price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-lg">
              {formatPrice(getTotalPrice())}
            </p>
            <p className="text-sm text-gray-600">{getTotalDuration()} min total</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#23508e] ${
              formErrors.name 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-indigo-500'
            }`}
            placeholder="Enter your full name"
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#23508e] ${
              formErrors.email 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-indigo-500'
            }`}
            placeholder="Enter your email address"
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={4}
            className="text-[#23508e] w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Tell me about your project or what you'd like to discuss..."
          />
        </div>
        
        <button
          onClick={handleSubmit}
          className="cursor-pointer w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Confirm Booking</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BookingForm;