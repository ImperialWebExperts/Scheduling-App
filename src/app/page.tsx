'use client';
import React, { useState } from 'react';
import { Clock, Check, ArrowRight, Globe, Shield, Zap } from 'lucide-react';

const SchedulingApp = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingStep, setBookingStep] = useState('services'); // 'services', 'calendar', 'times', 'form', 'confirmation'
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: ''
  });

  // Mock services data
  const services = [
    {
      id: 'website',
      name: 'Website Estimate',
      duration: '20 min',
      price: 'Free',
      description: 'Initial consultation to discuss your project goals and explore how we can work together.',
      features: ['Project overview', 'Goal alignment', 'Timeline discussion', 'Q&A session']
    },
    {
      id: 'hosting-maintenance',
      name: 'Hosting & Maintenance Estimate',
      duration: '20 min',
      price: 'Free',
      description: 'Explore our hosting and maintenance services to keep your website running smoothly.',
      features: ['Design audit', 'UX analysis', 'Actionable feedback', 'Improvement plan']
    },
    {
      id: 'strategy',
      name: 'Brainstorming Strategy Session',
      duration: '20 min',
      price: 'Free',
      description: 'Got an idea for a Software as a Service (SaaS) or web app? Let\'s brainstorm together!',
      features: ['User research insights', 'Strategy development', 'Action plan creation', 'Follow-up resources']
    },
  ];

  interface Service {
    id: string;
    name: string;
    duration: string;
    price: string;
    description: string;
    features: string[];
  }

  interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
    isBeyondLimit: boolean;
    dayNumber: number;
  }

  const handleServiceSelect = (service: Service): void => {
    setSelectedService(service);
    setBookingStep('calendar');
  };

  const availableTimes = [
    '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation function
  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: ''
    };

    // Check if name is provided
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    // Check if email is provided and valid
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return !errors.name && !errors.email;
  };

  // Calculate the maximum date (6 months from today)
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 6);
    return maxDate;
  };

  // Check if a month is beyond the 6-month limit
  const isMonthBeyondLimit = (month: Date) => {
    const maxDate = getMaxDate();
    return month > maxDate;
  };

  // Generate calendar days
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = getMaxDate();
    
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isPast = currentDate.getTime() < today.getTime();
      const isBeyondLimit = currentDate > maxDate;
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday,
        isPast,
        isBeyondLimit,
        dayNumber: currentDate.getDate()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isPast || !day.isCurrentMonth || day.isBeyondLimit) return;
    setSelectedDate(day.date);
    setBookingStep('times');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep('form');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setBookingStep('confirmation');
    }
  };

  const formatDate = (day: CalendarDay | Date | null) => {
    if (!day) return '';
    const dateObj = (day instanceof Date) ? day : day.date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = generateCalendar();

  // Navigation handlers with 6-month limit
  const canNavigateNext = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    return !isMonthBeyondLimit(nextMonth);
  };

  const canNavigatePrev = () => {
    const today = new Date();
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    return prevMonth.getMonth() >= today.getMonth() && prevMonth.getFullYear() >= today.getFullYear();
  };

  if (bookingStep === 'confirmation') {
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
                <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> 30 minutes</p>
                <p><strong>Attendee:</strong> {formData.name}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setBookingStep('services');
                setSelectedService(null);
                setSelectedDate(null);
                setSelectedTime(null);
                setFormData({name: '', email: '', message: ''});
                setFormErrors({name: '', email: ''});
              }}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Schedule Another Meeting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Book a meeting with 
                <span className="text-indigo-600"> Imperial Web Experts</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Web Development & Digital Business Solutions. Let&apos;s discuss your project and how we can help bring your vision to life.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                {selectedService ? selectedService.name : 'Multiple Services Available'}
              </h3>
              {selectedService ? (
                <ul className="space-y-3 text-gray-600">
                  {selectedService.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Custom website designs that don&apos;t just look good but also convert visitors into customers
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Website hosting & maintenance services to keep your site running smoothly
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    Automated booking system to streamline your scheduling process
                  </li>
                </ul>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <Globe className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Clear</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <Shield className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Secure</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <Zap className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Instant</p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Interface */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {bookingStep === 'services' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Service</h2>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {service.name}
                        </h3>
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-600">{service.price}</div>
                          <div className="text-sm text-gray-500">{service.duration}</div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {feature}
                          </span>
                        ))}
                        {service.features.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{service.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 'calendar' && (
              <div>
                <button
                  onClick={() => setBookingStep('services')}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
                >
                  ← Back to services
                </button>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Select a Date</h2>
                  <p className="mb-2 text-[#23508e]">Plan ahead—appointments are available up to 6 months in advance!</p>
                  <div className="bg-indigo-50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-indigo-900">{selectedService?.name}</p>
                      <p className="text-sm text-indigo-600">{selectedService?.duration} • {selectedService?.price}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      disabled={!canNavigatePrev()}
                      className={`p-2 rounded-lg transition-colors ${
                        canNavigatePrev() 
                          ? 'hover:bg-gray-100 text-gray-700' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      ←
                    </button>
                    <span className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      disabled={!canNavigateNext()}
                      className={`p-2 rounded-lg transition-colors ${
                        canNavigateNext() 
                          ? 'hover:bg-gray-100 text-gray-700' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day)}
                      disabled={day.isPast || !day.isCurrentMonth || day.isBeyondLimit}
                      className={`
                        aspect-square p-2 text-sm rounded-lg transition-all duration-200
                        ${day.isCurrentMonth 
                          ? day.isPast || day.isBeyondLimit
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-900 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'
                          : 'text-gray-300 cursor-not-allowed'
                        }
                        ${day.isToday ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                        ${selectedDate && selectedDate.toDateString() === day.date.toDateString() ? 'bg-indigo-100 text-indigo-600' : ''}
                        ${day.isBeyondLimit && day.isCurrentMonth ? 'bg-red-50 text-red-300' : ''}
                      `}
                    >
                      {day.dayNumber}
                    </button>
                  ))}
                </div>

                {isMonthBeyondLimit(currentMonth) && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      📅 Appointments are only available up to 6 months in advance. Please select an earlier date.
                    </p>
                  </div>
                )}
              </div>
            )}

            {bookingStep === 'times' && (
              <div>
                <button
                  onClick={() => setBookingStep('calendar')}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
                >
                  ← Back to calendar
                </button>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Time</h2>
                  <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                    <p className="font-semibold text-indigo-900">{selectedService?.name}</p>
                    <p className="text-sm text-indigo-600">{formatDate(selectedDate)} • {selectedService?.duration} • {selectedService?.price}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="text-[#23508e] p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 text-center"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 'form' && (
              <div>
                <button
                  onClick={() => setBookingStep('times')}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
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
                      <p className="font-semibold text-gray-900">{selectedService?.price}</p>
                      <p className="text-sm text-gray-600">{selectedService?.duration}</p>
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
                      onChange={(e) => {
                        setFormData({...formData, name: e.target.value});
                        if (formErrors.name) setFormErrors({...formErrors, name: ''});
                      }}
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
                      onChange={(e) => {
                        setFormData({...formData, email: e.target.value});
                        if (formErrors.email) setFormErrors({...formErrors, email: ''});
                      }}
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
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingApp;