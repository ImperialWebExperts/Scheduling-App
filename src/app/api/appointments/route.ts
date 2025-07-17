// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  return NextResponse.json({ message: 'Appointments API is working' });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Appointments API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      serviceId, 
      date, 
      time, 
      clientName, 
      clientEmail, 
      notes 
    } = body;

    // Validate required fields
    if (!serviceId || !date || !time || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Get service details to determine duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' }, 
        { status: 404 }
      );
    }

    console.log('Service found:', service);

    // Combine date and time into a proper DateTime
    const appointmentDate = new Date(date);
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    let adjustedHours = hours;
    if (period === 'PM' && hours !== 12) {
      adjustedHours += 12;
    } else if (period === 'AM' && hours === 12) {
      adjustedHours = 0;
    }
    
    appointmentDate.setHours(adjustedHours, minutes, 0, 0);

    console.log('Appointment date/time:', appointmentDate);

    // Check if the time slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: appointmentDate,
        businessId: 'iwe',
        status: 'SCHEDULED'
      }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is already booked' }, 
        { status: 409 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        durationMin: service.durationMin,
        clientName,
        clientEmail,
        clientPhone: '', // You might want to add phone field to your form
        notes: notes || '',
        businessId: 'iwe',
        serviceId,
        status: 'SCHEDULED'
      },
      include: {
        service: true
      }
    });

    console.log('Appointment created:', appointment);

    return NextResponse.json({ 
      success: true, 
      appointment: {
        id: appointment.id,
        date: appointment.date,
        service: appointment.service.name,
        duration: appointment.durationMin
      }
    });

  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' }, 
      { status: 500 }
    );
  }
}