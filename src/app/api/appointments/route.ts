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

    // Create appointment datetime in Pacific Time
    // Combine date and time string
    const dateTimeString = `${date} ${time}`;
    console.log('Creating appointment for Pacific time:', dateTimeString);
    
    // Create the date as Pacific time and convert to UTC for storage
    const appointmentDate = createPacificTimeDate(date, time);
    console.log('Final appointment date (stored as UTC):', appointmentDate.toISOString());
    console.log('Appointment time in Pacific:', appointmentDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

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
        services: {
          create: serviceIds.map((serviceId: string) => ({
            serviceId
          }))
        }
      },
      include: {
        services: {
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
        services: appointment.services.map(as => as.service)
      }
    });

  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

// Helper function to create a UTC Date from Pacific timezone input
function createPacificTimeDate(dateStr: string, timeStr: string): Date {
  // Parse the time (handle both 24-hour and 12-hour formats)
  const [hours, minutes] = parseTime(timeStr);
  
  // Split the date
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Determine if this date falls in PDT (Daylight Time) or PST (Standard Time)
  const testDate = new Date(year, month - 1, day);
  const isDST = isDaylightSavingTime(testDate);
  
  // Pacific timezone offsets: PST = UTC-8, PDT = UTC-7
  const offsetHours = isDST ? 7 : 8;
  
  // Create UTC date directly using UTC constructor
  // For 9:00 AM Pacific, we need to create the UTC time that represents this
  const utcHours = hours + offsetHours;
  const utcDate = new Date(Date.UTC(year, month - 1, day, utcHours, minutes, 0, 0));
  
  console.log(`Converting Pacific time to UTC:`);
  console.log(`  Input: ${dateStr} ${timeStr} (Pacific)`);
  console.log(`  Is DST: ${isDST} (offset: UTC-${offsetHours})`);
  console.log(`  UTC hours: ${utcHours}`);
  console.log(`  UTC result: ${utcDate.toISOString()}`);
  console.log(`  Verify Pacific: ${utcDate.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);
  
  return utcDate;
}

// Check if a date falls within Daylight Saving Time
function isDaylightSavingTime(date: Date): boolean {
  const year = date.getFullYear();
  
  // DST starts on the 2nd Sunday in March
  const march = new Date(year, 2, 1); // March 1st
  const secondSundayMarch = new Date(year, 2, (14 - march.getDay()) % 7 + 8);
  
  // DST ends on the 1st Sunday in November  
  const november = new Date(year, 10, 1); // November 1st
  const firstSundayNovember = new Date(year, 10, (7 - november.getDay()) % 7 + 1);
  
  return date >= secondSundayMarch && date < firstSundayNovember;
}

// Helper function to parse time string to hours and minutes
function parseTime(timeStr: string): [number, number] {
  // Handle both "HH:MM:SS" and "H:MM AM/PM" formats
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const [time, period] = timeStr.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hours = parseInt(hourStr);
    const minutes = parseInt(minuteStr);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return [hours, minutes];
  } else {
    // 24-hour format (e.g., "09:00:00")
    const [hourStr, minuteStr] = timeStr.split(':');
    return [parseInt(hourStr), parseInt(minuteStr)];
  }
}

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: 'iwe',
      },
      include: {
        services: {
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
      services: appointment.services.map(as => as.service)
    }));

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}