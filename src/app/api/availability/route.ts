// src/app/api/availability/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const availability = await prisma.availability.findMany({
      where: {
        businessId: 'iwe',
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
