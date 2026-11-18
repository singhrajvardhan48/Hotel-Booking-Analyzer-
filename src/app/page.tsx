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
  Award,
  SlidersHorizontal,
  Compass,
  Check,
  BedDouble,
  Coffee,
  CreditCard,
  Car,
  Plane,
  Luggage,
  Hotel
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

interface PresetConfig {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.ReactNode;
  data: Partial<BookingInput>;
}

const PRESETS: PresetConfig[] = [
  {
    id: 'lowRiskFamily',
    name: 'Family Summer Vacation',
    badge: 'Low Risk Profile',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Direct booking, 25d advance, 2 requests, 1 parking space',
    icon: <Luggage className="w-4 h-4 text-emerald-400" />,
    data: {
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
    name: 'Corporate Business Traveler',
    badge: 'Low Risk Profile',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Corporate account, 12d advance, 1 adult, returning guest',
    icon: <Briefcase className="w-4 h-4 text-blue-400" />,
    data: {
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
    name: 'Agency Group Reservation',
    badge: 'High Risk Alert',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    description: 'Non-refund block, 240d lead time, 0 requests, prior cancel history',
    icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
    data: {
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
  },
  {
    id: 'lastMinuteOTA',
    name: 'Last-Minute Weekend OTA',
    badge: 'Moderate Risk',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Online TA, 4d lead time, transient individual, room only',
    icon: <Clock className="w-4 h-4 text-purple-400" />,
    data: {
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

export default function Home() {
  // SET RISK PREDICTOR AS THE DEFAULT LANDING PAGE TAB
  const [activeTab, setActiveTab] = useState<'predictor' | 'dashboard' | 'analytics' | 'model' | 'ledger'>('predictor');
  const [activePreset, setActivePreset] = useState<string>('lowRiskFamily');

  // Reservation Form State
  const [formData, setFormData] = useState<BookingInput>({
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
  });

  const [guestName, setGuestName] = useState('Alexander Wright');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ledgerBookings, setLedgerBookings] = useState<ReservationRecord[]>(initialBookings);
  const [ledgerFilter, setLedgerFilter] = useState<'ALL' | 'LOW RISK' | 'HIGH RISK'>('ALL');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Evaluate on initial load
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
    const updated = { ...formData, ...preset.data } as BookingInput;
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
    setLedgerBookings([newRecord, ...ledgerBookings]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
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

  const totalStayNights = Math.max(1, (formData.stays_in_weekend_nights || 0) + (formData.stays_in_week_nights || 0));
  const estimatedBookingValue = Math.round(totalStayNights * formData.adr);

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-100 pb-20 selection:bg-blue-500 selection:text-white">
      {/* ========================================================================= */}
      {/* HEADER & NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#0d1527]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-[#0d1527] rounded-[10px] flex items-center justify-center">
                  <Hotel className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0d1527]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  GrandStay Intelligence
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  ML Engine v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hospitality Demand & Cancellation Risk Mitigation Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-3 text-xs bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Accuracy: <strong className="text-white">85.16%</strong></span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="text-slate-300">
                Dataset: <strong className="text-white">119,208 Records</strong>
              </div>
            </div>

            <a
              href="https://github.com/singhrajvardhan48/Hotel-Booking-Analyzer-"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs - RISK PREDICTOR FIRST */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 overflow-x-auto py-2.5 border-t border-slate-800/50 scrollbar-none">
          {[
            { id: 'predictor', label: 'Risk Predictor', icon: ShieldCheck, highlight: true },
            { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
            { id: 'analytics', label: 'Booking Analytics & EDA', icon: TrendingUp },
            { id: 'model', label: 'Model Specs & XAI', icon: Award },
            { id: 'ledger', label: 'Front Desk Ledger', icon: Layers, count: ledgerBookings.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                )}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ========================================================================= */}
        {/* TAB 1: CANCELLATION RISK PREDICTOR (DEFAULT LANDING PAGE) */}
        {/* ========================================================================= */}
        {activeTab === 'predictor' && (
          <div className="space-y-6">
            {/* Landing Hero Spotlight Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111c35] via-[#0d162b] to-[#0a0f1d] border border-blue-500/20 p-6 sm:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-400/30 mb-3 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Real-Time AI Intake & Cancellation Scoring</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                  Hotel Booking Cancellation Risk Engine
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Simulate any reservation parameter in real-time. Our trained ensemble Random Forest evaluates guest commitment, seasonality, advance lead time, and booking channels in &lt;2 milliseconds to safeguard hotel revenue.
                </p>

                {/* Quick Model Performance Stats Pills */}
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700/70 text-slate-300 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span><strong>85.16%</strong> Test Accuracy</span>
                  </span>
                  <span className="px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700/70 text-slate-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span><strong>86.67%</strong> Precision Rate</span>
                  </span>
                  <span className="px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700/70 text-slate-300 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span><strong>&lt;2ms</strong> Response Time</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Scenario Quick-Presets Bar */}
            <div className="bg-[#0f172a]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  <span>One-Click Realistic Scenarios:</span>
                </div>
                <span className="text-[11px] text-slate-500">Click any card to instantly autofill and evaluate</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PRESETS.map((preset) => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                            {preset.icon}
                          </div>
                          <span className="text-xs font-bold text-slate-100">{preset.name}</span>
                        </div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${preset.badgeColor}`}>
                          {preset.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {preset.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Predictor Layout: Form on Left (7 cols), Sticky Result on Right (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Container */}
              <div className="lg:col-span-7 bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Hotel className="w-5 h-5 text-blue-400" />
                      <span>Reservation Intake Form</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Modify values below for instant risk re-calculation</p>
                  </div>
                  <button
                    onClick={() => handlePredict(formData)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-bold text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition flex items-center space-x-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Re-evaluate</span>
                  </button>
                </div>

                {/* Section 1: Property & Accommodation */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>1. Property & Room Configuration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Guest Full Name</label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                        placeholder="e.g. Elena Vance"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Hotel Property</label>
                      <select
                        value={formData.hotel}
                        onChange={(e) => {
                          const updated = { ...formData, hotel: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      >
                        <option value="City Hotel">City Hotel (Lisbon Metropolitan)</option>
                        <option value="Resort Hotel">Resort Hotel (Algarve Coast)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Reserved Room Type</label>
                      <select
                        value={formData.reserved_room_type}
                        onChange={(e) => {
                          const updated = { ...formData, reserved_room_type: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      >
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((r) => (
                          <option key={r} value={r}>Room Category {r} (Standard/Suite)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Meal Package Plan</label>
                      <select
                        value={formData.meal}
                        onChange={(e) => {
                          const updated = { ...formData, meal: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      >
                        <option value="BB">BB - Bed & Breakfast (Most Common)</option>
                        <option value="HB">HB - Half Board (Breakfast + Dinner)</option>
                        <option value="FB">FB - Full Board (All Meals)</option>
                        <option value="SC">SC - Self Catering (Room Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Deposit Policy <span className="text-rose-400 font-bold">*Critical Feature</span>
                      </label>
                      <select
                        value={formData.deposit_type}
                        onChange={(e) => {
                          const updated = { ...formData, deposit_type: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      >
                        <option value="No Deposit">No Deposit Guarantee</option>
                        <option value="Non Refund">Non Refund (Fixed Block)</option>
                        <option value="Refundable">Refundable Deposit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Booking Market Segment</label>
                      <select
                        value={formData.market_segment}
                        onChange={(e) => {
                          const updated = { ...formData, market_segment: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      >
                        <option value="Online TA">Online Travel Agent (OTA)</option>
                        <option value="Offline TA/TO">Offline Tour Operator</option>
                        <option value="Direct">Direct Hotel Website / Phone</option>
                        <option value="Corporate">Corporate Agreement</option>
                        <option value="Groups">Group Reservation</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Dates, Duration & Pricing */}
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>2. Stay Timeline, Lead Time & Pricing</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Arrival Month</label>
                      <select
                        value={formData.arrival_date_month}
                        onChange={(e) => {
                          const updated = { ...formData, arrival_date_month: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
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
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Weekend Nights (Sat/Sun)</label>
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Weekday Nights (Mon-Fri)</label>
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Tactile Sliders for Lead Time and ADR */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/60">
                    <div>
                      <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                        <span className="text-slate-300">Lead Time (Advance Days)</span>
                        <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
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
                        className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>0d (Same day)</span>
                        <span>180d</span>
                        <span>365d (1 year)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                        <span className="text-slate-300">Average Daily Rate (ADR)</span>
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
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
                        className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>$20 (Budget)</span>
                        <span>$150 (Mid)</span>
                        <span>$400+ (Luxury)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Guest Demographics & Engagement Signals */}
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <Users className="w-4 h-4" />
                    <span>3. Guest Demographics & Behavioral Signals</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Adults</label>
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Children</label>
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Guest Origin Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => {
                          const updated = { ...formData, country: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      >
                        {TOP_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Returning Guest?</label>
                      <select
                        value={formData.is_repeated_guest}
                        onChange={(e) => {
                          const updated = { ...formData, is_repeated_guest: e.target.value };
                          setFormData(updated);
                          handlePredict(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      >
                        <option value="0">No (New Guest)</option>
                        <option value="1">Yes (Loyalty Member)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Special Requests (0-5)
                      </label>
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                      <span className="text-[10px] text-emerald-400 font-medium mt-1 block">Higher requests = higher commitment</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Parking Spaces (0-3)
                      </label>
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Travel by car correlates to arrival</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Previous Cancellations
                      </label>
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                      <span className="text-[10px] text-rose-400 font-medium mt-1 block">History is a strong risk multiplier</span>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    onClick={() => handlePredict(formData)}
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Ensemble Forest...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Run Machine Learning Risk Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* STICKY PREDICTION RESULT PANEL (RIGHT 5 COLS) */}
              <div className="lg:col-span-5 sticky top-28 space-y-4">
                {prediction && (
                  <div className={`p-6 rounded-3xl border shadow-2xl transition-all duration-300 backdrop-blur-xl ${
                    prediction.risk_level === 'LOW RISK'
                      ? 'bg-gradient-to-b from-[#0b1f1c] via-[#0d1c24] to-[#09131a] border-emerald-500/40 shadow-emerald-950/40'
                      : 'bg-gradient-to-b from-[#240e16] via-[#1a0f19] to-[#0d0914] border-rose-500/40 shadow-rose-950/40'
                  }`}>
                    {/* Header Pill */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Predictive Intelligence Verdict
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        Inference &lt;2ms
                      </span>
                    </div>

                    {/* Risk Status Indicator */}
                    <div className="text-center my-4">
                      <div className={`inline-flex p-3 rounded-2xl mb-3 shadow-lg ${
                        prediction.risk_level === 'LOW RISK'
                          ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/40 shadow-emerald-500/20'
                          : 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-400/40 shadow-rose-500/20'
                      }`}>
                        {prediction.risk_level === 'LOW RISK' ? (
                          <CheckCircle2 className="w-9 h-9" />
                        ) : (
                          <AlertTriangle className="w-9 h-9" />
                        )}
                      </div>

                      <div className="text-2xl font-black tracking-tight text-white">
                        {prediction.risk_level === 'LOW RISK'
                          ? 'LOW CANCELLATION RISK'
                          : 'HIGH CANCELLATION RISK'}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                        {prediction.risk_level === 'LOW RISK'
                          ? 'Statistical parameters indicate guest is highly committed to completing this stay.'
                          : 'High probability of cancellation. Intervention or collateral guarantees recommended.'}
                      </p>
                    </div>

                    {/* Dual Gauge Meters */}
                    <div className="space-y-3 bg-black/30 p-4 rounded-2xl border border-white/5 my-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" /> <span>Check-in Probability</span>
                          </span>
                          <span className="text-emerald-400 font-extrabold">{prediction.confirmation_probability}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700 shadow-sm"
                            style={{ width: `${prediction.confirmation_probability}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-rose-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> <span>Cancellation Risk</span>
                          </span>
                          <span className="text-rose-400 font-extrabold">{prediction.cancellation_probability}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                          <div
                            className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-700 shadow-sm"
                            style={{ width: `${prediction.cancellation_probability}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Value Summary */}
                    <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-3 rounded-2xl border border-white/5 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Duration</div>
                        <div className="font-extrabold text-white text-sm mt-0.5">{totalStayNights} Nights</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Rate/Night</div>
                        <div className="font-extrabold text-emerald-400 text-sm mt-0.5">${formData.adr}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Total Revenue</div>
                        <div className="font-extrabold text-blue-300 text-sm mt-0.5">${estimatedBookingValue.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Contributing Risk Factors */}
                    <div className="mt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                        <span>Key Driver Explanations</span>
                      </div>
                      <div className="space-y-1.5">
                        {prediction.risk_factors.map((rf, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-start space-x-2"
                          >
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase mt-0.5 ${
                              rf.impact === 'high'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : rf.impact === 'medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {rf.impact}
                            </span>
                            <div className="flex-1">
                              <div className="font-bold text-slate-200 text-xs">{rf.factor}</div>
                              <div className="text-slate-400 text-[11px] mt-0.5">{rf.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Managerial Recommendations */}
                    <div className="mt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Recommended Front-Desk Action</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2 bg-black/20 p-2 rounded-xl">
                            <span className="text-blue-400 font-bold">•</span>
                            <span className="text-[11px] leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Save to Ledger Button */}
                    <div className="mt-5 pt-3 border-t border-white/10">
                      <button
                        onClick={handleSaveToLedger}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-xl text-xs transition border border-white/10 shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>{savedSuccess ? '✓ Saved to Reservations Ledger!' : 'Record Reservation to Ledger'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EXECUTIVE DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-[#0f172a]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Total Bookings</div>
                <div className="mt-1 text-2xl font-black text-white">
                  {analyticsData.summary.total_bookings.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] text-blue-400 font-semibold">100% Validated Data</div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Cancellation Rate</div>
                <div className="mt-1 text-2xl font-black text-rose-400">
                  {analyticsData.summary.cancellation_rate}%
                </div>
                <div className="mt-1 text-[11px] text-slate-500">44,153 cancellations</div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Model Accuracy</div>
                <div className="mt-1 text-2xl font-black text-emerald-400">
                  {(metadata.accuracy * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-[11px] text-emerald-500 font-semibold">Random Forest</div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Model Precision</div>
                <div className="mt-1 text-2xl font-black text-blue-400">
                  {(metadata.precision * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-[11px] text-slate-500">Low false alarm rate</div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Average Daily Rate</div>
                <div className="mt-1 text-2xl font-black text-amber-300">
                  ${analyticsData.summary.avg_adr}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">Per room per night</div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
                <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Avg Lead Time</div>
                <div className="mt-1 text-2xl font-black text-indigo-400">
                  {analyticsData.summary.avg_lead_time}d
                </div>
                <div className="mt-1 text-[11px] text-slate-500">Booking to check-in</div>
              </div>
            </div>

            {/* Strategic Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Deposit Paradox</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bookings with <b>Non-Refundable deposits</b> exhibit over <b>99% cancellation rates</b> in this dataset, largely reflecting tour group expired block reservations.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-500">#1 Predictive Feature (13.9%)</div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Lead Time Exposure</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Reservations booked with lead times greater than <b>180 days</b> experience a cancellation rate of <b>58.2%</b>, compared to just <b>16.8%</b> for bookings under 30 days.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-500">#4 Predictive Feature (10.4%)</div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Engagement Signal</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Guests who make at least <b>1 or 2 special requests</b> (floor, bed configuration, quiet room) are <b>2.5x more likely to proceed to check-in</b>.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-500">#5 Predictive Feature (7.2%)</div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition">
                <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs mb-2">
                  <Building2 className="w-4 h-4" />
                  <span>Property Dynamics</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <b>City Hotels</b> experience a significantly higher cancellation rate (<b>41.7%</b>) than <b>Resort Hotels</b> (<b>27.8%</b>), driven by business travel flexibility.
                </p>
                <div className="mt-3 text-[11px] font-semibold text-slate-500">79,302 City vs 39,906 Resort</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Monthly Booking Seasonality</span>
                  <span className="text-[10px] text-slate-400">Confirmed vs Cancelled</span>
                </h3>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthly.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="confirmed" name="Confirmed" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="canceled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Lead Time Cancellation Trajectory</span>
                  <span className="text-[10px] text-slate-400">Risk % by Advance Window</span>
                </h3>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.lead_time_distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis unit="%" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 80]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} formatter={(value) => `${value}%`} />
                      <Area type="monotone" dataKey="cancellation_rate" name="Cancellation Rate" stroke="#f43f5e" fill="#881337" fillOpacity={0.4} strokeWidth={2} />
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
            <div className="bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-white">Hospitality Demand & Cancellation Exploratory Analytics</h2>
                <p className="text-xs text-slate-400 mt-0.5">Aggregated distributions across 119,208 canonical reservations.</p>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 border border-slate-700">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>119,208 Total Historical Rows</span>
              </div>
            </div>

            {/* Row 1: Monthly Trends and ADR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Monthly Booking Volume by Season</h3>
                <p className="text-[11px] text-slate-400 mb-4">Confirmed reservations reach seasonal peak in August (8,624 bookings).</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-25} textAnchor="end" height={45} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="confirmed" name="Confirmed" fill="#10b981" stackId="a" />
                      <Bar dataKey="canceled" name="Cancelled" fill="#ef4444" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Average Daily Rate ($ ADR) Seasonality</h3>
                <p className="text-[11px] text-slate-400 mb-4">Room rates surge to $140.10 in August compared to $70.36 in January.</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-25} textAnchor="end" height={45} />
                      <YAxis unit="$" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[50, 160]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} formatter={(value) => `$${value}`} />
                      <Line type="monotone" dataKey="avg_adr" name="Avg ADR ($)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Market Segment & Customer Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Market Segment Cancellation Tendency</h3>
                <p className="text-[11px] text-slate-400 mb-4">Online Travel Agents drive 56,402 bookings with a 36.5% cancellation rate.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.market_segments} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                      <XAxis type="number" unit="%" domain={[0, 70]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis type="category" dataKey="segment" width={110} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} formatter={(value) => `${value}%`} />
                      <Bar dataKey="cancellation_rate" name="Cancellation %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Customer Type Cancellation Distribution</h3>
                <p className="text-[11px] text-slate-400 mb-4">Transient-Party bookings exhibit the highest risk at 40.5%.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.customer_types}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis unit="%" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 50]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} formatter={(value) => `${value}%`} />
                      <Bar dataKey="cancellation_rate" name="Cancellation Rate (%)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 3: Top Countries */}
            <div className="bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">Top Guest Origin Nationalities</h3>
              <p className="text-[11px] text-slate-400 mb-4">Volume and cancellation rates across key domestic and European visitor markets.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {analyticsData.countries.slice(0, 8).map((c, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">{c.country}</span>
                    <div className="text-base font-black text-white mt-2">{c.total.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Bookings</div>
                    <div className="mt-1 text-xs font-bold text-rose-400">{c.cancellation_rate}% Cancel</div>
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
            <div className="bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-400" />
                    <span>Machine Learning Architecture & Evaluation Metrics</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Random Forest ensemble trained on 95,366 samples, evaluated on 23,842 unseen test holdout records.
                  </p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                  F1-Score: {(metadata.f1_score * 100).toFixed(1)}%
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Accuracy</div>
                  <div className="text-3xl font-black text-blue-400 mt-1">{(metadata.accuracy * 100).toFixed(2)}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">Overall correct classifications</p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Precision</div>
                  <div className="text-3xl font-black text-emerald-400 mt-1">{(metadata.precision * 100).toFixed(2)}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">Low false alarm rate</p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Recall</div>
                  <div className="text-3xl font-black text-indigo-400 mt-1">{(metadata.recall * 100).toFixed(2)}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">Identifies 70.9% of cancellations</p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">F1 Score</div>
                  <div className="text-3xl font-black text-purple-400 mt-1">{(metadata.f1_score * 100).toFixed(2)}%</div>
                  <p className="text-[10px] text-slate-500 mt-1">Harmonic mean balance</p>
                </div>
              </div>
            </div>

            {/* Confusion Matrix and Feature Importances */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Confusion Matrix (23,842 Test Records)</h3>
                <p className="text-[11px] text-slate-400">Evaluated on stratified holdout test split without target leakage.</p>

                <div className="grid grid-cols-2 gap-3 mt-4 text-center">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">True Negative (TN)</div>
                    <div className="text-2xl font-black text-emerald-300 mt-1">
                      {metadata.confusion_matrix[0][0].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-500 mt-0.5">Correctly Confirmed</div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <div className="text-[10px] font-bold text-amber-400 uppercase">False Positive (FP)</div>
                    <div className="text-2xl font-black text-amber-300 mt-1">
                      {metadata.confusion_matrix[0][1].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-amber-500 mt-0.5">False Alarms (4.0%)</div>
                  </div>

                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                    <div className="text-[10px] font-bold text-rose-400 uppercase">False Negative (FN)</div>
                    <div className="text-2xl font-black text-rose-300 mt-1">
                      {metadata.confusion_matrix[1][0].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-rose-500 mt-0.5">Missed Cancellations</div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <div className="text-[10px] font-bold text-blue-400 uppercase">True Positive (TP)</div>
                    <div className="text-2xl font-black text-blue-300 mt-1">
                      {metadata.confusion_matrix[1][1].toLocaleString()}
                    </div>
                    <div className="text-[10px] text-blue-400 mt-0.5">Caught Cancellations</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-white">Hyperparameters:</div>
                  <div>• <b>Algorithm:</b> Scikit-Learn RandomForestClassifier</div>
                  <div>• <b>Estimators:</b> 100 Trees (max_depth=16)</div>
                  <div>• <b>Preprocessing:</b> ColumnTransformer (OneHotEncoder + SimpleImputer)</div>
                  <div>• <b>Leakage Safeguards:</b> Excluded <code>reservation_status</code> & <code>assigned_room_type</code></div>
                </div>
              </div>

              {/* Feature Importances Bar Chart */}
              <div className="lg:col-span-7 bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Top 12 Most Predictive Cancellation Drivers</h3>
                <p className="text-[11px] text-slate-400">Gini feature importance scores extracted from trained random forest trees.</p>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metadata.top_features.slice(0, 10).map((f) => ({
                        feature: f.Feature.replace('_', ' '),
                        importance: parseFloat((f.Importance * 100).toFixed(1)),
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                      <XAxis type="number" unit="%" domain={[0, 16]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis type="category" dataKey="feature" width={150} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} formatter={(val) => `${val}%`} />
                      <Bar dataKey="importance" name="Relative Weight (%)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
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
            <div className="bg-[#0f172a]/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-white">Front Desk Reservations Ledger</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live hotel management booking queue with integrated ML risk indicators.</p>
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
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500 w-48 sm:w-64"
                  />
                </div>
                <button
                  onClick={() => setLedgerFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    ledgerFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({ledgerBookings.length})
                </button>
                <button
                  onClick={() => setLedgerFilter('LOW RISK')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    ledgerFilter === 'LOW RISK' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  Low Risk
                </button>
                <button
                  onClick={() => setLedgerFilter('HIGH RISK')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    ledgerFilter === 'HIGH RISK' ? 'bg-rose-600 text-white' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  High Risk
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-[#0f172a]/90 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3.5">ID</th>
                      <th className="px-4 py-3.5">Guest Name</th>
                      <th className="px-4 py-3.5">Property / Room</th>
                      <th className="px-4 py-3.5">Arrival Date</th>
                      <th className="px-4 py-3.5">Nights / Guests</th>
                      <th className="px-4 py-3.5">Total Revenue</th>
                      <th className="px-4 py-3.5">Risk Level</th>
                      <th className="px-4 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3.5 font-extrabold text-blue-400">{b.id}</td>
                        <td className="px-4 py-3.5 font-bold text-white">{b.guest_name}</td>
                        <td className="px-4 py-3.5 text-slate-300">{b.hotel} (Room {b.room_type})</td>
                        <td className="px-4 py-3.5 text-slate-400">{b.arrival_date}</td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {b.nights} nights &bull; {b.total_guests} guests
                        </td>
                        <td className="px-4 py-3.5 font-bold text-emerald-400">
                          ${b.total_amount.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">(${b.adr}/nt)</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                              b.risk_level === 'LOW RISK'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {b.risk_level === 'LOW RISK' ? '✓ ' : '⚠️ '}
                            {b.risk_level} ({b.cancellation_probability}%)
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              b.status === 'Confirmed'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : b.status === 'Checked-In'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
