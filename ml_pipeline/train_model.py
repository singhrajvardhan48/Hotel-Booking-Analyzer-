"""
=============================================================================
HOTEL BOOKING SYSTEM USING MACHINE LEARNING
Module: Model Training and Evaluation (train_model.py)

Description:
This module handles:
1. Loading the cleaned dataset and splitting into train/test sets (80/20 stratified).
2. Fitting the ColumnTransformer preprocessor on training data.
3. Training a Random Forest Classifier.
4. Evaluating on the unseen test set (Accuracy, Precision, Recall, F1, Confusion Matrix).
5. Extracting and plotting Feature Importances.
6. Saving:
   - model.pkl (trained Random Forest model)
   - preprocessor.pkl (fitted ColumnTransformer pipeline)
   - models_metadata.json (evaluation metrics)
=============================================================================
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

from data_cleaning import (
    load_data,
    clean_dataset,
    build_preprocessor,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET_COLUMN
)


sns.set_theme(style="whitegrid")
plt.rcParams.update({'font.size': 11, 'figure.autolayout': True})


def extract_feature_names(fitted_preprocessor):
    """
    Extracts all feature names after ColumnTransformer preprocessing.
    """
    cat_encoder = fitted_preprocessor.named_transformers_['cat'].named_steps['encoder']
    cat_feature_names = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    all_feature_names = NUMERICAL_FEATURES + cat_feature_names
    return all_feature_names


def plot_and_save_confusion_matrix(cm, save_path="assets/confusion_matrix.png"):
    """
    Plots and saves a confusion matrix heatmap.
    """
    fig, ax = plt.subplots(figsize=(5.5, 4.5))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        cbar=False,
        annot_kws={'size': 13, 'weight': 'bold'},
        xticklabels=['Not Canceled (0)', 'Canceled (1)'],
        yticklabels=['Not Canceled (0)', 'Canceled (1)'],
        ax=ax
    )
    ax.set_title("Random Forest Confusion Matrix", pad=12, fontweight='bold')
    ax.set_xlabel("Predicted Label", fontweight='bold')
    ax.set_ylabel("True / Actual Label", fontweight='bold')
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    return fig


def plot_and_save_feature_importance(feature_names, importances, top_n=12, save_path="assets/feature_importance.png"):
    """
    Plots and saves the top N most important features.
    """
    fi_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importances
    }).sort_values('Importance', ascending=False).reset_index(drop=True)
    
    top_fi = fi_df.head(top_n)
    
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.barh(top_fi['Feature'][::-1], top_fi['Importance'][::-1], color='#2563eb')
    ax.set_title(f"Top {top_n} Feature Importances (Random Forest)", pad=12, fontweight='bold')
    ax.set_xlabel("Relative Importance Score", fontweight='bold')
    ax.set_ylabel("Feature", fontweight='bold')
    
    for bar in bars:
        width = bar.get_width()
        ax.annotate(f'{width:.3f}',
                    xy=(width, bar.get_y() + bar.get_height() / 2),
                    xytext=(5, 0),
                    textcoords="offset points",
                    ha='left', va='center', fontsize=9, fontweight='bold')
                    
    ax.set_xlim(0, max(top_fi['Importance']) * 1.2)
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close(fig)
    return fi_df


def train_and_save_model(
    cleaned_dataset_path="cleaned_hotel_bookings.csv",
    model_save_path="model.pkl",
    preprocessor_save_path="preprocessor.pkl",
    metadata_save_path="models_metadata.json"
):
    """
    Main training workflow:
    1. Loads cleaned dataset
    2. Separates X and y
    3. Splits data into train and test sets (80/20, stratified)
    4. Fits ColumnTransformer preprocessor on X_train and saves to preprocessor.pkl
    5. Trains RandomForestClassifier on preprocessed training data
    6. Evaluates model performance on X_test
    7. Saves trained model to model.pkl and evaluation metadata
    """
    print("=" * 65)
    print("        HOTEL BOOKING SYSTEM - MODEL TRAINING & EVALUATION")
    print("=" * 65)
    
    if not os.path.exists(cleaned_dataset_path):
        print("Cleaned dataset not found. Running cleaning routine first...")
        raw_df = load_data("hotel_bookings.csv")
        df = clean_dataset(raw_df, cleaned_dataset_path)
    else:
        df = pd.read_csv(cleaned_dataset_path)
        
    os.makedirs("assets", exist_ok=True)
    
    # 1. Feature selection
    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET_COLUMN]
    print(f"Total samples: {len(df):,}")
    print(f"Features: {X.shape[1]} ({len(NUMERICAL_FEATURES)} numerical, {len(CATEGORICAL_FEATURES)} categorical)")
    
    # 2. Train-test split (stratified)
    print("\nSplitting dataset into 80% Train and 20% Test (Stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    print(f"Training set: {X_train.shape[0]:,} samples")
    print(f"Testing set : {X_test.shape[0]:,} samples")
    
    # 3. Fit Preprocessor
    print("\nFitting ColumnTransformer on X_train...")
    preprocessor = build_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)
    print(f"Transformed feature matrix shape: {X_train_trans.shape}")
    
    # Save preprocessor
    joblib.dump(preprocessor, preprocessor_save_path)
    print(f" [OK] Saved preprocessor pipeline to: {preprocessor_save_path}")
    
    # 4. Train Random Forest Classifier
    print("\nTraining Random Forest Classifier (100 trees, max_depth=16)...")
    rf_classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=16,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_classifier.fit(X_train_trans, y_train)
    print(" [OK] Model training completed successfully!")
    
    # Save trained model
    joblib.dump(rf_classifier, model_save_path)
    print(f" [OK] Saved trained model to: {model_save_path}")
    
    # 5. Evaluate on test set
    print("\nEvaluating on unseen test set...")
    y_pred = rf_classifier.predict(X_test_trans)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    clf_report = classification_report(y_test, y_pred, target_names=['Not Canceled', 'Canceled'])
    
    print("\n" + "=" * 65)
    print("                     MODEL PERFORMANCE METRICS")
    print("=" * 65)
    print(f" Model Name          : Random Forest Classifier")
    print(f" Accuracy            : {accuracy * 100:.2f}%")
    print(f" Precision           : {precision * 100:.2f}%")
    print(f" Recall              : {recall * 100:.2f}%")
    print(f" F1 Score            : {f1 * 100:.2f}%")
    print("\n Confusion Matrix:")
    print(f"   TN (Correctly Not Canceled): {cm[0, 0]:6d}  |  FP (False Alarm): {cm[0, 1]:6d}")
    print(f"   FN (Missed Cancellation)   : {cm[1, 0]:6d}  |  TP (Caught Canceled): {cm[1, 1]:6d}")
    print("\n Full Classification Report:")
    print(clf_report)
    print("=" * 65)
    
    # 6. Extract Feature Importances & Plots
    feature_names = extract_feature_names(preprocessor)
    importances = rf_classifier.feature_importances_
    
    plot_and_save_confusion_matrix(cm, "assets/confusion_matrix.png")
    print(" [OK] Saved: assets/confusion_matrix.png")
    
    fi_df = plot_and_save_feature_importance(feature_names, importances, top_n=12, save_path="assets/feature_importance.png")
    print(" [OK] Saved: assets/feature_importance.png")
    
    print("\n Top 5 Important Features:")
    for idx, row in fi_df.head(5).iterrows():
        print(f"   {idx + 1}. {row['Feature']:30s}: {row['Importance']:.4f}")
        
    # Save metadata
    metadata = {
        "model_name": "Random Forest Classifier",
        "n_estimators": 100,
        "max_depth": 16,
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": cm.tolist(),
        "top_features": fi_df.head(15).to_dict(orient="records")
    }
    with open(metadata_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)
    print(f" [OK] Saved evaluation metadata to: {metadata_save_path}")
    print("\nTraining and evaluation finished successfully!")
    print("=" * 65)


if __name__ == "__main__":
    train_and_save_model()

