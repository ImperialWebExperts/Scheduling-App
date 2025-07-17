import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Service, BookingFormData, FormErrors } from '../types';

interface BookingFormProps {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  formData: BookingFormData;
  formErrors: FormErrors;
  isSubmitting?: boolean;
  onFormDataChange: (data: BookingFormData) => void;
  onFormErrorsChange: (errors: FormErrors) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  selectedService,
  selectedDate,
  selectedTime,
  formData,
  formErrors,
  isSubmitting = false,
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
    if (validateForm() && !isSubmitting) {
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
        disabled={isSubmitting}
        className={`flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        ← Back to time selection
      </button>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-gray-900">{selectedService?.name}</p>
            <p className="text-sm text-gray-600">{formatDate(selectedDate)} at {selectedTime}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {Number(selectedService?.price) === 0 ? 'Free' : selectedService?.price}
            </p>
            <p className="text-sm text-gray-600">{selectedService?.durationMin} min</p>
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
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#23508e] ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${
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
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#23508e] ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${
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
            disabled={isSubmitting}
            rows={4}
            className={`text-[#23508e] w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Tell me about your project or what you'd like to discuss..."
          />
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
            isSubmitting
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Booking...</span>
            </>
          ) : (
            <>
              <span>Confirm Booking</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingForm;