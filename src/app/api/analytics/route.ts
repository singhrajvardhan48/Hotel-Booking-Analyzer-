import { NextResponse } from 'next/server';
import analyticsData from '@/data/analytics_data.json';

export async function GET() {
  try {
    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data.' },
      { status: 500 }
    );
  }
}
