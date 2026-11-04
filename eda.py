"""
=============================================================================
HOTEL BOOKING SYSTEM USING MACHINE LEARNING
Module: Exploratory Data Analysis (eda.py)

Description:
This module performs Exploratory Data Analysis on the cleaned hotel bookings
dataset and generates charts using Matplotlib and Seaborn:
1. City Hotel vs Resort Hotel Bookings
2. Booking Cancellation Percentage
3. Most Popular Arrival Months
4. Average Daily Rate (ADR) Distribution
5. Customer Type Distribution
6. Reserved Room Type Distribution
7. Lead Time vs Cancellation Status
=============================================================================
"""

import os
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd


# Set aesthetic style
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


def plot_hotel_type_distribution(df, save_path="assets/hotel_type_distribution.png"):
    """
    Plots the count and proportion of bookings for City Hotel vs Resort Hotel.
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    counts = df['hotel'].value_counts()
    colors = ['#3b82f6', '#10b981']
    bars = ax.bar(counts.index, counts.values, color=colors, width=0.5)
    
    ax.set_title("Total Bookings: City Hotel vs Resort Hotel", pad=12, fontweight='bold')
    ax.set_xlabel("Hotel Type")
    ax.set_ylabel("Number of Bookings")
    
    for bar in bars:
        height = bar.get_height()
        pct = (height / len(df)) * 100
        ax.annotate(f'{height:,}\n({pct:.1f}%)',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=10, fontweight='bold')
                    
    ax.set_ylim(0, max(counts.values) * 1.2)
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_cancellation_rate(df, save_path="assets/cancellation_rate.png"):
    """
    Plots the overall booking cancellation percentage.
    """
    fig, ax = plt.subplots(figsize=(6, 4))
    counts = df['is_canceled'].value_counts()
    labels = ['Not Canceled (0)', 'Canceled (1)']
    colors = ['#10b981', '#ef4444']
    
    bars = ax.bar(labels, [counts.get(0, 0), counts.get(1, 0)], color=colors, width=0.5)
    ax.set_title("Overall Booking Cancellation Percentage", pad=12, fontweight='bold')
    ax.set_xlabel("Cancellation Status")
    ax.set_ylabel("Number of Bookings")
    
    for bar in bars:
        height = bar.get_height()
        pct = (height / len(df)) * 100
        ax.annotate(f'{height:,}\n({pct:.1f}%)',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=10, fontweight='bold')
                    
    ax.set_ylim(0, max(counts.values) * 1.2)
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_monthly_trends(df, save_path="assets/monthly_booking_trends.png"):
    """
    Plots the monthly booking volume ordered chronologically.
    """
    fig, ax = plt.subplots(figsize=(9, 4.5))
    monthly_counts = df['arrival_date_month'].value_counts().reindex(MONTH_ORDER)
    
    sns.barplot(x=monthly_counts.index, y=monthly_counts.values, palette='Blues_d', ax=ax)
    ax.set_title("Most Popular Arrival Months", pad=12, fontweight='bold')
    ax.set_xlabel("Arrival Month")
    ax.set_ylabel("Total Bookings")
    plt.xticks(rotation=45, ha='right')
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_adr_distribution(df, save_path="assets/adr_distribution.png"):
    """
    Visualizes the distribution of Average Daily Rate (ADR) by hotel type.
    """
    fig, ax = plt.subplots(figsize=(8, 4.5))
    sns.boxplot(data=df[df['adr'] < 400], x='hotel', y='adr', palette=['#3b82f6', '#10b981'], ax=ax, width=0.4)
    ax.set_title("Average Daily Rate (ADR) by Hotel Type", pad=12, fontweight='bold')
    ax.set_xlabel("Hotel Type")
    ax.set_ylabel("ADR ($)")
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_customer_distribution(df, save_path="assets/customer_type_distribution.png"):
    """
    Visualizes customer type distribution and cancellations.
    """
    fig, ax = plt.subplots(figsize=(7, 4.5))
    sns.countplot(data=df, x='customer_type', hue='is_canceled', palette=['#10b981', '#ef4444'], ax=ax)
    ax.set_title("Customer Type Distribution by Cancellation", pad=12, fontweight='bold')
    ax.set_xlabel("Customer Type")
    ax.set_ylabel("Number of Bookings")
    ax.legend(title="Booking Status", labels=["Not Canceled", "Canceled"])
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_room_type_distribution(df, save_path="assets/room_type_distribution.png"):
    """
    Visualizes reserved room type distribution.
    """
    fig, ax = plt.subplots(figsize=(8, 4.5))
    room_order = df['reserved_room_type'].value_counts().index
    sns.countplot(data=df, x='reserved_room_type', order=room_order, palette='viridis', ax=ax)
    ax.set_title("Reserved Room Type Distribution", pad=12, fontweight='bold')
    ax.set_xlabel("Reserved Room Type")
    ax.set_ylabel("Number of Bookings")
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def plot_lead_time_vs_cancellation(df, save_path="assets/lead_time_vs_cancellation.png"):
    """
    Visualizes the relationship between lead time and cancellation status.
    """
    fig, ax = plt.subplots(figsize=(8, 4.5))
    sns.kdeplot(data=df[df['is_canceled'] == 0]['lead_time'], label='Not Canceled', color='#10b981', fill=True, ax=ax)
    sns.kdeplot(data=df[df['is_canceled'] == 1]['lead_time'], label='Canceled', color='#ef4444', fill=True, ax=ax)
    ax.set_title("Lead Time Distribution: Canceled vs Not Canceled", pad=12, fontweight='bold')
    ax.set_xlabel("Lead Time (Days)")
    ax.set_ylabel("Density")
    ax.set_xlim(0, 500)
    ax.legend()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    return fig


def generate_all_eda(dataset_path="cleaned_hotel_bookings.csv", output_dir="assets"):
    """
    Generates and saves all EDA visualizations into the output directory.
    """
    os.makedirs(output_dir, exist_ok=True)
    df = pd.read_csv(dataset_path)
    
    print("=" * 65)
    print("       GENERATING EXPLORATORY DATA ANALYSIS (EDA) CHARTS")
    print("=" * 65)
    
    plot_hotel_type_distribution(df, os.path.join(output_dir, "hotel_type_distribution.png"))
    print(" [OK] 1. Saved: assets/hotel_type_distribution.png")
    
    plot_cancellation_rate(df, os.path.join(output_dir, "cancellation_rate.png"))
    print(" [OK] 2. Saved: assets/cancellation_rate.png")
    
    plot_monthly_trends(df, os.path.join(output_dir, "monthly_booking_trends.png"))
    print(" [OK] 3. Saved: assets/monthly_booking_trends.png")
    
    plot_adr_distribution(df, os.path.join(output_dir, "adr_distribution.png"))
    print(" [OK] 4. Saved: assets/adr_distribution.png")
    
    plot_customer_distribution(df, os.path.join(output_dir, "customer_type_distribution.png"))
    print(" [OK] 5. Saved: assets/customer_type_distribution.png")
    
    plot_room_type_distribution(df, os.path.join(output_dir, "room_type_distribution.png"))
    print(" [OK] 6. Saved: assets/room_type_distribution.png")
    
    plot_lead_time_vs_cancellation(df, os.path.join(output_dir, "lead_time_vs_cancellation.png"))
    print(" [OK] 7. Saved: assets/lead_time_vs_cancellation.png")
    
    plt.close('all')
    print("All EDA visualizations generated successfully!")
    print("=" * 65)


if __name__ == "__main__":
    generate_all_eda()

