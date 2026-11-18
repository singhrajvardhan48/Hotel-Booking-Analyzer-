import { NextRequest, NextResponse } from 'next/server';
import { BookingInput } from '@/types';
import { predictCancellation } from '@/lib/predictor';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookingInput;

    // Validate required fields
    if (!body || typeof body.lead_time !== 'number' || !body.hotel) {
      return NextResponse.json(
        { error: 'Invalid input payload: lead_time and hotel are required.' },
        { status: 400 }
      );
    }

    const result = predictCancellation(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Prediction API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process cancellation prediction.' },
      { status: 500 }
    );
  }
}

