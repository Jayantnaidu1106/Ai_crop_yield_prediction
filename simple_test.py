import requests
import json
import time

# Test the API
def simple_test():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Crop Yield Prediction API")
    print("=" * 50)
    
    # Wait a moment for server to be ready
    time.sleep(2)
    
    try:
        # Test health endpoint
        print("1. Testing health check...")
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        
        # Test prediction
        print("\n2. Testing prediction...")
        test_data = {
            "crop": "rice",
            "crop_year": 2020,
            "season": "autumn", 
            "state": "odisha",
            "area": 30000.0,
            "production": 25000.0,
            "annual_rainfall": 1200.0,
            "fertilizer": 3000000.0,
            "pesticide": 12000.0,
            "temperature": 24.5
        }
        
        response = requests.post(
            f"{base_url}/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Predicted Yield: {result['predicted_yield']} tonnes/hectare")
            print(f"   Model Confidence: {result['model_confidence']}")
        else:
            print(f"   Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the server is running.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    simple_test()