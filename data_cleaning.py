"""
=============================================================================
HOTEL BOOKING SYSTEM USING MACHINE LEARNING
Module: Data Cleaning and Preprocessing (data_cleaning.py)

Description:
This module performs data loading, inspection, missing value imputation,
handling of outliers, removal of invalid records, and construction of the
Scikit-Learn ColumnTransformer preprocessor.
=============================================================================
"""

import os
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder


# Top 15 countries with highest booking volume in the dataset
TOP_COUNTRIES = [
    'PRT', 'GBR', 'FRA', 'ESP', 'DEU', 'ITA', 'IRL', 
    'BEL', 'BRA', 'NLD', 'USA', 'CHE', 'CN', 'AUT', 'SWE'
]

# Features selected for model training and user inference
NUMERICAL_FEATURES = [
    'lead_time',
    'stays_in_weekend_nights',
    'stays_in_week_nights',
    'adults',
    'children',
    'babies',
    'previous_cancellations',
    'previous_bookings_not_canceled',
    'booking_changes',
    'days_in_waiting_list',
    'adr',
    'required_car_parking_spaces',
    'total_of_special_requests'
]

CATEGORICAL_FEATURES = [
    'hotel',
    'arrival_date_month',
    'meal',
    'country',
    'market_segment',
    'distribution_channel',
    'is_repeated_guest',
    'reserved_room_type',
    'deposit_type',
    'customer_type'
]

TARGET_COLUMN = 'is_canceled'

# Target leakage columns to exclude from feature matrix
LEAKAGE_COLUMNS = [
    'reservation_status',
    'reservation_status_date',
    'assigned_room_type'  # Post-booking assignment often introduces operational bias
]


def load_data(filepath="hotel_bookings.csv"):
    """
    Loads hotel bookings dataset from a CSV file.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Dataset not found at: {filepath}")
    df = pd.read_csv(filepath)
    return df


def inspect_data(df):
    """
    Displays dataset dimensions, column types, missing values, and duplicate counts.
    """
    print("\n" + "=" * 65)
    print("           HOTEL BOOKINGS DATASET INSPECTION")
    print("=" * 65)
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Duplicate records: {df.duplicated().sum()}")
    
    print("\nMissing Values:")
    missing = df.isnull().sum()
    missing_cols = missing[missing > 0]
    if len(missing_cols) > 0:
        for col, count in missing_cols.items():
            pct = (count / len(df)) * 100
            print(f"  - {col:15s}: {count:6d} missing ({pct:.2f}%)")
    else:
        print("  No missing values found.")
        
    print("\nTarget Variable (is_canceled) Distribution:")
    counts = df['is_canceled'].value_counts()
    for val, count in counts.items():
        status = "Canceled (1)" if val == 1 else "Not Canceled (0)"
        print(f"  - {status:20s}: {count:6d} ({count / len(df) * 100:.2f}%)")
    print("=" * 65 + "\n")


def clean_dataset(df, save_path="cleaned_hotel_bookings.csv"):
    """
    Performs data cleaning:
    1. Imputes missing values:
       - children: imputed with 0
       - country: imputed with 'Unknown'
       - agent: imputed with 0 (No Agent / Direct)
       - company: imputed with 0 (No Company)
    2. Filters out invalid records:
       - Bookings where total guests (adults + children + babies) == 0
       - Extreme or negative ADR values (adr < 0 or adr > 5000)
    3. Normalizes categorical values:
       - Replaces 'Undefined' meal with 'SC' (Self Catering)
       - Groups low-frequency countries into 'Other'
       - Normalizes market segment and distribution channel 'Undefined'
    4. Drops target leakage columns.
    5. Saves the cleaned dataset.
    """
    cleaned = df.copy()
    
    # 1. Impute missing values
    cleaned['children'] = cleaned['children'].fillna(0)
    cleaned['country'] = cleaned['country'].fillna('Unknown')
    if 'agent' in cleaned.columns:
        cleaned['agent'] = cleaned['agent'].fillna(0)
    if 'company' in cleaned.columns:
        cleaned['company'] = cleaned['company'].fillna(0)
        
    # 2. Filter out invalid rows (0 guests)
    initial_len = len(cleaned)
    valid_guests = (cleaned['adults'] + cleaned['children'] + cleaned['babies']) > 0
    cleaned = cleaned[valid_guests]
    print(f"Removed {initial_len - len(cleaned)} rows with 0 total guests.")
    
    # Filter out ADR outliers
    initial_len = len(cleaned)
    cleaned = cleaned[(cleaned['adr'] >= 0) & (cleaned['adr'] < 5000)]
    print(f"Removed {initial_len - len(cleaned)} rows with invalid or outlier ADR.")
    
    # 3. Clean categorical values
    cleaned['meal'] = cleaned['meal'].replace('Undefined', 'SC')
    cleaned['market_segment'] = cleaned['market_segment'].replace('Undefined', 'Online TA')
    cleaned['distribution_channel'] = cleaned['distribution_channel'].replace('Undefined', 'TA/TO')
    
    # Group country to Top 15 + 'Other'
    cleaned['country'] = cleaned['country'].apply(lambda c: c if c in TOP_COUNTRIES else 'Other')
    
    # Drop target leakage columns if present
    for col in LEAKAGE_COLUMNS:
        if col in cleaned.columns:
            cleaned = cleaned.drop(columns=[col])
            
    # Drop company and agent columns as they are IDs with extreme sparsity
    for col in ['company', 'agent']:
        if col in cleaned.columns:
            cleaned = cleaned.drop(columns=[col])
            
    # Ensure is_repeated_guest is treated as categorical string
    cleaned['is_repeated_guest'] = cleaned['is_repeated_guest'].astype(str)
    
    # Save cleaned dataset
    if save_path:
        cleaned.to_csv(save_path, index=False)
        print(f"Cleaned dataset saved successfully to: {save_path} ({len(cleaned)} rows)")
        
    return cleaned


def build_preprocessor():
    """
    Constructs an sklearn ColumnTransformer:
    - Numerical: SimpleImputer(strategy='median')
    - Categorical: SimpleImputer(strategy='most_frequent') + OneHotEncoder(handle_unknown='ignore')
    """
    num_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median'))
    ])
    
    cat_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, NUMERICAL_FEATURES),
            ('cat', cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder='drop'
    )
    
    return preprocessor


def get_feature_lists():
    """
    Returns numerical and categorical feature column names.
    """
    return NUMERICAL_FEATURES, CATEGORICAL_FEATURES, TARGET_COLUMN


if __name__ == "__main__":
    raw_df = load_data("hotel_bookings.csv")
    inspect_data(raw_df)
    cleaned_df = clean_dataset(raw_df, "cleaned_hotel_bookings.csv")
    print(f"\nFinal Cleaned Shape: {cleaned_df.shape}")
    print("Data cleaning completed successfully!")

