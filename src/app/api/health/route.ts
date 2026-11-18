import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hotel Booking Analyzer API',
    version: '1.0.0',
    platform: 'Vercel Serverless',
  });
}

