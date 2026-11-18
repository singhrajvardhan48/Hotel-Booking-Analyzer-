# GrandStay Intelligence | Hotel Booking & ML Cancellation Prediction Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsinghrajvardhan48%2FHotel-Booking-Analyzer-)
![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.3-blue?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38bdf8?style=flat-square&logo=tailwind-css)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3-orange?style=flat-square&logo=scikit-learn)
![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel%20Serverless-emerald?style=flat-square&logo=vercel)

A production-grade, full-stack Machine Learning web application designed to forecast hotel reservation cancellations, manage bookings, and analyze hospitality booking dynamics across 119,208 canonical reservations.

---

## 🚀 Live Vercel Deployment

Deploying this repository to **Vercel** requires **zero configuration**:

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New"** > **"Project"**.
3. Import this repository: `https://github.com/singhrajvardhan48/Hotel-Booking-Analyzer-`.
4. Vercel automatically detects the **Next.js** framework.
5. Click **"Deploy"** — your live full-stack app and serverless API endpoints will be live worldwide in under 2 minutes!

---

## 🌟 Key Application Features

### 1. 📊 Executive Hospitality Dashboard
- High-level KPIs: Total Bookings (119,208), Historical Cancellation Rate (37.0%), ADR ($101.83), Model Accuracy (85.16%), Precision (86.67%).
- Strategic insight panels breaking down the Non-Refundable Deposit Paradox, Lead Time Risk Thresholds, and Special Request Engagement Signals.
- Monthly confirmed vs. cancelled seasonality charts.

### 2. 🛎️ Instant Cancellation Risk Predictor
- Full booking intake form covering property type, room category, meal package, deposit guarantees, lead times, nightly rate, guest party counts, and special requests.
- **One-Click Quick Presets**:
  - 🏖️ *Family Vacation (Low Risk)*
  - 💼 *Corporate Traveler (Low Risk)*
  - ⚠️ *High-Risk Group / OTA (High Risk)*
  - ⚡ *Last-Minute Leisure*
- **Real-Time ML Verdict**: Outputs *Low Cancellation Risk* (Confirmed) or *High Cancellation Risk* (Likely to Cancel) with exact probability scores (`<2ms` inference time).
- **Contributing Factors Breakdown**: Explains which specific reservation parameters drove the score.
- **Actionable Managerial Playbooks**: Automated recommendations for deposits, reminders, and waitlist allocations.

### 3. 📈 Interactive Analytics & Exploratory Data Analysis (EDA)
- **Seasonality Curves**: Monthly booking volume and ADR trends (Jan–Dec).
- **Property Split**: City Hotel vs. Resort Hotel cancellation dynamics.
- **Market Segments**: Online TA, Offline TA, Direct, Corporate, and Group performance.
- **Lead Time Analysis**: Cancellation trajectories bucketed from 0 to 365+ days.
- **Geographic Origins**: Volume and cancellation behavior across top domestic and international markets.

### 4. 🎯 Model Performance & Explainability (XAI)
- Live specs: Scikit-Learn `RandomForestClassifier` (100 Trees, `max_depth=16`).
- Evaluated on **23,842 unseen test records (20% stratified holdout)** without target leakage.
- Confusion Matrix (14,039 TN, 963 FP, 2,576 FN, 6,264 TP).
- Top 12 Gini Feature Importances chart.

### 5. 📋 Front Desk Reservations Ledger
- Interactive reservation queue with real-time risk indicators and search filters.
- Direct persistence: Save evaluated bookings from the predictor into the active front-desk ledger.

---

## 🧠 Machine Learning Engine & Metrics

| Metric | Score | Description |
| :--- | :---: | :--- |
| **Accuracy** | **85.16%** | Overall classification accuracy on unseen test data |
| **Precision** | **86.67%** | When predicting cancellation, model is correct 86.67% of the time |
| **Recall** | **70.86%** | Identifies 70.86% of all actual cancellations |
| **F1 Score** | **77.97%** | Harmonic balance between Precision and Recall |

### Top 5 Predictive Features:
1. **`deposit_type_Non Refund` (13.91%):** Bulk travel agency group allocations exhibit automated expiration patterns.
2. **`deposit_type_No Deposit` (11.09%):** Zero financial commitment increases guest drop-off.
3. **`country_PRT` (10.97%):** Domestic bookings exhibit distinct seasonality and flexibility.
4. **`lead_time` (10.43%):** Extended advance booking windows inflate cancellation probability.
5. **`total_of_special_requests` (7.16%):** Engaged guests who submit requests are far less likely to cancel.

---

## 🛠️ Full-Stack Architecture (Vercel-Ready)

