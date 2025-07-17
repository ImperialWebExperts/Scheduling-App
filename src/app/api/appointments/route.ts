// src/app/api/appointments/route.ts
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

    // Parse the date and time to create a DateTime
    const appointmentDate = new Date(date);
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    appointmentDate.setHours(hour24, minutes, 0, 0);

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        durationMin: service.durationMin,
        clientName,
        clientEmail,
        clientPhone: '', // You might want to add phone field to your form
        notes: notes || '',
        businessId: service.businessId,
        serviceId: service.id,
        status: 'SCHEDULED'
      },
      include: {
        service: true,
        business: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      appointment 
    });

  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' }, 
      { status: 500 }
    );
  }
}