'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Search,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  Award,
  Check,
  Hotel,
  Copy,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
  SlidersHorizontal,
  Compass,
  ArrowUpRight,
  Luggage,
  MapPin,
  CheckCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { BookingInput, PredictionResult, ReservationRecord } from '@/types';
import analyticsData from '@/data/analytics_data.json';
import metadata from '@/data/models_metadata.json';
import { initialBookings } from '@/lib/mockBookings';

const TOP_COUNTRIES = [
  'PRT', 'GBR', 'FRA', 'ESP', 'DEU', 'ITA', 'IRL',
  'BEL', 'BRA', 'NLD', 'USA', 'CHE', 'CN', 'AUT', 'SWE', 'Other'
];

interface PresetConfig {
  id: string;
  name: string;
  guestName: string;
  badge: string;
  badgeClass: string;
  description: string;
  icon: React.ReactNode;
  data: Partial<BookingInput>;
}

const PRESETS: PresetConfig[] = [
  {
    id: 'lowRiskFamily',
    name: 'Family Summer Stay',
    guestName: 'Eleanor Vance',
    badge: 'Low Risk',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Direct booking, 25d advance, 2 requests, 1 parking',
    icon: <Luggage className="w-4 h-4 text-emerald-600" />,
    data: {
      hotel: 'Resort Hotel',
      reserved_room_type: 'C',
      meal: 'HB',
      deposit_type: 'No Deposit',
      market_segment: 'Direct',
      customer_type: 'Transient',
      distribution_channel: 'Direct',
      arrival_date_month: 'August',
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 5,
      lead_time: 25,
      adr: 185.0,
      adults: 2,
      children: 2,
      babies: 0,
      country: 'GBR',
      is_repeated_guest: '1',
      total_of_special_requests: 2,
      required_car_parking_spaces: 1,
      previous_cancellations: 0,
    },
  },
  {
    id: 'corporateShortStay',
    name: 'Corporate Business',
    guestName: 'Marcus Sterling',
    badge: 'Low Risk',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Corporate agreement, 12d advance, returning guest',
    icon: <Briefcase className="w-4 h-4 text-slate-700" />,
    data: {
      hotel: 'City Hotel',
      reserved_room_type: 'A',
      meal: 'BB',
      deposit_type: 'No Deposit',
      market_segment: 'Corporate',
      customer_type: 'Transient',
      distribution_channel: 'Corporate',
      arrival_date_month: 'October',
      stays_in_weekend_nights: 0,
      stays_in_week_nights: 2,
      lead_time: 12,
      adr: 135.0,
      adults: 1,
      children: 0,
      babies: 0,
      country: 'DEU',
      is_repeated_guest: '1',
      total_of_special_requests: 1,
      required_car_parking_spaces: 0,
      previous_cancellations: 0,
    },
  },
  {
    id: 'highRiskGroup',
    name: 'Third-Party Group Block',
    guestName: 'Travel Dynamics Co.',
    badge: 'High Risk Alert',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Non-refund, 240d advance, 0 requests, prior cancel history',
    icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    data: {
      hotel: 'City Hotel',
      reserved_room_type: 'A',
      meal: 'BB',
      deposit_type: 'Non Refund',
      market_segment: 'Groups',
      customer_type: 'Transient-Party',
      distribution_channel: 'TA/TO',
      arrival_date_month: 'September',
      stays_in_weekend_nights: 1,
      stays_in_week_nights: 3,
      lead_time: 240,
      adr: 95.0,
      adults: 2,
      children: 0,
      babies: 0,
      country: 'PRT',
      is_repeated_guest: '0',
      total_of_special_requests: 0,
      required_car_parking_spaces: 0,
      previous_cancellations: 2,
    },
  },
  {
    id: 'lastMinuteOTA',
    name: 'Last-Minute OTA Booking',
    guestName: 'Chloe Bennett',
    badge: 'Moderate Risk',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Online TA, 4d lead time, transient, room only',
    icon: <Clock className="w-4 h-4 text-amber-600" />,
    data: {
      hotel: 'City Hotel',
      reserved_room_type: 'D',
      meal: 'SC',
      deposit_type: 'No Deposit',
      market_segment: 'Online TA',
      customer_type: 'Transient',
      distribution_channel: 'TA/TO',
      arrival_date_month: 'July',
      stays_in_weekend_nights: 2,
      stays_in_week_nights: 1,
      lead_time: 4,
      adr: 145.0,
      adults: 2,
      children: 0,
      babies: 0,
      country: 'FRA',
      is_repeated_guest: '0',
      total_of_special_requests: 1,
      required_car_parking_spaces: 0,
      previous_cancellations: 0,
    },
  },
];

