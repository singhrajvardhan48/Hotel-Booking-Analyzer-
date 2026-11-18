import { NextRequest, NextResponse } from 'next/server';
import { ReservationRecord } from '@/types';
import { initialBookings } from '@/lib/mockBookings';

// In-memory ledger storage for serverless runtime
let bookingsStore: ReservationRecord[] = [...initialBookings];

export async function GET() {
  return NextResponse.json(bookingsStore, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const newBooking = (await request.json()) as ReservationRecord;
    if (!newBooking.guest_name || !newBooking.hotel) {
      return NextResponse.json(
        { error: 'guest_name and hotel are required' },
        { status: 400 }
      );
    }

    const record: ReservationRecord = {
      ...newBooking,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString().split('T')[0],
    };

    bookingsStore = [record, ...bookingsStore];
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Bookings API Error:', error);
    return NextResponse.json(
      { error: 'Failed to record reservation.' },
      { status: 500 }
    );
  }
}
