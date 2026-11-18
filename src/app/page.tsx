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
  PieChart as PieChartIcon,
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
  Sliders,
  Award
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
  PieChart,
  Pie,
  Cell,
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

const PRESETS: Record<string, Partial<BookingInput>> = {
  lowRiskFamily: {
    hotel: 'Resort Hotel',
    reserved_room_type: 'C',
    meal: 'HB',
    deposit_type: 'No Deposit',
    market_segment: 'Direct',
    customer_type: 'Transient',
    arrival_date_month: 'August',
    stays_in_weekend_nights: 2,
    stays_in_week_nights: 5,
    lead_time: 25,
    adr: 175.0,
    adults: 2,
    children: 2,
    babies: 0,
    country: 'GBR',
    is_repeated_guest: '1',
    total_of_special_requests: 2,
    required_car_parking_spaces: 1,
    previous_cancellations: 0,
  },
  corporateShortStay: {
    hotel: 'City Hotel',
    reserved_room_type: 'A',
    meal: 'BB',
    deposit_type: 'No Deposit',
    market_segment: 'Corporate',
    customer_type: 'Transient',
    arrival_date_month: 'October',
    stays_in_weekend_nights: 0,
    stays_in_week_nights: 2,
    lead_time: 12,
    adr: 130.0,
    adults: 1,
    children: 0,
    babies: 0,
    country: 'DEU',
    is_repeated_guest: '1',
    total_of_special_requests: 1,
    required_car_parking_spaces: 0,
    previous_cancellations: 0,
  },
  highRiskGroup: {
    hotel: 'City Hotel',
    reserved_room_type: 'A',
    meal: 'BB',
    deposit_type: 'Non Refund',
    market_segment: 'Groups',
    customer_type: 'Transient-Party',
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
  lastMinuteOTA: {
    hotel: 'City Hotel',
    reserved_room_type: 'D',
    meal: 'SC',
    deposit_type: 'No Deposit',
    market_segment: 'Online TA',
    customer_type: 'Transient',
    arrival_date_month: 'July',
    stays_in_weekend_nights: 2,
    stays_in_week_nights: 1,
    lead_time: 4,
    adr: 140.0,
    adults: 2,
    children: 0,
    babies: 0,
    country: 'FRA',
    is_repeated_guest: '0',
    total_of_special_requests: 1,
    required_car_parking_spaces: 0,
    previous_cancellations: 0,
  },
};

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predictor' | 'analytics' | 'model' | 'ledger'>('dashboard');

  // Form State
  const [formData, setFormData] = useState<BookingInput>({
    hotel: 'City Hotel',
    reserved_room_type: 'A',
    meal: 'BB',
    deposit_type: 'No Deposit',
    market_segment: 'Online TA',
    customer_type: 'Transient',
    distribution_channel: 'TA/TO',
    arrival_date_month: 'July',
    stays_in_weekend_nights: 1,
    stays_in_week_nights: 3,
    lead_time: 45,
    adr: 115.0,
    adults: 2,
    children: 0,
    babies: 0,
    country: 'PRT',
    is_repeated_guest: '0',
    total_of_special_requests: 1,
    required_car_parking_spaces: 0,
    previous_cancellations: 0,
    previous_bookings_not_canceled: 0,
    booking_changes: 0,
    days_in_waiting_list: 0,
  });

  const [guestName, setGuestName] = useState('John Doe');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ledgerBookings, setLedgerBookings] = useState<ReservationRecord[]>(initialBookings);
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'LOW RISK' | 'HIGH RISK'>('ALL');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Initial Run Prediction for default form
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

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      const updated = { ...formData, ...preset } as BookingInput;
      setFormData(updated);
      handlePredict(updated);
    }
  };

  const handleSaveToLedger = () => {
    if (!prediction) return;
    const newRecord: ReservationRecord = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      guest_name: guestName || 'Walk-in Guest',
      hotel: formData.hotel,
      room_type: formData.reserved_room_type,
      arrival_date: `2026-${formData.arrival_date_month}-15`,
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
    setLedgerBookings([newRecord, ...ledgerBookings]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const filteredBookings = ledgerBookings.filter((b) => {
    const matchesFilter = ledgerFilter === 'ALL' || b.risk_level === ledgerFilter;
    const matchesSearch =
      b.guest_name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.hotel.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      b.room_type.toLowerCase().includes(ledgerSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 p-2.5 rounded-xl shadow-md text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">GrandStay Intelligence</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Vercel Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI-Powered Hotel Cancellation & Demand Analytics Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="https://github.com/singhrajvardhan48/Hotel-Booking-Analyzer-"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'predictor', label: 'Risk Predictor', icon: ShieldCheck },
            { id: 'analytics', label: 'Booking Analytics', icon: TrendingUp },
            { id: 'model', label: 'Model Specs & XAI', icon: Award },
            { id: 'ledger', label: 'Reservations Ledger', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-3">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Production ML System
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Hospitality Booking Demand & Cancellation Intelligence
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                  Real-time cancellation risk mitigation powered by an ensemble Random Forest trained on 119,208 validated reservations. Prevent revenue loss and optimize room allocation with instant predictive insights.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('predictor')}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-blue-500/25"
                  >
                    Evaluate New Booking <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition backdrop-blur-sm"
                  >
                    Explore Analytics <TrendingUp className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:flex items-center justify-center">
                <Building2 className="w-72 h-72 text-white" />
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Bookings</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {analyticsData.summary.total_bookings.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-blue-600 font-medium">100% Validated Data</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Cancellation Rate</div>
                <div className="mt-1 text-2xl font-bold text-rose-600">
                  {analyticsData.summary.cancellation_rate}%
                </div>
                <div className="mt-1 text-xs text-slate-500">44,153 cancellations</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Model Accuracy</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">
                  {(metadata.accuracy * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-xs text-emerald-700 font-medium">Random Forest</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Model Precision</div>
                <div className="mt-1 text-2xl font-bold text-blue-600">
                  {(metadata.precision * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-xs text-slate-500">High true-positive rate</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Average Daily Rate</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  ${analyticsData.summary.avg_adr}
                </div>
                <div className="mt-1 text-xs text-slate-500">Per room per night</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Avg Lead Time</div>
                <div className="mt-1 text-2xl font-bold text-indigo-600">
                  {analyticsData.summary.avg_lead_time}d
                </div>
                <div className="mt-1 text-xs text-slate-500">Booking to check-in</div>
              </div>
            </div>

            {/* Strategic Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-2 text-rose-600 font-semibold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Deposit Paradox</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bookings with <b>Non-Refundable deposits</b> exhibit over <b>99% cancellation rates</b> in this historical dataset, primarily driven by bulk travel agency block reservations that automatically expire.
                </p>
                <div className="mt-3 text-xs font-medium text-slate-400">#1 Predictive Feature (13.9%)</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-2 text-amber-600 font-semibold text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Lead Time Exposure</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Reservations booked with lead times greater than <b>180 days</b> experience a cancellation rate of <b>58.2%</b>, compared to just <b>16.8%</b> for bookings under 30 days.
                </p>
                <div className="mt-3 text-xs font-medium text-slate-400">#4 Predictive Feature (10.4%)</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Engagement Signal</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Guests who make at least <b>1 or 2 special requests</b> (floor, bed configuration, quiet room) are <b>2.5x more likely to proceed to check-in</b> than guests with zero requests.
                </p>
                <div className="mt-3 text-xs font-medium text-slate-400">#5 Predictive Feature (7.2%)</div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm mb-2">
                  <Building2 className="w-4 h-4" />
                  <span>Property Dynamics</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <b>City Hotels</b> experience a significantly higher cancellation rate (<b>41.7%</b>) than <b>Resort Hotels</b> (<b>27.8%</b>), driven by business travel flexibility and competitive alternatives.
                </p>
                <div className="mt-3 text-xs font-medium text-slate-400">79,302 City vs 39,906 Resort</div>
              </div>
            </div>

            {/* Quick Chart Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Monthly Booking Seasonality</span>
                  <span className="text-xs font-normal text-slate-500">Confirmed vs Cancelled</span>
                </h3>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthly.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="confirmed" name="Confirmed" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="canceled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Lead Time Cancellation Trajectory</span>
                  <span className="text-xs font-normal text-slate-500">Cancellation % by Advance Window</span>
                </h3>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.lead_time_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                      <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 80]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Area type="monotone" dataKey="cancellation_rate" name="Cancellation Rate" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CANCELLATION RISK PREDICTOR */}
        {/* ========================================================================= */}
        {activeTab === 'predictor' && (
          <div className="space-y-6">
            {/* Presets Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Quick Load Realistic Scenarios:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset('lowRiskFamily')}
                    className="px-3 py-1 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition"
                  >
                    🏖️ Family Vacation (Low Risk)
                  </button>
                  <button
                    onClick={() => applyPreset('corporateShortStay')}
                    className="px-3 py-1 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition"
                  >
                    💼 Corporate Traveler (Low Risk)
                  </button>
                  <button
                    onClick={() => applyPreset('highRiskGroup')}
                    className="px-3 py-1 text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition"
                  >
                    ⚠️ High-Risk Group OTA (High Risk)
                  </button>
                  <button
                    onClick={() => applyPreset('lastMinuteOTA')}
                    className="px-3 py-1 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition"
                  >
                    ⚡ Last-Minute Leisure
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Guest Reservation Parameters</h2>
                  <p className="text-xs text-slate-500">Provide booking details below for immediate machine learning cancellation risk evaluation.</p>
                </div>

                {/* Section 1: Hotel & Stay */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                    <Building2 className="w-4 h-4" />
                    <span>1. Property & Accommodation</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Guest Full Name</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Hotel Type</label>
                      <select
                        value={formData.hotel}
                        onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="City Hotel">City Hotel (Lisbon Metropolitan)</option>
                        <option value="Resort Hotel">Resort Hotel (Algarve Coast)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Reserved Room Type</label>
                      <select
                        value={formData.reserved_room_type}
                        onChange={(e) => setFormData({ ...formData, reserved_room_type: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((r) => (
                          <option key={r} value={r}>Room Category {r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Meal Package</label>
                      <select
                        value={formData.meal}
                        onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BB">BB - Bed & Breakfast</option>
                        <option value="HB">HB - Half Board</option>
                        <option value="FB">FB - Full Board</option>
                        <option value="SC">SC - Self Catering (Room Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Deposit Guarantee</label>
                      <select
                        value={formData.deposit_type}
                        onChange={(e) => setFormData({ ...formData, deposit_type: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="No Deposit">No Deposit</option>
                        <option value="Non Refund">Non Refund (Fixed)</option>
                        <option value="Refundable">Refundable Deposit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Market Segment Channel</label>
                      <select
                        value={formData.market_segment}
                        onChange={(e) => setFormData({ ...formData, market_segment: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Online TA">Online Travel Agent (OTA)</option>
                        <option value="Offline TA/TO">Offline Tour Operator</option>
                        <option value="Direct">Direct Hotel Booking</option>
                        <option value="Corporate">Corporate Account</option>
                        <option value="Groups">Group Reservation</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Dates & Financials */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                    <Calendar className="w-4 h-4" />
                    <span>2. Dates, Duration & Pricing</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Arrival Month</label>
                      <select
                        value={formData.arrival_date_month}
                        onChange={(e) => setFormData({ ...formData, arrival_date_month: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-xs font-medium text-slate-700 mb-1">Weekend Nights</label>
                      <input
                        type="number"
                        min="0"
                        max="14"
                        value={formData.stays_in_weekend_nights}
                        onChange={(e) => setFormData({ ...formData, stays_in_weekend_nights: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Weekday Nights</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={formData.stays_in_week_nights}
                        onChange={(e) => setFormData({ ...formData, stays_in_week_nights: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Lead Time (Days in Advance)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="730"
                        value={formData.lead_time}
                        onChange={(e) => setFormData({ ...formData, lead_time: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Average Daily Rate ($ ADR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1500"
                        step="5"
                        value={formData.adr}
                        onChange={(e) => setFormData({ ...formData, adr: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Customer Type</label>
                      <select
                        value={formData.customer_type}
                        onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Transient">Transient (Individual)</option>
                        <option value="Contract">Contract (Corporate/Agency)</option>
                        <option value="Transient-Party">Transient-Party</option>
                        <option value="Group">Group Booking</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Guest Profile & Engagement Signals */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                    <Users className="w-4 h-4" />
                    <span>3. Guest Party & Engagement Signals</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Adults</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.adults}
                        onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Children</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.children}
                        onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Origin Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {TOP_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Repeated Guest?</label>
                      <select
                        value={formData.is_repeated_guest}
                        onChange={(e) => setFormData({ ...formData, is_repeated_guest: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">No (First Time)</option>
                        <option value="1">Yes (Returning Guest)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Special Requests (0-5)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={formData.total_of_special_requests}
                        onChange={(e) => setFormData({ ...formData, total_of_special_requests: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-slate-400">High requests reduce cancellation</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Parking Spaces (0-3)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        value={formData.required_car_parking_spaces}
                        onChange={(e) => setFormData({ ...formData, required_car_parking_spaces: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-slate-400">Parking need indicates direct intent</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Prior Cancellations
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={formData.previous_cancellations}
                        onChange={(e) => setFormData({ ...formData, previous_cancellations: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-slate-400">Past cancellations increase risk</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handlePredict(formData)}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Random Forest Model...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Run Machine Learning Cancellation Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Prediction Result Column */}
              <div className="lg:col-span-5 space-y-6">
                {prediction && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluation Verdict</span>
                      <span className="text-xs text-slate-400">Evaluated in &lt;2ms</span>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`p-5 rounded-2xl border text-center transition-all ${
                        prediction.risk_level === 'LOW RISK'
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50/80 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="inline-flex p-3 rounded-full bg-white shadow-sm mb-3">
                        {prediction.risk_level === 'LOW RISK' ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 text-rose-600" />
                        )}
                      </div>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        {prediction.risk_level === 'LOW RISK'
                          ? 'LOW CANCELLATION RISK'
                          : 'HIGH CANCELLATION RISK'}
                      </h3>
                      <p className="mt-1 text-xs opacity-80 max-w-xs mx-auto">
                        {prediction.risk_level === 'LOW RISK'
                          ? 'This booking is statistically probable to proceed to successful guest check-in.'
                          : 'This booking shows strong statistical patterns associated with prior cancellations.'}
                      </p>

                      {/* Probability Bars */}
                      <div className="mt-5 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span>Check-in Probability</span>
                          <span>{prediction.confirmation_probability}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${prediction.confirmation_probability}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs font-bold pt-1">
                          <span>Cancellation Risk</span>
                          <span className={prediction.risk_level === 'HIGH RISK' ? 'text-rose-600' : 'text-slate-600'}>
                            {prediction.cancellation_probability}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${prediction.cancellation_probability}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Duration</div>
                        <div className="font-bold text-slate-900 text-sm">{prediction.total_nights} Nights</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Room Rate</div>
                        <div className="font-bold text-slate-900 text-sm">${formData.adr}/nt</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Est. Revenue</div>
                        <div className="font-bold text-blue-700 text-sm">${prediction.estimated_revenue.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Key Risk Drivers */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span>Key Contributing Factors</span>
                      </h4>
                      <div className="space-y-2">
                        {prediction.risk_factors.map((rf, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start space-x-2"
                          >
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${
                                rf.impact === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : rf.impact === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {rf.impact}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-800">{rf.factor}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5">{rf.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5">
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                        <span>Managerial Action Items</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start space-x-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={handleSaveToLedger}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition flex items-center justify-center space-x-2"
                      >
                        <Layers className="w-4 h-4" />
                        <span>{savedSuccess ? '✓ Saved to Reservations Ledger!' : 'Save Reservation to Ledger'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BOOKING ANALYTICS & EDA */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Hospitality Booking Analytics & Demand Patterns</h2>
                <p className="text-xs text-slate-500 mt-1">Aggregated exploratory analysis across 119,208 canonical reservations.</p>
              </div>
              <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>119,208 Total Historical Rows</span>
              </div>
            </div>

            {/* Row 1: Monthly Trends and Hotel Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Volume */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Booking Volume by Season</h3>
                <p className="text-xs text-slate-500 mb-4">Confirmed reservations reach seasonal peak in August (8,624 bookings).</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="confirmed" name="Confirmed" fill="#10b981" stackId="a" />
                      <Bar dataKey="canceled" name="Cancelled" fill="#ef4444" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly ADR Trend */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Average Daily Rate ($ ADR) Seasonality</h3>
                <p className="text-xs text-slate-500 mb-4">Room rates surge to $140.10 in August compared to $70.36 in January.</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={50} />
                      <YAxis unit="$" tick={{ fontSize: 11 }} domain={[50, 160]} />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Line type="monotone" dataKey="avg_adr" name="Avg ADR ($)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Market Segment & Customer Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Segments */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Market Segment Cancellation Tendency</h3>
                <p className="text-xs text-slate-500 mb-4">Online Travel Agents drive 56,402 bookings with a 36.5% cancellation rate.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.market_segments} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" unit="%" domain={[0, 70]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="segment" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="cancellation_rate" name="Cancellation %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Customer Types */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Customer Type Cancellation Distribution</h3>
                <p className="text-xs text-slate-500 mb-4">Transient-Party bookings exhibit the highest risk at 40.5%.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.customer_types}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                      <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 50]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="cancellation_rate" name="Cancellation Rate (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 3: Top Countries */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Top Guest Origin Nationalities</h3>
              <p className="text-xs text-slate-500 mb-4">Volume and cancellation rates across key domestic and European visitor markets.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {analyticsData.countries.slice(0, 8).map((c, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{c.country}</span>
                    <div className="text-base font-extrabold text-slate-800 mt-2">{c.total.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Bookings</div>
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
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span>Machine Learning Architecture & Evaluation Metrics</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Random Forest ensemble trained on 95,366 samples, evaluated on 23,842 unseen test holdout records.
                  </p>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  F1-Score: {(metadata.f1_score * 100).toFixed(1)}%
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Accuracy</div>
                  <div className="text-3xl font-extrabold text-blue-600 mt-1">{(metadata.accuracy * 100).toFixed(2)}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">Overall correct classifications</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Precision</div>
                  <div className="text-3xl font-extrabold text-emerald-600 mt-1">{(metadata.precision * 100).toFixed(2)}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">Low false alarm rate</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Recall</div>
                  <div className="text-3xl font-extrabold text-indigo-600 mt-1">{(metadata.recall * 100).toFixed(2)}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">Identifies 70.9% of cancellations</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">F1 Score</div>
                  <div className="text-3xl font-extrabold text-purple-600 mt-1">{(metadata.f1_score * 100).toFixed(2)}%</div>
                  <p className="text-[11px] text-slate-500 mt-1">Harmonic mean balance</p>
                </div>
              </div>
            </div>

            {/* Confusion Matrix and Feature Importances */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Confusion Matrix Card */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Confusion Matrix (23,842 Test Records)</h3>
                <p className="text-xs text-slate-500">Evaluated on stratified holdout test split without target leakage.</p>

                <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase">True Negative (TN)</div>
                    <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                      {metadata.confusion_matrix[0][0].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Correctly Confirmed</div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="text-[11px] font-bold text-amber-800 uppercase">False Positive (FP)</div>
                    <div className="text-2xl font-extrabold text-amber-900 mt-1">
                      {metadata.confusion_matrix[0][1].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">False Alarms (4.0%)</div>
                  </div>

                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="text-[11px] font-bold text-rose-800 uppercase">False Negative (FN)</div>
                    <div className="text-2xl font-extrabold text-rose-900 mt-1">
                      {metadata.confusion_matrix[1][0].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-rose-700 mt-0.5">Missed Cancellations</div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-[11px] font-bold text-blue-800 uppercase">True Positive (TP)</div>
                    <div className="text-2xl font-extrabold text-blue-900 mt-1">
                      {metadata.confusion_matrix[1][1].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-blue-700 mt-0.5">Caught Cancellations</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="font-semibold text-slate-900">Hyperparameters:</div>
                  <div>• <b>Algorithm:</b> Scikit-Learn RandomForestClassifier</div>
                  <div>• <b>Estimators:</b> 100 Trees (max_depth=16)</div>
                  <div>• <b>Preprocessing:</b> ColumnTransformer (OneHotEncoder + SimpleImputer)</div>
                  <div>• <b>Leakage Safeguards:</b> Excluded <code>reservation_status</code> & <code>assigned_room_type</code></div>
                </div>
              </div>

              {/* Feature Importances Bar Chart */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Top 12 Most Predictive Cancellation Drivers</h3>
                <p className="text-xs text-slate-500">Gini feature importance scores extracted from trained random forest trees.</p>

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
                      <XAxis type="number" unit="%" domain={[0, 16]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="feature" width={150} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(val) => `${val}%`} />
                      <Bar dataKey="importance" name="Relative Weight (%)" fill="#2563eb" radius={[0, 4, 4, 0]} />
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
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Front Desk Reservations Ledger</h2>
                <p className="text-xs text-slate-500 mt-1">Live hotel management booking queue with integrated ML risk indicators.</p>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search guest, hotel, ID..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
                  />
                </div>
                <button
                  onClick={() => setLedgerFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    ledgerFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All ({ledgerBookings.length})
                </button>
                <button
                  onClick={() => setLedgerFilter('LOW RISK')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    ledgerFilter === 'LOW RISK' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Low Risk
                </button>
                <button
                  onClick={() => setLedgerFilter('HIGH RISK')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    ledgerFilter === 'HIGH RISK' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  High Risk
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Reservation ID</th>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Arrival Date</th>
                      <th className="px-4 py-3">Nights / Guests</th>
                      <th className="px-4 py-3">Est. Amount</th>
                      <th className="px-4 py-3">Risk Assessment</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900">{b.id}</td>
                        <td className="px-4 py-3.5 font-medium text-slate-800">{b.guest_name}</td>
                        <td className="px-4 py-3.5 text-slate-600">{b.hotel} (Room {b.room_type})</td>
                        <td className="px-4 py-3.5 text-slate-600">{b.arrival_date}</td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {b.nights} nights &bull; {b.total_guests} guests
                        </td>
                        <td className="px-4 py-3.5 font-bold text-blue-700">
                          ${b.total_amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">(${b.adr}/nt)</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              b.risk_level === 'LOW RISK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {b.risk_level === 'LOW RISK' ? '✓ ' : '⚠️ '}
                            {b.risk_level} ({b.cancellation_probability}%)
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              b.status === 'Confirmed'
                                ? 'bg-blue-50 text-blue-700'
                                : b.status === 'Checked-In'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {b.status}
                          </span>
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
