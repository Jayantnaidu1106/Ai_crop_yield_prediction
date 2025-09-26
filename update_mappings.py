# update_mappings.py
# This script helps you create accurate mappings for your categorical variables

import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder

def create_mappings_from_dataset():
    """
    Create accurate mappings from your dataset
    Run this after training your model to get the correct mappings
    """
    
    print("Creating mappings from dataset...")
    
    try:
        # Load the original dataset
        data = pd.read_csv("crop_yield_dataset.csv")
        print(f"Dataset loaded: {data.shape}")
        
        # Get unique values for categorical columns
        crops = sorted(data['Crop'].unique())
        seasons = sorted(data['Season'].unique())  
        states = sorted(data['State'].unique())
        
        print(f"\nFound {len(crops)} unique crops:")
        for i, crop in enumerate(crops):
            print(f"  {i}: {crop}")
            
        print(f"\nFound {len(seasons)} unique seasons:")
        for i, season in enumerate(seasons):
            print(f"  {i}: {season}")
            
        print(f"\nFound {len(states)} unique states:")
        for i, state in enumerate(states):
            print(f"  {i}: {state}")
        
        # Create mappings
        crop_mapping = {crop.lower(): i for i, crop in enumerate(crops)}
        season_mapping = {season.lower(): i for i, season in enumerate(seasons)}
        state_mapping = {state.lower(): i for i, state in enumerate(states)}
        
        # Save mappings to a file
        mappings = {
            'CROP_MAPPING': crop_mapping,
            'SEASON_MAPPING': season_mapping,
            'STATE_MAPPING': state_mapping
        }
        
        # Write to a Python file
        with open('mappings.py', 'w') as f:
            f.write("# Auto-generated mappings from dataset\n\n")
            
            f.write("CROP_MAPPING = {\n")
            for crop, idx in crop_mapping.items():
                f.write(f'    "{crop}": {idx},\n')
            f.write("}\n\n")
            
            f.write("SEASON_MAPPING = {\n")
            for season, idx in season_mapping.items():
                f.write(f'    "{season}": {idx},\n')
            f.write("}\n\n")
            
            f.write("STATE_MAPPING = {\n")
            for state, idx in state_mapping.items():
                f.write(f'    "{state}": {idx},\n')
            f.write("}\n")
        
        print(f"\n✅ Mappings saved to 'mappings.py'")
        print("📝 Update your FastAPI app.py file with these mappings!")
        
        return mappings
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def verify_model_features():
    """
    Check the feature order used in your trained model
    """
    
    try:
        # Load the original dataset to see feature order
        data = pd.read_csv("crop_yield_dataset.csv")
        
        # Simulate the same preprocessing
        if data.columns[0] == "" or "Unnamed" in data.columns[0]:
            data = data.drop(data.columns[0], axis=1)
        
        # Encode categorical columns (same order as in your notebook)
        categorical_cols = ["Crop", "Season", "State"]
        for col in categorical_cols:
            le = LabelEncoder()
            data[col] = le.fit_transform(data[col])
        
        # Get feature columns (everything except Yield)
        X = data.drop("Yield", axis=1)
        
        print("Feature order in your model:")
        for i, col in enumerate(X.columns):
            print(f"  {i}: {col}")
            
        print(f"\nTotal features: {len(X.columns)}")
        
        return list(X.columns)
        
    except Exception as e:
        print(f"❌ Error verifying features: {e}")
        return None

if __name__ == "__main__":
    print("🔧 Setting up mappings for FastAPI...")
    
    # Create mappings
    mappings = create_mappings_from_dataset()
    
    # Verify feature order
    print("\n" + "="*50)
    features = verify_model_features()
    
    if mappings and features:
        print("\n✅ Setup complete!")
        print("📋 Next steps:")
        print("1. Check the generated 'mappings.py' file")
        print("2. Update your FastAPI app.py with the correct mappings")
        print("3. Ensure feature order in app.py matches the model training")
        print("4. Test your API with test_api.py")
    else:
        print("\n❌ Setup failed. Please check your dataset and model files.")