// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      serviceId, 
      date, 
      time, 
      clientName, 
      clientEmail, 
      clientPhone = '', // Default to empty string if not provided
      notes = '' 
    } = body;

    // Validate required fields
    if (!serviceId || !date || !time || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Combine date and time into a single DateTime
    const appointmentDateTime = new Date(`${date}T${time}`);

    // Get service details to extract duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' }, 
        { status: 404 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDateTime,
        durationMin: service.durationMin,
        clientName,
        clientEmail,
        clientPhone,
        notes,
        businessId: 'iwe', // Your business ID
        serviceId,
        status: 'SCHEDULED'
      },
      include: {
        service: true
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        appointment,
        message: 'Booking created successfully' 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' }, 
      { status: 500 }
    );
  }
}