"""
=============================================================================
HOTEL BOOKING SYSTEM USING MACHINE LEARNING
Module: Streamlit Web Application (app.py)

Description:
A comprehensive, clean, and user-friendly Hotel Booking web application.
Features:
1. Home: Overview, system introduction, and architecture.
2. Make a Booking: Form to input reservation details with instant ML prediction
   (Low Risk / High Risk with color indicators and probabilities).
3. Booking Analytics: Charts and metrics (Hotel distribution, monthly trends, ADR, etc.).
4. Model Performance: Test metrics, confusion matrix, and feature importances.
=============================================================================
"""

import os
import json
import datetime
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import streamlit as st

# Import configurations from data_cleaning
from data_cleaning import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TOP_COUNTRIES,
    clean_dataset,
    load_data
)


# -----------------------------------------------------------------------------
# Streamlit Application Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Hotel Booking & Risk Prediction System",
    page_icon="🏨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1e3a8a;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #4b5563;
        margin-bottom: 1.2rem;
    }
    .badge {
        display: inline-block;
        background-color: #dbeafe;
        color: #1e40af;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.8rem;
    }
    .stat-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 1.2rem;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-value {
        font-size: 1.9rem;
        font-weight: 700;
        color: #1e40af;
    }
    .stat-label {
        font-size: 0.88rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
    }
    .low-risk-box {
        background-color: #ecfdf5;
        border: 2px solid #10b981;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        margin-top: 1rem;
    }
    .high-risk-box {
        background-color: #fef2f2;
        border: 2px solid #ef4444;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        margin-top: 1rem;
    }
    .risk-header {
        font-size: 1.6rem;
        font-weight: 700;
        margin-bottom: 0.4rem;
    }
    .feature-card {
        background: #f8fafc;
        border-left: 4px solid #3b82f6;
        padding: 1rem;
        border-radius: 0 8px 8px 0;
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# Cached Resource Loaders
# -----------------------------------------------------------------------------
MODEL_FILE = "model.pkl"
PREPROCESSOR_FILE = "preprocessor.pkl"
METADATA_FILE = "models_metadata.json"
DATASET_FILE = "cleaned_hotel_bookings.csv"


@st.cache_resource(show_spinner="Loading trained Random Forest model and preprocessor...")
def load_ml_assets():
    """
    Loads model.pkl and preprocessor.pkl.
    """
    if os.path.exists(MODEL_FILE) and os.path.exists(PREPROCESSOR_FILE):
        try:
            model = joblib.load(MODEL_FILE)
            preprocessor = joblib.load(PREPROCESSOR_FILE)
            return model, preprocessor
        except Exception as e:
            st.error(f"Error loading artifacts: {e}")
            return None, None
    return None, None


@st.cache_data(show_spinner="Loading dataset analytics...")
def load_cleaned_data():
    """
    Loads the cleaned hotel bookings dataset for analytics.
    """
    if os.path.exists(DATASET_FILE):
        return pd.read_csv(DATASET_FILE)
    elif os.path.exists("hotel_bookings.csv"):
        raw = load_data("hotel_bookings.csv")
        return clean_dataset(raw, DATASET_FILE)
    return None


def load_metadata():
    """
    Loads saved evaluation metrics.
    """
    if os.path.exists(METADATA_FILE):
        try:
            with open(METADATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None


# -----------------------------------------------------------------------------
# Sidebar Navigation
# -----------------------------------------------------------------------------
st.sidebar.markdown("## 🏨 GrandStay Hotels")
st.sidebar.markdown(
    """
    <div style="background-color: #f1f5f9; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem;">
        <span style="font-size: 0.85rem; font-weight: 600; color: #334155;">Hotel Booking & Risk System</span><br>
        <span style="font-size: 0.78rem; color: #64748b;">Powered by Random Forest</span>
    </div>
    """,
    unsafe_allow_html=True
)

navigation = st.sidebar.radio(
    "Navigation Menu",
    [
        "📝 Make a Booking & Predict",
        "📊 Booking Analytics",
        "🎯 Model Performance"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info(
    """
    **System Information:**
    - **Dataset:** 119,208 Bookings
    - **Target:** Booking Cancellation (`is_canceled`)
    - **Classifier:** Random Forest
    - **Test Accuracy:** 85.16%
    """
)


# =============================================================================
# PAGE 1: MAKE A BOOKING & CANCELLATION PREDICTION
# =============================================================================
if navigation == "📝 Make a Booking & Predict":
    st.markdown('<div class="badge">📝 Reservation Desk</div>', unsafe_allow_html=True)
    st.markdown('<div class="main-title">Make a Hotel Booking & Predict Cancellation Risk</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Enter the reservation parameters below. The system will process the booking and evaluate cancellation risk in real-time.</div>', unsafe_allow_html=True)
    
    model, preprocessor = load_ml_assets()
    
    if model is None or preprocessor is None:
        st.error("⚠️ Model or preprocessor file is missing (`model.pkl` / `preprocessor.pkl`).")
        st.info("Please run `python train_model.py` in your terminal to train and serialize the model artifacts.")
    else:
        with st.form("hotel_booking_form"):
            st.markdown("#### 1. Hotel & Room Information")
            c1, c2, c3 = st.columns(3)
            with c1:
                hotel = st.selectbox("Hotel Type", options=["City Hotel", "Resort Hotel"], index=0)
                room_type = st.selectbox("Reserved Room Type", options=["A", "B", "C", "D", "E", "F", "G", "H"], index=0)
            with c2:
                meal = st.selectbox(
                    "Meal Package Preference",
                    options=["BB", "HB", "FB", "SC"],
                    index=0,
                    help="BB: Bed & Breakfast | HB: Half Board | FB: Full Board | SC: Room Only (Self Catering)"
                )
                deposit_type = st.selectbox(
                    "Deposit Type",
                    options=["No Deposit", "Non Refund", "Refundable"],
                    index=0,
                    help="Non Refund deposits strongly correlate with specific corporate / group bookings."
                )
            with c3:
                market_segment = st.selectbox(
                    "Market Segment",
                    options=["Online TA", "Offline TA/TO", "Direct", "Corporate", "Groups"],
                    index=0,
                    help="Booking channel source (Online Travel Agent, Tour Operator, Direct, etc.)"
                )
                customer_type = st.selectbox(
                    "Customer Type",
                    options=["Transient", "Contract", "Transient-Party", "Group"],
                    index=0
                )

            st.markdown("#### 2. Stay Duration & Arrival Date")
            c4, c5, c6 = st.columns(3)
            with c4:
                arrival_date = st.date_input("Arrival Date", datetime.date.today() + datetime.timedelta(days=30))
                arrival_month = arrival_date.strftime("%B")
                st.caption(f"Arrival Month: **{arrival_month}**")
            with c5:
                stays_weekend = st.number_input("Number of Weekend Nights (Sat/Sun)", min_value=0, max_value=14, value=1, step=1)
                stays_week = st.number_input("Number of Weekday Nights (Mon-Fri)", min_value=0, max_value=30, value=3, step=1)
            with c6:
                lead_time = st.number_input(
                    "Lead Time (Days between Booking & Arrival)",
                    min_value=0,
                    max_value=730,
                    value=45,
                    step=5,
                    help="Longer lead times generally feature higher cancellation probability."
                )
                adr = st.number_input(
                    "Average Daily Rate (ADR in $)",
                    min_value=0.0,
                    max_value=1500.0,
                    value=115.0,
                    step=5.0,
                    help="Average daily room price in dollars."
                )

            st.markdown("#### 3. Guest Profile & Historical Requests")
            c7, c8, c9 = st.columns(3)
            with c7:
                adults = st.number_input("Adults", min_value=1, max_value=10, value=2, step=1)
                children = st.number_input("Children", min_value=0, max_value=10, value=0, step=1)
                babies = st.number_input("Babies", min_value=0, max_value=5, value=0, step=1)
            with c8:
                country_choice = st.selectbox(
                    "Origin Country",
                    options=TOP_COUNTRIES + ["Other"],
                    index=0,
                    help="Country of guest nationality."
                )
                repeated_guest = st.selectbox("Repeated Guest?", options=["0 (No)", "1 (Yes)"], index=0)
                is_repeated = "1" if "1" in repeated_guest else "0"
            with c9:
                special_requests = st.number_input("Total Special Requests", min_value=0, max_value=5, value=1, step=1)
                parking_spaces = st.number_input("Required Car Parking Spaces", min_value=0, max_value=3, value=0, step=1)
                previous_cancellations = st.number_input("Previous Cancellations", min_value=0, max_value=20, value=0, step=1)

            st.markdown("<br>", unsafe_allow_html=True)
            submit_btn = st.form_submit_button("🛎️ Submit Booking & Predict Cancellation", type="primary", use_container_width=True)

        if submit_btn:
            # Construct single-row DataFrame matching the exact features used during training
            input_dict = {
                'lead_time': lead_time,
                'stays_in_weekend_nights': stays_weekend,
                'stays_in_week_nights': stays_week,
                'adults': adults,
                'children': float(children),
                'babies': babies,
                'previous_cancellations': previous_cancellations,
                'previous_bookings_not_canceled': 0,
                'booking_changes': 0,
                'days_in_waiting_list': 0,
                'adr': float(adr),
                'required_car_parking_spaces': parking_spaces,
                'total_of_special_requests': special_requests,
                'hotel': hotel,
                'arrival_date_month': arrival_month,
                'meal': meal,
                'country': country_choice,
                'market_segment': market_segment,
                'distribution_channel': 'TA/TO',
                'is_repeated_guest': is_repeated,
                'reserved_room_type': room_type,
                'deposit_type': deposit_type,
                'customer_type': customer_type
            }
            input_df = pd.DataFrame([input_dict])

            try:
                # Preprocess user input
                input_transformed = preprocessor.transform(input_df)
                
                # Make prediction
                prediction = model.predict(input_transformed)[0]
                probabilities = model.predict_proba(input_transformed)[0]
                
                prob_not_canceled = probabilities[0] * 100
                prob_canceled = probabilities[1] * 100

                st.markdown("### 🛎️ Reservation & Prediction Outcome")

                if prediction == 0:
                    st.markdown(f"""
                    <div class="low-risk-box">
                        <div style="font-size: 2.5rem;">✅</div>
                        <div class="risk-header" style="color: #065f46;">LOW CANCELLATION RISK / BOOKING CONFIRMED</div>
                        <p style="font-size: 1.05rem; color: #047857; margin-bottom: 0.5rem;">
                            The Random Forest model predicts this reservation is <b>highly likely to proceed to check-in</b>.
                        </p>
                        <span style="font-size: 1.25rem; font-weight: 700; color: #065f46;">
                            Completion Probability: {prob_not_canceled:.1f}% &nbsp;|&nbsp; Cancellation Risk: {prob_canceled:.1f}%
                        </span>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div class="high-risk-box">
                        <div style="font-size: 2.5rem;">⚠️</div>
                        <div class="risk-header" style="color: #991b1b;">HIGH CANCELLATION RISK / LIKELY TO BE CANCELED</div>
                        <p style="font-size: 1.05rem; color: #b91c1c; margin-bottom: 0.5rem;">
                            The Random Forest model predicts this reservation has a <b>high likelihood of cancellation</b>.
                        </p>
                        <span style="font-size: 1.25rem; font-weight: 700; color: #991b1b;">
                            Cancellation Risk Probability: {prob_canceled:.1f}% &nbsp;|&nbsp; Completion Probability: {prob_not_canceled:.1f}%
                        </span>
                        <div style="margin-top: 0.8rem; font-size: 0.9rem; color: #7f1d1d; background: #fee2e2; padding: 0.5rem; border-radius: 6px;">
                            💡 <b>Manager Recommendation:</b> Consider requesting a booking deposit, reconfirming via email, or scheduling an automated check-in reminder.
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                st.markdown("<br>", unsafe_allow_html=True)
                
                res_col1, res_col2 = st.columns(2)
                with res_col1:
                    st.markdown("#### 📊 Prediction Probability Meter")
                    prob_df = pd.DataFrame({
                        'Outcome': ['Will Check-In (Not Canceled)', 'Will Cancel (High Risk)'],
                        'Probability (%)': [prob_not_canceled, prob_canceled]
                    })
                    st.bar_chart(prob_df.set_index('Outcome'), use_container_width=True)

                with res_col2:
                    st.markdown("#### 📋 Reservation Details Summary")
                    total_nights = stays_weekend + stays_week
                    total_cost = total_nights * adr
                    st.json({
                        "Hotel": hotel,
                        "Arrival": f"{arrival_date} ({arrival_month})",
                        "Total Nights": f"{total_nights} nights ({stays_weekend} weekend, {stays_week} weekday)",
                        "Room Type": room_type,
                        "Estimated Total Revenue": f"${total_cost:,.2f} (${adr:.2f}/night)",
                        "Deposit Status": deposit_type,
                        "Special Requests": special_requests,
                        "Lead Time": f"{lead_time} days"
                    })

            except Exception as ex:
                st.error(f"Error during prediction pipeline execution: {ex}")


# =============================================================================
# PAGE 3: BOOKING ANALYTICS & EDA
# =============================================================================
elif navigation == "📊 Booking Analytics":
    st.markdown('<div class="badge">📈 Business Analytics</div>', unsafe_allow_html=True)
    st.markdown('<div class="main-title">Hotel Booking Exploratory Analytics</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Explore historical booking behavior, cancellation distributions, seasonality, and guest demographics.</div>', unsafe_allow_html=True)

    df_clean = load_cleaned_data()

    if df_clean is None:
        st.error("Cleaned dataset not found. Please run `python data_cleaning.py` first.")
    else:
        # Key Summary Metrics
        total_bookings = len(df_clean)
        canceled_count = (df_clean['is_canceled'] == 1).sum()
        cancel_rate = (canceled_count / total_bookings) * 100
        city_count = (df_clean['hotel'] == 'City Hotel').sum()
        resort_count = (df_clean['hotel'] == 'Resort Hotel').sum()
        avg_adr = df_clean['adr'].mean()

        m1, m2, m3, m4 = st.columns(4)
        with m1:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Total Bookings</div>
                <div class="stat-value">{total_bookings:,}</div>
                <small style="color: #64748b;">Historical reservations</small>
            </div>
            """, unsafe_allow_html=True)
        with m2:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Cancellation Rate</div>
                <div class="stat-value" style="color: #ef4444;">{cancel_rate:.1f}%</div>
                <small style="color: #64748b;">{canceled_count:,} cancelled</small>
            </div>
            """, unsafe_allow_html=True)
        with m3:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Hotel Type Split</div>
                <div class="stat-value" style="font-size: 1.3rem; margin-top: 0.5rem;">
                    City: {city_count:,}<br>Resort: {resort_count:,}
                </div>
            </div>
            """, unsafe_allow_html=True)
        with m4:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Average Daily Rate</div>
                <div class="stat-value" style="color: #10b981;">${avg_adr:.2f}</div>
                <small style="color: #64748b;">Per room night</small>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        # Tabs for Analytical Categories
        tab1, tab2, tab3, tab4 = st.tabs([
            "🏨 Hotel & Cancellation Overview",
            "📅 Monthly Trends & Seasonality",
            "👥 Guest & Room Demographics",
            "📁 Raw Data Inspector"
        ])

        with tab1:
            col_a, col_b = st.columns(2)
            with col_a:
                st.markdown("#### Hotel Type Distribution")
                if os.path.exists("assets/hotel_type_distribution.png"):
                    st.image("assets/hotel_type_distribution.png", use_container_width=True)
                st.caption("City Hotels account for roughly 66% of all recorded bookings, while Resort Hotels comprise 34%.")
            with col_b:
                st.markdown("#### Booking Cancellation Percentage")
                if os.path.exists("assets/cancellation_rate.png"):
                    st.image("assets/cancellation_rate.png", use_container_width=True)
                st.caption("37% of reservations in the dataset were cancelled prior to arrival.")

        with tab2:
            col_c, col_d = st.columns(2)
            with col_c:
                st.markdown("#### Most Popular Arrival Months")
                if os.path.exists("assets/monthly_booking_trends.png"):
                    st.image("assets/monthly_booking_trends.png", use_container_width=True)
                st.caption("Peak demand occurs during August and July, while January and November show lower reservation volume.")
            with col_d:
                st.markdown("#### Lead Time vs Cancellation Status")
                if os.path.exists("assets/lead_time_vs_cancellation.png"):
                    st.image("assets/lead_time_vs_cancellation.png", use_container_width=True)
                st.caption("Cancelled bookings have a significantly higher lead time (often >100 days) compared to completed stays.")

        with tab3:
            col_e, col_f = st.columns(2)
            with col_e:
                st.markdown("#### Average Daily Rate (ADR) Spread")
                if os.path.exists("assets/adr_distribution.png"):
                    st.image("assets/adr_distribution.png", use_container_width=True)
                st.caption("City Hotels exhibit higher median room rates, while Resort Hotels have wider seasonal fluctuations.")
            with col_f:
                st.markdown("#### Customer Type & Cancellation Breakdown")
                if os.path.exists("assets/customer_type_distribution.png"):
                    st.image("assets/customer_type_distribution.png", use_container_width=True)
                st.caption("Transient travelers represent the largest segment and display the highest absolute number of cancellations.")

        with tab4:
            st.markdown("#### Filterable Cleaned Dataset")
            st.dataframe(df_clean.head(20), use_container_width=True)
            st.download_button(
                "📥 Download Cleaned Dataset (CSV)",
                data=df_clean.to_csv(index=False),
                file_name="cleaned_hotel_bookings.csv",
                mime="text/csv"
            )


# =============================================================================
# PAGE 4: MODEL PERFORMANCE
# =============================================================================
elif navigation == "🎯 Model Performance":
    st.markdown('<div class="badge">🎯 Model Evaluation</div>', unsafe_allow_html=True)
    st.markdown('<div class="main-title">Random Forest Classifier Performance</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Evaluation on unseen holdout test data (23,842 reservations, 20% split).</div>', unsafe_allow_html=True)

    metadata = load_metadata()

    if metadata is None:
        st.warning("Model metadata file (`models_metadata.json`) not found.")
        st.info("Run `python train_model.py` to train and evaluate the model.")
    else:
        mp1, mp2, mp3, mp4 = st.columns(4)
        with mp1:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Accuracy</div>
                <div class="stat-value">{metadata['accuracy'] * 100:.2f}%</div>
                <small style="color: #64748b;">Overall correct predictions</small>
            </div>
            """, unsafe_allow_html=True)
        with mp2:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Precision</div>
                <div class="stat-value">{metadata['precision'] * 100:.2f}%</div>
                <small style="color: #64748b;">When predicting cancellation</small>
            </div>
            """, unsafe_allow_html=True)
        with mp3:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">Recall</div>
                <div class="stat-value">{metadata['recall'] * 100:.2f}%</div>
                <small style="color: #64748b;">Actual cancellations caught</small>
            </div>
            """, unsafe_allow_html=True)
        with mp4:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-label">F1 Score</div>
                <div class="stat-value">{metadata['f1_score'] * 100:.2f}%</div>
                <small style="color: #64748b;">Harmonic mean (P & R)</small>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        col_ev1, col_ev2 = st.columns(2)
        with col_ev1:
            st.markdown("#### Confusion Matrix Heatmap")
            if os.path.exists("assets/confusion_matrix.png"):
                st.image("assets/confusion_matrix.png", use_container_width=True)
            st.markdown("""
            **Interpretation:**
            - **True Negatives (TN):** Non-canceled bookings correctly predicted.
            - **True Positives (TP):** Canceled bookings correctly identified in advance.
            - **False Positives (FP):** False alarms (predicted cancel but guest arrived).
            - **False Negatives (FN):** Missed cancellations.
            """)

        with col_ev2:
            st.markdown("#### Top Predictive Features")
            if os.path.exists("assets/feature_importance.png"):
                st.image("assets/feature_importance.png", use_container_width=True)
            st.markdown("""
            **Key Feature Insights:**
            - **Deposit Type (Non Refund / No Deposit):** The single strongest predictor of cancellation probability.
            - **Country of Origin (PRT):** Regional booking patterns carry substantial weight.
            - **Lead Time:** The further in advance a room is reserved, the greater the statistical chance of cancellation.
            - **Special Requests:** Guests submitting special requests (high engagement) are far less likely to cancel.
            """)


# -----------------------------------------------------------------------------
# Footer
# -----------------------------------------------------------------------------
st.markdown("<br><br>", unsafe_allow_html=True)
st.markdown(
    """
    <div style="text-align: center; color: #94a3b8; font-size: 0.82rem; border-top: 1px solid #e2e8f0; padding-top: 1rem;">
        Hotel Booking System Using Machine Learning • Streamlit & Scikit-Learn • Random Forest Classifier
    </div>
    """,
    unsafe_allow_html=True
)

