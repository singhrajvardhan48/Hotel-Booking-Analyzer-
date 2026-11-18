import { NextResponse } from 'next/server';
import metadata from '@/data/models_metadata.json';

export async function GET() {
  try {
    return NextResponse.json(
      {
        ...metadata,
        dataset_info: {
          total_records: 119208,
          train_size: 95366,
          test_size: 23842,
          holdout_ratio: '20% Stratified',
          features_total: 23,
          encoded_dimensions: 76,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Model Info API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve model metadata.' },
      { status: 500 }
    );
  }
}