```text
Hotel Booking Analyzer/
├── src/                              # Next.js 14 Full-Stack Web App (Deployed to Vercel)
│   ├── app/
│   │   ├── api/
│   │   │   ├── predict/route.ts      # Serverless ML cancellation inference API
│   │   │   ├── analytics/route.ts    # Aggregated EDA dataset statistics API
│   │   │   ├── model-info/route.ts   # Model metadata and confusion matrix API
│   │   │   ├── bookings/route.ts     # Reservations ledger API (GET, POST)
│   │   │   └── health/route.ts       # Service healthcheck endpoint
│   │   ├── icon.svg                  # Application favicon
│   │   ├── globals.css               # Minimalist Tailwind CSS styling
│   │   ├── layout.tsx                # App root layout
│   │   └── page.tsx                  # Risk Predictor landing page & dashboards
│   ├── data/
│   │   ├── analytics_data.json       # Precomputed dataset aggregations (119k rows)
│   │   ├── forest_model.json         # High-speed compact decision forest
│   │   └── models_metadata.json      # Model performance statistics
│   ├── lib/
│   │   ├── predictor.ts              # Tree traversal inference engine (<2ms)
│   │   └── mockBookings.ts           # Initial ledger reservations
│   └── types/
│       └── index.ts                  # TypeScript schema definitions
│
├── vercel.json                       # Vercel framework & API headers config
├── .vercelignore                     # Excludes heavy ML training files from Vercel upload
├── package.json                      # Next.js & React dependencies
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind design token configuration
│
└── ml_pipeline/                      # Offline Python ML Training & Legacy Streamlit App
    ├── app.py                        # Legacy Streamlit web application
    ├── fastapi_server.py             # Standalone Python FastAPI backend
    ├── data_cleaning.py              # Scikit-Learn data cleaning pipeline
    ├── eda.py                        # Exploratory data analysis script
    ├── train_model.py                # Scikit-Learn model training script
    ├── requirements.txt              # Python dependencies
    ├── hotel_bookings.csv            # Raw dataset
    ├── cleaned_hotel_bookings.csv    # Cleaned dataset
    ├── model.pkl / preprocessor.pkl  # Serialized scikit-learn artifacts
    └── assets/                       # Static EDA charts
```

---

## 💻 Local Development Setup

### Option 1: Run the Next.js Full-Stack App (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

To verify a production build:
```bash
npm run build
npm start
```

---

### Option 2: Run the Python FastAPI Backend (Optional)

```bash
cd ml_pipeline
pip install -r requirements.txt
uvicorn fastapi_server:app --reload --port 8000
```
Open **[http://localhost:8000/docs](http://localhost:8000/docs)** to view the Swagger API documentation.

---

### Option 3: Run the Legacy Streamlit Application

```bash
cd ml_pipeline
pip install -r requirements.txt
streamlit run app.py
```
Open **[http://localhost:8501](http://localhost:8501)** in your browser.

---

## 📡 Serverless API Reference

### 1. `POST /api/predict`
Evaluates cancellation risk for a reservation.

**Request Body:**
```json
{
  "hotel": "City Hotel",
  "reserved_room_type": "A",
  "meal": "BB",
  "deposit_type": "No Deposit",
  "market_segment": "Online TA",
  "customer_type": "Transient",
  "distribution_channel": "TA/TO",
  "arrival_date_month": "July",
  "stays_in_weekend_nights": 1,
  "stays_in_week_nights": 3,
  "lead_time": 45,
  "adr": 115.0,
  "adults": 2,
  "children": 0,
  "babies": 0,
  "country": "PRT",
  "is_repeated_guest": "0",
  "total_of_special_requests": 1,
  "required_car_parking_spaces": 0,
  "previous_cancellations": 0,
  "previous_bookings_not_canceled": 0,
  "booking_changes": 0,
  "days_in_waiting_list": 0
}
```

**Response (200 OK):**
```json
{
  "prediction": 0,
  "risk_level": "LOW RISK",
  "cancellation_probability": 23.4,
  "confirmation_probability": 76.6,
  "confidence_score": 76.6,
  "estimated_revenue": 460.0,
  "total_nights": 4,
  "risk_factors": [
    {
      "factor": "Zero Financial Commitment",
      "impact": "medium",
      "description": "Guest has no deposit collateral, increasing propensity to no-show."
    }
  ],
  "recommendations": [
    "Booking exhibits low cancellation risk; assign preferred room tier promptly.",
    "Send pre-arrival concierge welcome message."
  ]
}
```

---

## 📄 License
MIT License. Created for hospitality revenue and reservations management research.
