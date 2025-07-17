// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const {
      serviceIds,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone = '',
      notes = '',
      businessId = 'iwe'
    } = await request.json();

    // Validate required fields
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json({ error: 'At least one service must be selected' }, { status: 400 });
    }

    if (!date || !time || !clientName || !clientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all selected services to calculate total duration
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        businessId
      }
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json({ error: 'One or more services not found' }, { status: 404 });
    }

    // Calculate total duration
    const totalDuration = services.reduce((sum, service) => sum + service.durationMin, 0);

    // Create appointment datetime
    const appointmentDate = new Date(`${date}T${time}`);

    // Create the appointment with associated services
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        durationMin: totalDuration,
        clientName,
        clientEmail,
        clientPhone,
        notes,
        businessId,
        appointmentServices: {
          create: serviceIds.map((serviceId: string) => ({
            serviceId
          }))
        }
      },
      include: {
        appointmentServices: {
          include: {
            service: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        durationMin: appointment.durationMin,
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        services: appointment.appointmentServices.map(as => as.service)
      }
    });

  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: 'iwe',
      },
      include: {
        appointmentServices: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date,
      durationMin: appointment.durationMin,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      notes: appointment.notes,
      status: appointment.status,
      services: appointment.appointmentServices.map(as => as.service)
    }));

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}