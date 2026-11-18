"""
=============================================================================
PROJECT 1: HOTEL BOOKING ANALYSIS (dataset: hotel_bookings.csv)
Script: hotel_booking_analysis.py

This script implements solutions for all tasks:
- Prep: Data cleaning, duplicate removal, date fixing, missing value handling
- Q1: Confirmed bookings per month for City Hotel vs Resort Hotel (Line/Bar plot)
- Q2: Confirmed vs Cancelled bookings month by month for each hotel
- Q3: Average ADR per month for City Hotel (Line plot)
- Q4: Correlation between monthly cancellations and ADR in City Hotel (Heatmap)
- Q5: Percentage share of each market segment for both hotels
- Q6: City Hotel percentage of repeated vs new guests
- Q7: Most reserved room types in each hotel (Bar chart)
- Q8: Share of each customer type among confirmed bookings (Pie chart)
- Q9: Percentage of all reservations cancelled vs not cancelled (Pie chart)
=============================================================================
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


# Configure aesthetics
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams.update({
    'font.size': 11,
    'axes.labelsize': 12,
    'axes.titlesize': 13,
    'figure.autolayout': True
})

MONTH_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]


# =============================================================================
# PREPARATION: LOAD, CLEAN, DEDUPLICATE, HANDLE DATES & MISSING VALUES
# =============================================================================
def run_prep(file_path="hotel_bookings.csv"):
    """
    Prep: Load the data, remove duplicates, fix the date column, handle missing values
    (company, agent, country, children).
    """
    print("=" * 70)
    print("                PREPARATION: DATA CLEANING & REFINEMENT")
    print("=" * 70)
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found: {file_path}")
        
    df = pd.read_csv(file_path)
    initial_shape = df.shape
    print(f"1. Raw Dataset Shape: {initial_shape[0]:,} rows, {initial_shape[1]} columns")
    
    # Remove duplicate records
    dup_count = df.duplicated().sum()
    df_clean = df.drop_duplicates().copy()
    print(f"2. Removed Duplicate Records: {dup_count:,} rows")
    print(f"   Shape after Deduplication: {df_clean.shape[0]:,} rows, {df_clean.shape[1]} columns")
    
    # Fix the date column
    df_clean['reservation_status_date'] = pd.to_datetime(df_clean['reservation_status_date'])
    print(f"3. Fixed Date Column: 'reservation_status_date' converted to datetime dtype.")
    
    # Handle missing values in company, agent, country, children
    missing_before = df_clean[['company', 'agent', 'country', 'children']].isnull().sum()
    print("\n4. Missing Values Before Handling:")
    for col, count in missing_before.items():
        print(f"   - {col:10s}: {count:6d} nulls")
        
    df_clean['children'] = df_clean['children'].fillna(0)
    df_clean['country'] = df_clean['country'].fillna('Unknown')
    df_clean['agent'] = df_clean['agent'].fillna(0)
    df_clean['company'] = df_clean['company'].fillna(0)
    
    missing_after = df_clean[['company', 'agent', 'country', 'children']].isnull().sum()
    print("\n5. Missing Values After Imputation:")
    for col, count in missing_after.items():
        print(f"   - {col:10s}: {count:6d} nulls")
        
    # Categorical month ordering
    df_clean['arrival_date_month'] = pd.Categorical(
        df_clean['arrival_date_month'],
        categories=MONTH_ORDER,
        ordered=True
    )
    
    print("=" * 70 + "\n")
    return df_clean


# =============================================================================
# Q1: CONFIRMED BOOKINGS PER MONTH FOR CITY & RESORT HOTEL
# =============================================================================
def answer_q1(df, output_path="assets/q1_confirmed_bookings_per_month.png"):
    """
    Q1: Plot the number of confirmed (not cancelled) bookings per month
    for the City Hotel and the Resort Hotel on one graph.
    """
    print("\n--- Q1: Confirmed Bookings per Month for City & Resort Hotel ---")
    confirmed = df[df['is_canceled'] == 0]
    
    monthly_hotel = confirmed.groupby(['arrival_date_month', 'hotel'], observed=False).size().unstack()
    print(monthly_hotel)
    
    fig, ax = plt.subplots(figsize=(10, 5))
    x_indices = np.arange(len(MONTH_ORDER))
    width = 0.38
    
    bars1 = ax.bar(x_indices - width/2, monthly_hotel['City Hotel'], width=width, label='City Hotel', color='#2563eb')
    bars2 = ax.bar(x_indices + width/2, monthly_hotel['Resort Hotel'], width=width, label='Resort Hotel', color='#10b981')
    
    ax.set_title("Q1: Confirmed Bookings per Month (City Hotel vs Resort Hotel)", pad=15, fontweight='bold')
    ax.set_xlabel("Arrival Month", fontweight='bold')
    ax.set_ylabel("Number of Confirmed Bookings", fontweight='bold')
    ax.set_xticks(x_indices)
    ax.set_xticklabels(MONTH_ORDER, rotation=35, ha='right')
    ax.legend(title="Hotel Type", frameon=True)
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return monthly_hotel


# =============================================================================
# Q2: COMPARE CONFIRMED VS CANCELLED BOOKINGS MONTH BY MONTH FOR EACH HOTEL
# =============================================================================
def answer_q2(df, output_path="assets/q2_confirmed_vs_cancelled_by_hotel.png"):
    """
    Q2: For each hotel, compare confirmed bookings with cancelled bookings month by month.
    """
    print("\n--- Q2: Confirmed vs Cancelled Bookings Month by Month ---")
    grouped = df.groupby(['hotel', 'arrival_date_month', 'is_canceled'], observed=False).size().unstack(fill_value=0)
    grouped.columns = ['Confirmed', 'Cancelled']
    print(grouped)
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5.5), sharey=True)
    
    for ax, hotel_name, color_c, color_x in zip(
        [ax1, ax2],
        ['City Hotel', 'Resort Hotel'],
        ['#10b981', '#10b981'],
        ['#ef4444', '#ef4444']
    ):
        sub_df = grouped.loc[hotel_name]
        x_idx = np.arange(len(MONTH_ORDER))
        w = 0.38
        
        ax.bar(x_idx - w/2, sub_df['Confirmed'], width=w, label='Confirmed (0)', color='#10b981')
        ax.bar(x_idx + w/2, sub_df['Cancelled'], width=w, label='Cancelled (1)', color='#ef4444')
        
        ax.set_title(f"{hotel_name}: Confirmed vs Cancelled", pad=12, fontweight='bold')
        ax.set_xlabel("Arrival Month", fontweight='bold')
        ax.set_ylabel("Number of Bookings", fontweight='bold')
        ax.set_xticks(x_idx)
        ax.set_xticklabels(MONTH_ORDER, rotation=45, ha='right')
        ax.legend(frameon=True)
        
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return grouped


# =============================================================================
# Q3: AVERAGE ADR FOR EACH MONTH FOR CITY HOTEL
# =============================================================================
def answer_q3(df, output_path="assets/q3_city_hotel_average_adr.png"):
    """
    Q3: Find the average ADR (Average Daily Rate) for each month for the City Hotel and plot it.
    """
    print("\n--- Q3: Average ADR for Each Month for City Hotel ---")
    city_df = df[df['hotel'] == 'City Hotel']
    avg_adr = city_df.groupby('arrival_date_month', observed=False)['adr'].mean()
    print(avg_adr.round(2))
    
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(avg_adr.index, avg_adr.values, marker='o', linewidth=2.5, markersize=8, color='#3b82f6', label='Average ADR ($)')
    
    # Annotate points
    for month, val in avg_adr.items():
        ax.annotate(f"${val:.1f}", (month, val), textcoords="offset points", xytext=(0, 8), ha='center', fontsize=9, fontweight='bold')
        
    ax.set_title("Q3: City Hotel - Average Daily Rate (ADR) per Month", pad=15, fontweight='bold')
    ax.set_xlabel("Arrival Month", fontweight='bold')
    ax.set_ylabel("Average ADR ($)", fontweight='bold')
    ax.set_ylim(min(avg_adr.values) * 0.9, max(avg_adr.values) * 1.15)
    plt.xticks(rotation=35, ha='right')
    ax.legend(frameon=True)
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return avg_adr


# =============================================================================
# Q4: CORRELATION BETWEEN MONTHLY CANCELLATIONS AND AVERAGE ADR IN CITY HOTEL
# =============================================================================
def answer_q4(df, output_path="assets/q4_cancellations_vs_adr_heatmap.png"):
    """
    Q4: Is there a relationship between monthly cancellations and average ADR in the City Hotel?
    Find the correlation and show it as a heatmap.
    """
    print("\n--- Q4: Relationship between Monthly Cancellations and ADR in City Hotel ---")
    city_df = df[df['hotel'] == 'City Hotel']
    
    monthly_stats = city_df.groupby('arrival_date_month', observed=False).agg(
        Total_Bookings=('is_canceled', 'count'),
        Cancellations=('is_canceled', lambda x: (x == 1).sum()),
        Cancellation_Rate=('is_canceled', 'mean'),
        Average_ADR=('adr', 'mean')
    )
    print(monthly_stats.round(3))
    
    corr_matrix = monthly_stats[['Cancellations', 'Cancellation_Rate', 'Average_ADR', 'Total_Bookings']].corr()
    print("\nCorrelation Matrix:")
    print(corr_matrix.round(3))
    
    fig, ax = plt.subplots(figsize=(6.5, 5))
    sns.heatmap(
        corr_matrix,
        annot=True,
        cmap='coolwarm',
        fmt='.3f',
        vmin=-1,
        vmax=1,
        cbar=True,
        annot_kws={'size': 11, 'weight': 'bold'},
        ax=ax
    )
    ax.set_title("Q4: Correlation: City Hotel Cancellations vs ADR", pad=15, fontweight='bold')
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return corr_matrix, monthly_stats


# =============================================================================
# Q5: PERCENTAGE SHARE OF EACH MARKET SEGMENT FOR BOTH HOTELS
# =============================================================================
def answer_q5(df, output_path="assets/q5_market_segment_share.png"):
    """
    Q5: Find the percentage share of each market segment for both hotels.
    """
    print("\n--- Q5: Percentage Share of Each Market Segment for Both Hotels ---")
    market_share = pd.crosstab(df['market_segment'], df['hotel'], normalize='columns') * 100
    market_share['Overall'] = df['market_segment'].value_counts(normalize=True) * 100
    market_share = market_share.sort_values('Overall', ascending=False)
    print(market_share.round(2))
    
    fig, ax = plt.subplots(figsize=(10, 5))
    market_share[['City Hotel', 'Resort Hotel']].plot(kind='bar', ax=ax, colormap='tab10', width=0.7)
    ax.set_title("Q5: Market Segment Percentage Share per Hotel", pad=15, fontweight='bold')
    ax.set_xlabel("Market Segment", fontweight='bold')
    ax.set_ylabel("Percentage Share (%)", fontweight='bold')
    plt.xticks(rotation=35, ha='right')
    ax.legend(title="Hotel", frameon=True)
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return market_share


# =============================================================================
# Q6: CITY HOTEL REPEATED VS NEW GUESTS PERCENTAGE
# =============================================================================
def answer_q6(df, output_path="assets/q6_city_hotel_repeat_guests.png"):
    """
    Q6: What percentage of City Hotel guests are repeated guests and what percentage are new?
    """
    print("\n--- Q6: City Hotel Guests: Repeated vs New ---")
    city_df = df[df['hotel'] == 'City Hotel']
    counts = city_df['is_repeated_guest'].value_counts()
    percentages = (counts / len(city_df)) * 100
    
    labels = ['New Guests (0)', 'Repeated Guests (1)']
    vals = [percentages.get(0, 0), percentages.get(1, 0)]
    print(f"New Guests     : {vals[0]:.2f}% ({counts.get(0, 0):,} bookings)")
    print(f"Repeated Guests: {vals[1]:.2f}% ({counts.get(1, 0):,} bookings)")
    
    fig, ax = plt.subplots(figsize=(6, 5))
    colors = ['#3b82f6', '#f59e0b']
    wedges, texts, autotexts = ax.pie(
        vals,
        labels=labels,
        autopct='%1.2f%%',
        startangle=140,
        colors=colors,
        explode=(0, 0.12),
        textprops={'fontsize': 11, 'weight': 'bold'}
    )
    ax.set_title("Q6: City Hotel - New vs Repeated Guests", pad=15, fontweight='bold')
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return percentages


# =============================================================================
# Q7: ROOM TYPES RESERVED THE MOST IN EACH HOTEL (BAR CHART)
# =============================================================================
def answer_q7(df, output_path="assets/q7_room_types_reserved_bar_chart.png"):
    """
    Q7: Which room types are reserved the most in each hotel?
    Show the share of each type as a bar chart.
    """
    print("\n--- Q7: Room Types Reserved the Most in Each Hotel ---")
    room_share = pd.crosstab(df['reserved_room_type'], df['hotel'], normalize='columns') * 100
    room_share['Overall'] = df['reserved_room_type'].value_counts(normalize=True) * 100
    room_share = room_share.sort_values('Overall', ascending=False)
    print(room_share.round(2))
    
    fig, ax = plt.subplots(figsize=(10, 5))
    room_share[['City Hotel', 'Resort Hotel']].plot(kind='bar', ax=ax, color=['#2563eb', '#10b981'], width=0.7)
    ax.set_title("Q7: Reserved Room Type Share per Hotel (%)", pad=15, fontweight='bold')
    ax.set_xlabel("Reserved Room Type", fontweight='bold')
    ax.set_ylabel("Share of Bookings (%)", fontweight='bold')
    plt.xticks(rotation=0)
    ax.legend(title="Hotel", frameon=True)
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return room_share


# =============================================================================
# Q8: SHARE OF EACH CUSTOMER TYPE AMONG CONFIRMED BOOKINGS (PIE CHART)
# =============================================================================
def answer_q8(df, output_path="assets/q8_customer_type_pie_chart.png"):
    """
    Q8: What is the share of each customer type among confirmed bookings? Show it as a pie chart.
    """
    print("\n--- Q8: Share of Each Customer Type among Confirmed Bookings ---")
    confirmed = df[df['is_canceled'] == 0]
    cust_counts = confirmed['customer_type'].value_counts()
    cust_share = confirmed['customer_type'].value_counts(normalize=True) * 100
    print(cust_share.round(2))
    
    fig, ax = plt.subplots(figsize=(6.5, 5.5))
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    wedges, texts, autotexts = ax.pie(
        cust_share,
        labels=cust_share.index,
        autopct='%1.2f%%',
        pctdistance=0.75,
        startangle=140,
        colors=colors,
        explode=(0.04, 0.05, 0.1, 0.15),
        textprops={'fontsize': 10, 'weight': 'bold'}
    )
    ax.set_title("Q8: Customer Type Share among Confirmed Bookings", pad=15, fontweight='bold')
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return cust_share


# =============================================================================
# Q9: PERCENTAGE OF ALL RESERVATIONS CANCELLED VS NOT CANCELLED (PIE CHART)
# =============================================================================
def answer_q9(df, output_path="assets/q9_overall_cancellation_pie_chart.png"):
    """
    Q9: What percentage of all reservations were cancelled and what percentage were not?
    Show it as a pie chart.
    """
    print("\n--- Q9: Percentage of All Reservations Cancelled vs Not Cancelled ---")
    cancel_counts = df['is_canceled'].value_counts()
    cancel_share = df['is_canceled'].value_counts(normalize=True) * 100
    
    labels = ['Not Cancelled (Confirmed)', 'Cancelled']
    values = [cancel_share[0], cancel_share[1]]
    print(f"Not Cancelled: {values[0]:.2f}% ({cancel_counts[0]:,} bookings)")
    print(f"Cancelled    : {values[1]:.2f}% ({cancel_counts[1]:,} bookings)")
    
    fig, ax = plt.subplots(figsize=(6, 5))
    colors = ['#10b981', '#ef4444']
    wedges, texts, autotexts = ax.pie(
        values,
        labels=labels,
        autopct='%1.2f%%',
        startangle=90,
        colors=colors,
        explode=(0, 0.08),
        textprops={'fontsize': 11, 'weight': 'bold'}
    )
    ax.set_title("Q9: Overall Reservation Status: Cancelled vs Not Cancelled", pad=15, fontweight='bold')
    
    if output_path:
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {output_path}")
    return cancel_share


# =============================================================================
# MAIN ORCHESTRATOR
# =============================================================================
def run_all_analysis():
    os.makedirs("assets", exist_ok=True)
    df_clean = run_prep("hotel_bookings.csv")
    
    answer_q1(df_clean)
    answer_q2(df_clean)
    answer_q3(df_clean)
    answer_q4(df_clean)
    answer_q5(df_clean)
    answer_q6(df_clean)
    answer_q7(df_clean)
    answer_q8(df_clean)
    answer_q9(df_clean)
    
    print("\n" + "=" * 70)
    print("      ALL TASKS COMPLETED & VISUALIZATIONS GENERATED IN assets/")
    print("=" * 70)


if __name__ == "__main__":
    run_all_analysis()

