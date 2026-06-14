"""
Model Training Script for Crop Yield Prediction
This script trains a Random Forest model for predicting crop yield
"""

import os
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import pickle
import warnings

warnings.filterwarnings('ignore')

class CropYieldModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.best_params = None
        self.feature_names = None
        self.mappings = None
        
    def load_data(self, data_path: str) -> pd.DataFrame:
        """Load and preprocess data"""
        print(f"Loading data from {data_path}...")
        df = pd.read_csv(data_path)
        print(f"Data shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> tuple:
        """Preprocess data and create feature mappings"""
        print("\nPreprocessing data...")
        
        # Create mappings for categorical variables
        crops = df['Crop'].unique()
        seasons = df['Season'].unique()
        states = df['State'].unique()
        
        crop_mapping = {crop: idx for idx, crop in enumerate(sorted(crops))}
        season_mapping = {season: idx for idx, season in enumerate(sorted(seasons))}
        state_mapping = {state: idx for idx, state in enumerate(sorted(states))}
        
        # Apply mappings
        df['Crop'] = df['Crop'].map(crop_mapping)
        df['Season'] = df['Season'].map(season_mapping)
        df['State'] = df['State'].map(state_mapping)
        
        # Handle missing values
        df = df.fillna(df.mean(numeric_only=True))
        
        # Define features and target
        feature_cols = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 
                       'Production', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Temperature']
        X = df[feature_cols].copy()
        y = df['Yield'].copy()
        
        print(f"Features: {feature_cols}")
        print(f"Target: Yield")
        print(f"X shape: {X.shape}, y shape: {y.shape}")
        
        # Store feature names and reverse mappings for API
        self.feature_names = feature_cols
        self.mappings = {
            'feature_names': feature_cols,
            'crop_mapping': {v: k for k, v in crop_mapping.items()},
            'season_mapping': {v: k for k, v in season_mapping.items()},
            'state_mapping': {v: k for k, v in state_mapping.items()}
        }
        
        return X, y
    
    def train(self, X_train: pd.DataFrame, y_train: pd.Series):
        """Train Random Forest model with GridSearchCV"""
        print("\nTraining model with GridSearchCV...")
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Grid Search for hyperparameters
        param_grid = {
            'n_estimators': [100, 200],
            'max_depth': [15, 20, 25],
            'min_samples_split': [5, 10],
            'min_samples_leaf': [2, 4]
        }
        
        rf = RandomForestRegressor(random_state=42, n_jobs=-1)
        grid_search = GridSearchCV(rf, param_grid, cv=5, scoring='r2', n_jobs=-1, verbose=1)
        grid_search.fit(X_train_scaled, y_train)
        
        # Store the fitted best estimator (not the base estimator)
        self.model = grid_search.best_estimator_
        self.best_params = grid_search.best_params_
        
        print(f"Best parameters: {self.best_params}")
        print(f"Best CV R² score: {grid_search.best_score_:.4f}")
        
        return X_train_scaled
    
    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series):
        """Evaluate model on test set"""
        print("\nEvaluating model...")
        
        X_test_scaled = self.scaler.transform(X_test)
        y_pred = self.model.predict(X_test_scaled)
        
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"Test MSE: {mse:.4f}")
        print(f"Test RMSE: {rmse:.4f}")
        print(f"Test MAE: {mae:.4f}")
        print(f"Test R² score: {r2:.4f}")
        
        return {'mse': mse, 'rmse': rmse, 'mae': mae, 'r2': r2}
    
    def save_artifacts(self, output_dir: str):
        """Save model, scaler, and mappings"""
        print(f"\nSaving artifacts to {output_dir}...")
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Save model
        model_path = os.path.join(output_dir, 'crop_yield_model.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        print(f"Model saved to {model_path}")
        
        # Save scaler
        scaler_path = os.path.join(output_dir, 'scaler.pkl')
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        print(f"Scaler saved to {scaler_path}")
        
        # Save mappings
        mappings_path = os.path.join(output_dir, 'api_mappings.json')
        with open(mappings_path, 'w') as f:
            json.dump(self.mappings, f, indent=2)
        print(f"Mappings saved to {mappings_path}")

def main():
    """Main training pipeline"""
    print("="*60)
    print("Crop Yield Prediction Model Training")
    print("="*60)
    
    # Paths
    data_path = "data/crop_yield_data.csv"  # Update with your data path
    output_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Check if data exists
    if not os.path.exists(data_path):
        print(f"\nError: Data file not found at {data_path}")
        print("Please ensure crop_yield_data.csv exists in the data/ directory")
        return
    
    # Initialize model
    model = CropYieldModel()
    
    # Load and preprocess data
    df = model.load_data(data_path)
    X, y = model.preprocess_data(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"\nTrain set: {X_train.shape}, Test set: {X_test.shape}")
    
    # Train model
    X_train_scaled = model.train(X_train, y_train)
    
    # Evaluate model
    metrics = model.evaluate(X_test, y_test)
    
    # Save artifacts
    model.save_artifacts(output_dir)
    
    print("\n" + "="*60)
    print("Training complete!")
    print("="*60)

if __name__ == "__main__":
    main()
