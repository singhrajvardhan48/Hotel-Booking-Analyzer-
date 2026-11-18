export interface BookingInput {
  lead_time: number;
  stays_in_weekend_nights: number;
  stays_in_week_nights: number;
  adults: number;
  children: number;
  babies: number;
  previous_cancellations: number;
  previous_bookings_not_canceled: number;
  booking_changes: number;
  days_in_waiting_list: number;
  adr: number;
  required_car_parking_spaces: number;
  total_of_special_requests: number;
  hotel: 'City Hotel' | 'Resort Hotel' | string;
  arrival_date_month: string;
  meal: 'BB' | 'HB' | 'FB' | 'SC' | string;
  country: string;
  market_segment: 'Online TA' | 'Offline TA/TO' | 'Direct' | 'Corporate' | 'Groups' | string;
  distribution_channel: 'TA/TO' | 'Direct' | 'Corporate' | 'GDS' | string;
  is_repeated_guest: '0' | '1' | string;
  reserved_room_type: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | string;
  deposit_type: 'No Deposit' | 'Non Refund' | 'Refundable' | string;
  customer_type: 'Transient' | 'Contract' | 'Transient-Party' | 'Group' | string;
}

export interface PredictionResult {
  prediction: 0 | 1;
  risk_level: 'LOW RISK' | 'HIGH RISK';
  cancellation_probability: number;
  confirmation_probability: number;
  confidence_score: number;
  estimated_revenue: number;
  total_nights: number;
  risk_factors: {
    factor: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
  }[];
  recommendations: string[];
}

export interface ReservationRecord {
  id: string;
  guest_name: string;
  hotel: string;
  room_type: string;
  arrival_date: string;
  nights: number;
  total_guests: number;
  adr: number;
  total_amount: number;
  deposit_type: string;
  risk_level: 'LOW RISK' | 'HIGH RISK';
  cancellation_probability: number;
  status: 'Confirmed' | 'At Risk' | 'Checked-In' | 'Cancelled';
  created_at: string;
}

export interface AnalyticsSummary {
  total_bookings: number;
  canceled_bookings: number;
  confirmed_bookings: number;
  cancellation_rate: number;
  avg_adr: number;
  avg_lead_time: number;
  total_revenue_estimated: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  canceled: number;
  confirmed: number;
  cancellation_rate: number;
  avg_adr: number;
}

export interface HotelSplitItem {
  hotel: string;
  total: number;
  canceled: number;
  confirmed: number;
  cancellation_rate: number;
  avg_adr: number;
  avg_lead_time: number;
}

export interface MarketSegmentItem {
  segment: string;
  total: number;
  canceled: number;
  confirmed: number;
  cancellation_rate: number;
  avg_adr: number;
}

export interface CustomerTypeItem {
  type: string;
  total: number;
  canceled: number;
  confirmed: number;
  cancellation_rate: number;
}

export interface DepositTypeItem {
  type: string;
  total: number;
  canceled: number;
  confirmed: number;
  cancellation_rate: number;
}

export interface LeadTimeItem {
  bucket: string;
  total: number;
  canceled: number;
  confirmed: number;
  cancellation_rate: number;
}

export interface CountryItem {
  country: string;
  total: number;
  canceled: number;
  cancellation_rate: number;
}