const DEFAULT_FORM_STATE: BookingInput = {
  hotel: 'Resort Hotel',
  reserved_room_type: 'C',
  meal: 'HB',
  deposit_type: 'No Deposit',
  market_segment: 'Direct',
  customer_type: 'Transient',
  distribution_channel: 'Direct',
  arrival_date_month: 'August',
  stays_in_weekend_nights: 2,
  stays_in_week_nights: 5,
  lead_time: 25,
  adr: 185.0,
  adults: 2,
  children: 2,
  babies: 0,
  country: 'GBR',
  is_repeated_guest: '1',
  total_of_special_requests: 2,
  required_car_parking_spaces: 1,
  previous_cancellations: 0,
  previous_bookings_not_canceled: 1,
  booking_changes: 0,
  days_in_waiting_list: 0,
};

export default function Home() {
  // LANDING PAGE IS RISK PREDICTOR
  const [activeTab, setActiveTab] = useState<'predictor' | 'dashboard' | 'analytics' | 'model' | 'ledger'>('predictor');
  const [activePreset, setActivePreset] = useState<string>('lowRiskFamily');

  const [formData, setFormData] = useState<BookingInput>(DEFAULT_FORM_STATE);
  const [guestName, setGuestName] = useState('Eleanor Vance');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reservations Ledger State
  const [ledgerBookings, setLedgerBookings] = useState<ReservationRecord[]>(initialBookings);
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'LOW RISK' | 'HIGH RISK' | 'Confirmed' | 'At Risk'>('ALL');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initial evaluation on mount
  useEffect(() => {
    handlePredict(formData);
  }, []);

  const handlePredict = async (dataToPredict: BookingInput) => {
    setLoading(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToPredict),
      });
      const data: PredictionResult = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error('Prediction failed', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: PresetConfig) => {
    setActivePreset(preset.id);
    setGuestName(preset.guestName);
    const updated = { ...formData, ...preset.data } as BookingInput;
    setFormData(updated);
    handlePredict(updated);
  };

  const resetToDefaults = () => {
    setActivePreset('lowRiskFamily');
    setGuestName('Eleanor Vance');
    setFormData(DEFAULT_FORM_STATE);
    handlePredict(DEFAULT_FORM_STATE);
  };

  const updateNumericField = (field: keyof BookingInput, delta: number, min = 0, max = 100) => {
    const currentVal = Number(formData[field]) || 0;
    const newVal = Math.max(min, Math.min(max, currentVal + delta));
    const updated = { ...formData, [field]: newVal };
    setFormData(updated);
    handlePredict(updated);
  };

  const handleSaveToLedger = () => {
    if (!prediction) return;
    const newRecord: ReservationRecord = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      guest_name: guestName || 'Walk-in Guest',
      hotel: formData.hotel,
      room_type: formData.reserved_room_type,
      arrival_date: `2026-${formData.arrival_date_month.slice(0, 3)}-18`,
      nights: prediction.total_nights,
      total_guests: formData.adults + formData.children,
      adr: formData.adr,
      total_amount: prediction.estimated_revenue,
      deposit_type: formData.deposit_type,
      risk_level: prediction.risk_level,
      cancellation_probability: prediction.cancellation_probability,
      status: prediction.risk_level === 'HIGH RISK' ? 'At Risk' : 'Confirmed',
      created_at: new Date().toISOString().split('T')[0],
    };

    setLedgerBookings((prev) => [newRecord, ...prev]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);

    // Also persist asynchronously to serverless ledger
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch((e) => console.log('Local persistence fallback active'));
  };

  const handleCopySummary = () => {
    if (!prediction) return;
    const summaryText = `--- GrandStay Hotel Reservation Evaluation ---
Guest: ${guestName}
Property: ${formData.hotel} (Room ${formData.reserved_room_type})
Arrival: ${formData.arrival_date_month} 2026
Stay: ${prediction.total_nights} nights (${formData.stays_in_weekend_nights} weekend, ${formData.stays_in_week_nights} weekday)
Rate: $${formData.adr}/night | Est. Total: $${prediction.estimated_revenue}
Risk Verdict: ${prediction.risk_level}
Cancellation Probability: ${prediction.cancellation_probability}%
Check-in Probability: ${prediction.confirmation_probability}%
Deposit Type: ${formData.deposit_type}
Lead Time: ${formData.lead_time} days
Special Requests: ${formData.total_of_special_requests}
----------------------------------------------`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStatusChange = (id: string, newStatus: ReservationRecord['status']) => {
    setLedgerBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const handleDeleteBooking = (id: string) => {
    setLedgerBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const filteredBookings = ledgerBookings.filter((b) => {
    const matchesFilter =
      ledgerFilter === 'ALL' ||
      b.risk_level === ledgerFilter ||
      b.status === ledgerFilter;
    const matchesSearch =
      b.guest_name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.hotel.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.room_type.toLowerCase().includes(ledgerSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalStayNights = Math.max(1, (formData.stays_in_weekend_nights || 0) + (formData.stays_in_week_nights || 0));
  const estimatedBookingValue = Math.round(totalStayNights * formData.adr);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 selection:bg-slate-800 selection:text-white">
      {/* ========================================================================= */}
      {/* MINIMALIST EYE-FRIENDLY NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Hotel className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  GrandStay Intelligence
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                  Random Forest 85.2%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Hospitality Demand Analytics & Cancellation Risk Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/singhrajvardhan48/Hotel-Booking-Analyzer-"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Minimalist Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1.5 overflow-x-auto py-2 border-t border-slate-100">
          {[
            { id: 'predictor', label: 'Risk Predictor', icon: ShieldCheck },
            { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
            { id: 'analytics', label: 'Booking Analytics & EDA', icon: TrendingUp },
            { id: 'model', label: 'Model Specs & XAI', icon: Award },
            { id: 'ledger', label: 'Reservations Ledger', icon: Layers, badge: ledgerBookings.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ========================================================================= */}
        {/* TAB 1: CANCELLATION RISK PREDICTOR (DEFAULT LANDING PAGE) */}
        {/* ========================================================================= */}
        {activeTab === 'predictor' && (
          <div className="space-y-6">
            {/* Minimalist Editorial Welcome Header */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time Cancellation Risk Evaluation</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Guest Reservation Intake & Risk Prediction
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Evaluate individual booking parameters against our trained ensemble model (119,208 records). Detect potential no-shows and cancellations before check-in.
                </p>
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                <button
                  onClick={resetToDefaults}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition flex items-center space-x-1.5"
                  title="Reset form to default values"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset to Defaults</span>
                </button>
                <button
                  onClick={() => handlePredict(formData)}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Re-evaluate</span>
                </button>
              </div>
            </div>

            {/* Quick-Preset Scenarios Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  <span>One-Click Test Presets:</span>
                </span>
                <span className="text-[11px] text-slate-400">Click any scenario to instantly test the model</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PRESETS.map((preset) => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                            {preset.icon}
                          </div>
                          <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                        </div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${preset.badgeClass}`}>
                          {preset.badge}
                        </span>
                        <span className="text-slate-500 text-[10px] truncate max-w-[130px]">
                          {preset.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Responsive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Column (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
                {/* 1. Property & Room */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>1. Property & Room Selection</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Accommodations</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Full Name</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Property</label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...formData, hotel: 'City Hotel' };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className={`py-1 text-xs font-semibold rounded-lg transition ${
                            formData.hotel === 'City Hotel'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          City Hotel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...formData, hotel: 'Resort Hotel' };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className={`py-1 text-xs font-semibold rounded-lg transition ${
                            formData.hotel === 'Resort Hotel'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Resort Hotel
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Room Category</label>
                      <select
                        value={formData.reserved_room_type}
                        onChange={(e) => {
                          const updated = { ...formData, reserved_room_type: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      >
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((r) => (
                          <option key={r} value={r}>Room Type {r} (Standard/Executive)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Package Plan</label>
                      <select
                        value={formData.meal}
                        onChange={(e) => {
                          const updated = { ...formData, meal: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      >
                        <option value="BB">BB - Bed & Breakfast (Standard)</option>
                        <option value="HB">HB - Half Board (Breakfast & Dinner)</option>
                        <option value="FB">FB - Full Board (All Meals)</option>
                        <option value="SC">SC - Self Catering (Room Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Deposit Type</span>
                        <span className="text-[10px] text-rose-600 font-bold">Key Risk Driver</span>
                      </label>
                      <select
                        value={formData.deposit_type}
                        onChange={(e) => {
                          const updated = { ...formData, deposit_type: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      >
                        <option value="No Deposit">No Deposit Required</option>
                        <option value="Non Refund">Non Refund (Fixed Block)</option>
                        <option value="Refundable">Refundable Deposit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Market Segment Channel</label>
                      <select
                        value={formData.market_segment}
                        onChange={(e) => {
                          const updated = { ...formData, market_segment: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      >
                        <option value="Direct">Direct Booking (Hotel Site/Phone)</option>
                        <option value="Online TA">Online Travel Agent (OTA)</option>
                        <option value="Offline TA/TO">Offline Tour Operator</option>
                        <option value="Corporate">Corporate Account Agreement</option>
                        <option value="Groups">Group Reservation</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Timeline, Lead Time & ADR */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>2. Dates, Duration & Pricing</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Total Nights: {totalStayNights}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Arrival Month</label>
                      <select
                        value={formData.arrival_date_month}
                        onChange={(e) => {
                          const updated = { ...formData, arrival_date_month: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      >
                        {[
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Weekend Nights (Sat/Sun)</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => updateNumericField('stays_in_weekend_nights', -1, 0, 14)}
                          className="px-2.5 py-2 border border-slate-300 border-r-0 rounded-l-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="14"
                          value={formData.stays_in_weekend_nights}
                          onChange={(e) => {
                            const updated = { ...formData, stays_in_weekend_nights: parseInt(e.target.value) || 0 };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className="w-full py-2 text-center text-xs border border-slate-300 bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateNumericField('stays_in_weekend_nights', 1, 0, 14)}
                          className="px-2.5 py-2 border border-slate-300 border-l-0 rounded-r-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Weekday Nights (Mon-Fri)</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => updateNumericField('stays_in_week_nights', -1, 0, 30)}
                          className="px-2.5 py-2 border border-slate-300 border-r-0 rounded-l-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={formData.stays_in_week_nights}
                          onChange={(e) => {
                            const updated = { ...formData, stays_in_week_nights: parseInt(e.target.value) || 0 };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className="w-full py-2 text-center text-xs border border-slate-300 bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateNumericField('stays_in_week_nights', 1, 0, 30)}
                          className="px-2.5 py-2 border border-slate-300 border-l-0 rounded-r-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sliders for Lead Time & ADR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                        <span>Lead Time (Advance Booking)</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-bold">
                          {formData.lead_time} days
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="365"
                        value={formData.lead_time}
                        onChange={(e) => {
                          const updated = { ...formData, lead_time: parseInt(e.target.value) || 0 };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Same day (0d)</span>
                        <span>180 days</span>
                        <span>1 Year (365d)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                        <span>Average Daily Rate (ADR)</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-bold">
                          ${formData.adr} / night
                        </span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="400"
                        step="5"
                        value={formData.adr}
                        onChange={(e) => {
                          const updated = { ...formData, adr: parseFloat(e.target.value) || 20 };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>$20 (Budget)</span>
                        <span>$150 (Mid)</span>
                        <span>$400+ (Luxury)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Demographics & Signals */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>3. Guest Demographics & Behavioral Signals</span>
                    </span>
                    <span className="text-[11px] text-slate-400">Guest Engagement</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Adults</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => updateNumericField('adults', -1, 1, 10)}
                          className="px-2 py-1.5 border border-slate-300 border-r-0 rounded-l-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.adults}
                          onChange={(e) => {
                            const updated = { ...formData, adults: parseInt(e.target.value) || 1 };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className="w-full py-1.5 text-center text-xs border border-slate-300 bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateNumericField('adults', 1, 1, 10)}
                          className="px-2 py-1.5 border border-slate-300 border-l-0 rounded-r-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Children</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => updateNumericField('children', -1, 0, 10)}
                          className="px-2 py-1.5 border border-slate-300 border-r-0 rounded-l-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.children}
                          onChange={(e) => {
                            const updated = { ...formData, children: parseInt(e.target.value) || 0 };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className="w-full py-1.5 text-center text-xs border border-slate-300 bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateNumericField('children', 1, 0, 10)}
                          className="px-2 py-1.5 border border-slate-300 border-l-0 rounded-r-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Origin Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => {
                          const updated = { ...formData, country: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      >
                        {TOP_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Returning Guest?</label>
                      <select
                        value={formData.is_repeated_guest}
                        onChange={(e) => {
                          const updated = { ...formData, is_repeated_guest: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      >
                        <option value="0">No (First Time)</option>
                        <option value="1">Yes (Loyalty Member)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Special Requests (0-5)
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => updateNumericField('total_of_special_requests', -1, 0, 5)}
                          className="px-2 py-1.5 border border-slate-300 border-r-0 rounded-l-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={formData.total_of_special_requests}
                          onChange={(e) => {
                            const updated = { ...formData, total_of_special_requests: parseInt(e.target.value) || 0 };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className="w-full py-1.5 text-center text-xs border border-slate-300 bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateNumericField('total_of_special_requests', 1, 0, 5)}
                          className="px-2 py-1.5 border border-slate-300 border-l-0 rounded-r-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-emerald-600 mt-1 block">Higher requests decrease risk</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Parking Spaces (0-3)
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => updateNumericField('required_car_parking_spaces', -1, 0, 3)}
                          className="px-2 py-1.5 border border-slate-300 border-r-0 rounded-l-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          value={formData.required_car_parking_spaces}
                          onChange={(e) => {
                            const updated = { ...formData, required_car_parking_spaces: parseInt(e.target.value) || 0 };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className="w-full py-1.5 text-center text-xs border border-slate-300 bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateNumericField('required_car_parking_spaces', 1, 0, 3)}
                          className="px-2 py-1.5 border border-slate-300 border-l-0 rounded-r-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">Parking need confirms travel</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Prior Cancellations
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => updateNumericField('previous_cancellations', -1, 0, 20)}
                          className="px-2 py-1.5 border border-slate-300 border-r-0 rounded-l-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={formData.previous_cancellations}
                          onChange={(e) => {
                            const updated = { ...formData, previous_cancellations: parseInt(e.target.value) || 0 };
                            setFormData(updated);
                            handlePredict(updated);
                          }}
                          className="w-full py-1.5 text-center text-xs border border-slate-300 bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateNumericField('previous_cancellations', 1, 0, 20)}
                          className="px-2 py-1.5 border border-slate-300 border-l-0 rounded-r-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-rose-600 mt-1 block">Prior cancel history increases risk</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handlePredict(formData)}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Random Forest Model...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Evaluate Cancellation Risk Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Scorecard (Sticky) + Operational Benchmarks (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Sticky Prediction Verdict Card */}
                {prediction && (
                  <div
                    className={`p-6 rounded-2xl border shadow-xs transition-all ${
                      prediction.risk_level === 'LOW RISK'
                        ? 'bg-white border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-rose-300 ring-1 ring-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Model Verdict
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Inference &lt;2ms
                      </span>
                    </div>

                    {/* Risk Badge & Headline */}
                    <div className="text-center my-4">
                      <div
                        className={`inline-flex p-3 rounded-2xl mb-2.5 ${
                          prediction.risk_level === 'LOW RISK'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}
                      >
                        {prediction.risk_level === 'LOW RISK' ? (
                          <CheckCircle2 className="w-8 h-8" />
                        ) : (
                          <AlertTriangle className="w-8 h-8" />
                        )}
                      </div>

                      <div
                        className={`text-xl font-bold tracking-tight ${
                          prediction.risk_level === 'LOW RISK' ? 'text-emerald-900' : 'text-rose-900'
                        }`}
                      >
                        {prediction.risk_level === 'LOW RISK'
                          ? 'LOW CANCELLATION RISK'
                          : 'HIGH CANCELLATION RISK'}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                        {prediction.risk_level === 'LOW RISK'
                          ? 'Reservation is statistically likely to proceed to successful guest check-in.'
                          : 'Statistical patterns indicate high likelihood of reservation cancellation.'}
                      </p>
                    </div>

                    {/* Progress Probability Meters */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 my-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Check-in Probability</span>
                          </span>
                          <span className="text-emerald-700 font-bold">{prediction.confirmation_probability}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${prediction.confirmation_probability}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cancellation Risk</span>
                          </span>
                          <span className="text-rose-700 font-bold">{prediction.cancellation_probability}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-rose-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${prediction.cancellation_probability}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Economics */}
                    <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Stay</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{totalStayNights} Nights</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Nightly ADR</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">${formData.adr}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Est. Total</div>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">${estimatedBookingValue.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Contributing Risk Drivers */}
                    <div className="mt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-500" />
                        <span>Key Driver Explanations</span>
                      </div>
                      <div className="space-y-1.5">
                        {prediction.risk_factors.map((rf, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start space-x-2"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-0.5 ${
                                rf.impact === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : rf.impact === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {rf.impact}
                            </span>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-800 text-xs">{rf.factor}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5">{rf.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Managerial Checklist */}
                    <div className="mt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        <span>Recommended Operational Actions</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-slate-500 font-bold">•</span>
                            <span className="text-[11px] leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons: Save, View, Copy */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleSaveToLedger}
                        className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{savedSuccess ? '✓ Saved to Ledger!' : 'Record to Ledger'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('ledger')}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1 border border-slate-200"
                        title="View in Ledger tab"
                      >
                        <span>View Ledger</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center border border-slate-200"
                        title="Copy summary to clipboard"
                      >
                        {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Operational Benchmark & Queue Summary Widget (Utilizes Space) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <Compass className="w-4 h-4 text-slate-500" />
                      <span>Historical Benchmarks & Context</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">119k Records</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-600">Property Average ADR</span>
                      <span className="font-bold text-slate-900">
                        ${formData.hotel === 'City Hotel' ? '105.30' : '94.95'}
                        <span className="text-[10px] text-slate-400 ml-1">
                          ({formData.adr > 105 ? `+${Math.round(((formData.adr - 105) / 105) * 100)}%` : `${Math.round(((formData.adr - 105) / 105) * 100)}%`})
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-600">Property Baseline Cancel Rate</span>
                      <span className="font-bold text-slate-900">
                        {formData.hotel === 'City Hotel' ? '41.7%' : '27.8%'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-600">Active Ledger Queue</span>
                      <span className="font-bold text-slate-900">
                        {ledgerBookings.length} Bookings &bull; {ledgerBookings.filter(b => b.risk_level === 'HIGH RISK').length} At Risk
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('analytics')}
                      className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition flex items-center justify-center space-x-1.5 border border-slate-200"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                      <span>Explore Market Trends & Analytics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXECUTIVE DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Minimalist Hero Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Hospitality Demand & Cancellation Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  High-level performance metrics, seasonality breakdowns, and operational risk summaries derived from 119,208 validated reservations.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('predictor')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Evaluate Reservation</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition border border-slate-200"
                >
                  <span>Explore EDA</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Bookings</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {analyticsData.summary.total_bookings.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-medium">Validated records</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Cancel Rate</div>
                <div className="mt-1 text-2xl font-bold text-rose-600">
                  {analyticsData.summary.cancellation_rate}%
                </div>
                <div className="mt-1 text-[11px] text-slate-500">44,153 cancelled</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Model Accuracy</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">
                  {(metadata.accuracy * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-[11px] text-emerald-700 font-medium">Test holdout split</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Model Precision</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {(metadata.precision * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-[11px] text-slate-500">Low false alarm rate</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Average ADR</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  ${analyticsData.summary.avg_adr}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">Per room per night</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Avg Lead Time</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {analyticsData.summary.avg_lead_time}d
                </div>
                <div className="mt-1 text-[11px] text-slate-500">Advance window</div>
              </div>
            </div>

            {/* Strategic Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Deposit Paradox</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bookings with <b>Non-Refundable deposits</b> exhibit over <b>99% cancellation rates</b> in this dataset, largely reflecting tour group expired block reservations.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-400">#1 Predictive Feature (13.9%)</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Lead Time Exposure</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Reservations booked with lead times greater than <b>180 days</b> experience a cancellation rate of <b>58.2%</b>, compared to just <b>16.8%</b> for bookings under 30 days.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-400">#4 Predictive Feature (10.4%)</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Engagement Signal</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Guests who make at least <b>1 or 2 special requests</b> (floor, bed configuration, quiet room) are <b>2.5x more likely to proceed to check-in</b>.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-400">#5 Predictive Feature (7.2%)</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs mb-2">
                  <Building2 className="w-4 h-4" />
                  <span>Property Dynamics</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <b>City Hotels</b> experience a significantly higher cancellation rate (<b>41.7%</b>) than <b>Resort Hotels</b> (<b>27.8%</b>), driven by business travel flexibility.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-400">79,302 City vs 39,906 Resort</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Monthly Booking Seasonality</span>
                  <span className="text-[10px] text-slate-500">Confirmed vs Cancelled</span>
                </h3>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthly.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="confirmed" name="Confirmed" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="canceled" name="Cancelled" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Lead Time Cancellation Trajectory</span>
                  <span className="text-[10px] text-slate-500">Risk % by Advance Window</span>
                </h3>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.lead_time_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis unit="%" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 80]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Area type="monotone" dataKey="cancellation_rate" name="Cancellation Rate" stroke="#dc2626" fill="#fee2e2" fillOpacity={0.6} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BOOKING ANALYTICS & EDA */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hospitality Demand & Cancellation Exploratory Analytics</h2>
                <p className="text-xs text-slate-500 mt-0.5">Aggregated distributions across 119,208 canonical reservations.</p>
              </div>
              <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>119,208 Total Historical Rows</span>
              </div>
            </div>

            {/* Row 1: Monthly Trends and ADR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Monthly Booking Volume by Season</h3>
                <p className="text-[11px] text-slate-500 mb-4">Confirmed reservations reach seasonal peak in August (8,624 bookings).</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} angle={-25} textAnchor="end" height={45} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="confirmed" name="Confirmed" fill="#059669" stackId="a" />
                      <Bar dataKey="canceled" name="Cancelled" fill="#dc2626" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Average Daily Rate ($ ADR) Seasonality</h3>
                <p className="text-[11px] text-slate-500 mb-4">Room rates surge to $140.10 in August compared to $70.36 in January.</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} angle={-25} textAnchor="end" height={45} />
                      <YAxis unit="$" tick={{ fontSize: 10, fill: '#64748b' }} domain={[50, 160]} />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Line type="monotone" dataKey="avg_adr" name="Avg ADR ($)" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Market Segment & Customer Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Market Segment Cancellation Tendency</h3>
                <p className="text-[11px] text-slate-500 mb-4">Online Travel Agents drive 56,402 bookings with a 36.5% cancellation rate.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.market_segments} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" unit="%" domain={[0, 70]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="segment" width={110} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="cancellation_rate" name="Cancellation %" fill="#d97706" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Customer Type Cancellation Distribution</h3>
                <p className="text-[11px] text-slate-500 mb-4">Transient-Party bookings exhibit the highest risk at 40.5%.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.customer_types}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis unit="%" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 50]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="cancellation_rate" name="Cancellation Rate (%)" fill="#475569" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 3: Top Countries */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Top Guest Origin Nationalities</h3>
              <p className="text-[11px] text-slate-500 mb-4">Volume and cancellation rates across key domestic and European visitor markets.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {analyticsData.countries.slice(0, 8).map((c, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-[11px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">{c.country}</span>
                    <div className="text-base font-bold text-slate-900 mt-2">{c.total.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Bookings</div>
                    <div className="mt-1 text-xs font-bold text-rose-600">{c.cancellation_rate}% Cancel</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MODEL PERFORMANCE & XAI */}
        {/* ========================================================================= */}
        {activeTab === 'model' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-slate-700" />
                    <span>Machine Learning Architecture & Evaluation Metrics</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Random Forest ensemble trained on 95,366 samples, evaluated on 23,842 unseen test holdout records.
                  </p>
                </div>
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
                  F1-Score: {(metadata.f1_score * 100).toFixed(1)}%
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 uppercase font-bold">Accuracy</div>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{(metadata.accuracy * 100).toFixed(2)}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">Overall correct classifications</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 uppercase font-bold">Precision</div>
                  <div className="text-3xl font-bold text-emerald-600 mt-1">{(metadata.precision * 100).toFixed(2)}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">Low false alarm rate</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 uppercase font-bold">Recall</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">{(metadata.recall * 100).toFixed(2)}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">Identifies 70.9% of cancellations</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 uppercase font-bold">F1 Score</div>
                  <div className="text-3xl font-bold text-slate-800 mt-1">{(metadata.f1_score * 100).toFixed(2)}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">Harmonic mean balance</p>
                </div>
              </div>
            </div>

            {/* Confusion Matrix and Feature Importances */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Confusion Matrix (23,842 Test Records)</h3>
                <p className="text-[11px] text-slate-500">Evaluated on stratified holdout test split without target leakage.</p>

                <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">True Negative (TN)</div>
                    <div className="text-2xl font-bold text-emerald-900 mt-1">
                      {metadata.confusion_matrix[0][0].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Correctly Confirmed</div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="text-[10px] font-bold text-amber-800 uppercase">False Positive (FP)</div>
                    <div className="text-2xl font-bold text-amber-900 mt-1">
                      {metadata.confusion_matrix[0][1].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">False Alarms (4.0%)</div>
                  </div>

                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="text-[10px] font-bold text-rose-800 uppercase">False Negative (FN)</div>
                    <div className="text-2xl font-bold text-rose-900 mt-1">
                      {metadata.confusion_matrix[1][0].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-rose-700 mt-0.5">Missed Cancellations</div>
                  </div>

                  <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-800 uppercase">True Positive (TP)</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      {metadata.confusion_matrix[1][1].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Caught Cancellations</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900">Hyperparameters:</div>
                  <div>• <b>Algorithm:</b> Scikit-Learn RandomForestClassifier</div>
                  <div>• <b>Estimators:</b> 100 Trees (max_depth=16)</div>
                  <div>• <b>Preprocessing:</b> ColumnTransformer (OneHotEncoder + SimpleImputer)</div>
                  <div>• <b>Leakage Safeguards:</b> Excluded <code>reservation_status</code> & <code>assigned_room_type</code></div>
                </div>
              </div>

              {/* Feature Importances Bar Chart */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top 12 Most Predictive Cancellation Drivers</h3>
                <p className="text-[11px] text-slate-500">Gini feature importance scores extracted from trained random forest trees.</p>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metadata.top_features.slice(0, 10).map((f) => ({
                        feature: f.Feature.replace('_', ' '),
                        importance: parseFloat((f.Importance * 100).toFixed(1)),
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" unit="%" domain={[0, 16]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="feature" width={150} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip formatter={(val) => `${val}%`} />
                      <Bar dataKey="importance" name="Relative Weight (%)" fill="#0f172a" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: FRONT DESK RESERVATIONS LEDGER */}
        {/* ========================================================================= */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Front Desk Reservations Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">Live reservation management table with integrated ML risk indicators.</p>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search guest, hotel, ID..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 w-44 sm:w-56"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLedgerFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    ledgerFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({ledgerBookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerFilter('LOW RISK')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    ledgerFilter === 'LOW RISK' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  Low Risk
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerFilter('HIGH RISK')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    ledgerFilter === 'HIGH RISK' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  High Risk
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('predictor')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white flex items-center space-x-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Booking</span>
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3.5">ID</th>
                      <th className="px-4 py-3.5">Guest Name</th>
                      <th className="px-4 py-3.5">Property / Room</th>
                      <th className="px-4 py-3.5">Arrival Date</th>
                      <th className="px-4 py-3.5">Nights / Party</th>
                      <th className="px-4 py-3.5">Total Revenue</th>
                      <th className="px-4 py-3.5">Risk Level</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{b.id}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">{b.guest_name}</td>
                        <td className="px-4 py-3.5 text-slate-600">{b.hotel} (Room {b.room_type})</td>
                        <td className="px-4 py-3.5 text-slate-600">{b.arrival_date}</td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {b.nights} nights &bull; {b.total_guests} guests
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          ${b.total_amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">(${b.adr}/nt)</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.risk_level === 'LOW RISK'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {b.risk_level === 'LOW RISK' ? '✓ ' : '⚠️ '}
                            {b.risk_level} ({b.cancellation_probability}%)
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              b.status === 'Confirmed'
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : b.status === 'Checked-In'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {b.status !== 'Checked-In' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(b.id, 'Checked-In')}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                                title="Mark as Checked-In"
                              >
                                Check In
                              </button>
                            )}
                            {b.status !== 'Confirmed' && b.status !== 'Checked-In' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(b.id, 'Confirmed')}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                title="Mark as Confirmed"
                              >
                                Confirm
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
