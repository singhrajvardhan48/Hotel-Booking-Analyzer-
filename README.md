# Hotel Booking System Using Machine Learning

A complete, end-to-end Machine Learning web application to predict hotel booking cancellations, manage reservations, and analyze hospitality booking dynamics using **Python, Streamlit, Pandas, Scikit-learn, and Joblib**.

---

## 1. Project Overview

In the hospitality sector, booking cancellations constitute a major operational challenge. Across the hotel industry, approximately **37% of reservations are cancelled prior to arrival**, causing vacant rooms, inefficient staff scheduling, and significant lost revenue.

The **Hotel Booking System Using Machine Learning** automates cancellation risk evaluation at the moment of reservation intake:
- **Intake & Booking Form:** Captures reservation parameters (hotel type, room type, arrival dates, guest counts, meal packages, lead times, deposit types).
- **Machine Learning Pipeline:** Employs an `sklearn.compose.ColumnTransformer` and an ensemble `RandomForestClassifier` trained on historical data.
- **Risk Classification:** Predicts whether a booking is **Low Cancellation Risk (Confirmed)** or **High Cancellation Risk (Likely to Cancel)** with an exact confidence percentage.
- **Exploratory Data Analytics (EDA):** Delivers interactive dashboards analyzing booking seasonality, customer segments, ADR, and cancellation drivers.

---

## 2. Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **Python 3.10+** | Core programming language |
| **Pandas** | Data wrangling, tabular manipulation, and cleaning |
| **NumPy** | Numerical computing and array processing |
| **Scikit-Learn** | Preprocessing (`ColumnTransformer`, `OneHotEncoder`, `SimpleImputer`) and `RandomForestClassifier` |
| **Matplotlib & Seaborn** | Statistical visualizations, distribution charts, and confusion matrix heatmap |
| **Joblib** | Model serialization (`model.pkl` and `preprocessor.pkl`) |
| **Streamlit** | Interactive multi-page web application frontend |

---

## 3. Dataset & Data Cleaning

The project uses the canonical **Hotel Booking Demand Dataset** (`hotel_bookings.csv`), consisting of **119,390 raw records and 32 attributes**.

### Data Cleaning Steps (`data_cleaning.py`):
1. **Handling Missing Values:**
   - `children`: 4 missing values imputed with `0`.
   - `country`: 488 missing values imputed with `'Unknown'`.
   - `agent`: 16,340 missing values imputed with `0` (indicating Direct Booking without travel agency).
   - `company`: 112,593 missing values (94.3%) imputed with `0` (indicating individual booking).
2. **Filtering Invalid Records & Outliers:**
   - Removed 180 invalid bookings where `adults + children + babies == 0`.
   - Removed negative and extreme outlier ADR values (`adr < 0` or `adr >= 5000`).
3. **Categorical Normalization:**
   - Replaced `'Undefined'` meal packages with `'SC'` (Self Catering / Room Only).
   - Normalized `'Undefined'` market segments and distribution channels.
   - Grouped low-frequency countries into `'Other'` while preserving the Top 15 nationalities (`PRT`, `GBR`, `FRA`, `ESP`, `DEU`, etc.).
4. **Preventing Target Leakage:**
   - Excluded `reservation_status` (which directly reveals `'Check-Out'` or `'Canceled'`) and `reservation_status_date`.
   - Excluded `assigned_room_type` to evaluate risk purely based on initial reservation requests (`reserved_room_type`).
5. **Output Cleaned Dataset:**
   - Saved clean data to `cleaned_hotel_bookings.csv` (119,208 valid rows).

---

## 4. Machine Learning Model & Evaluation

The predictive engine uses a **Random Forest Classifier** (`n_estimators=100`, `max_depth=16`, `min_samples_split=5`) trained on 95,366 samples and evaluated on **23,842 unseen test records (20% holdout split, stratified)**.

### Model Performance Metrics:

| Metric | Test Set Score | Description |
| :--- | :---: | :--- |
| **Accuracy** | **85.16%** | Overall percentage of correct predictions |
| **Precision** | **86.67%** | When predicting cancellation, model is correct 86.67% of the time |
| **Recall** | **70.86%** | Identifies 70.86% of all actual cancellations |
| **F1 Score** | **77.97%** | Harmonic balance between Precision and Recall |

### Confusion Matrix (Test Data):

$$\begin{pmatrix} \text{TN (Correctly Not Canceled)}: 14,039 & \text{FP (False Alarm)}: 963 \\ \text{FN (Missed Cancellation)}: 2,576 & \text{TP (Caught Cancellation)}: 6,264 \end{pmatrix}$$

### Top 5 Predictive Features:
1. **`deposit_type_Non Refund` (13.91%):** Bookings with non-refundable deposits correlate strongly with specific group/corporate risk patterns.
2. **`deposit_type_No Deposit` (11.09%):** Zero financial commitment increases guest drop-off.
3. **`country_PRT` (10.97%):** Domestic bookings exhibit unique cancellation behaviors.
4. **`lead_time` (10.43%):** Extended lead times significantly inflate cancellation probability.
5. **`total_of_special_requests` (7.16%):** Engaged guests who submit requests are far less likely to cancel.

---

## 5. Project Structure

```text
hotel-booking-system/
│
├── app.py                      # Streamlit web application (4 pages)
├── data_cleaning.py            # Data loading, inspection, cleaning & ColumnTransformer pipeline
├── eda.py                      # Exploratory Data Analysis & visual generation
├── train_model.py              # Model training, test evaluation & artifact serialization
├── requirements.txt            # Required Python packages
├── README.md                   # Complete documentation
│
├── hotel_bookings.csv          # Original dataset (119,390 rows)
├── cleaned_hotel_bookings.csv  # Cleaned dataset (119,208 rows)
├── model.pkl                   # Trained Random Forest classifier
├── preprocessor.pkl            # Fitted ColumnTransformer pipeline
├── models_metadata.json        # Saved evaluation metrics
│
└── assets/                     # Generated charts used in reports and UI
    ├── hotel_type_distribution.png
    ├── cancellation_rate.png
    ├── monthly_booking_trends.png
    ├── adr_distribution.png
    ├── customer_type_distribution.png
    ├── room_type_distribution.png
    ├── lead_time_vs_cancellation.png
    ├── confusion_matrix.png
    └── feature_importance.png
```

---

## 6. Installation & Execution Instructions

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Clean the Dataset
```bash
python data_cleaning.py
```

### Step 3: Run Exploratory Data Analysis (EDA)
```bash
python eda.py
```

### Step 4: Train and Save the Model Artifacts
Generates `model.pkl` and `preprocessor.pkl`:
```bash
python train_model.py
```

### Step 5: Launch the Streamlit Application
```bash
streamlit run app.py
```
Open your browser at **`http://localhost:8501`**.

---

## 7. Streamlit Application Pages

1. **🏠 Home:** Introduction to hotel demand, problem statement, technology breakdown, and architecture flowchart.
2. **📝 Make a Booking & Predict:** Interactive reservation form for hotel type, room type, guest counts, arrival dates, meal plans, deposit status, and ADR. Outputs instant **Low Cancellation Risk** (green) or **High Cancellation Risk** (red) with probability meters and management recommendations.
3. **📊 Booking Analytics:** Interactive dashboards detailing hotel type distribution, monthly arrival patterns, ADR boxplots, customer type splits, and raw data explorer.
4. **🎯 Model Performance:** Live evaluation metrics, confusion matrix heatmap, and top 12 feature importances.

