import requests
import json

# API Base URL
BASE_URL = "http://localhost:8000"

def test_api():
    """Test the Crop Yield Prediction API"""
    
    print("🧪 Testing Crop Yield Prediction API")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return
    
    # Test 2: Root endpoint
    print("\n2. Testing Root Endpoint...")
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            print("✅ Root endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
    
    # Test 3: Model info
    print("\n3. Testing Model Info...")
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        if response.status_code == 200:
            print("✅ Model info retrieved")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Model info failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Model info error: {e}")
    
    # Test 4: Single prediction
    print("\n4. Testing Single Prediction...")
    
    test_data = {
        "crop": "Rice",
        "crop_year": 2020,
        "season": "Autumn",
        "state": "Odisha",
        "area": 30000.0,
        "production": 25000.0,
        "annual_rainfall": 1200.0,
        "fertilizer": 3000000.0,
        "pesticide": 12000.0,
        "temperature": 24.5
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction successful")
            print(f"   Input: {test_data}")
            print(f"   Predicted Yield: {result['predicted_yield']} tonnes/hectare")
            print(f"   Input Yield Ratio: {result['input_yield_ratio']} tonnes/hectare")
            print(f"   Model Confidence: {result['model_confidence']}")
            print(f"   Message: {result['message']}")
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Prediction error: {e}")
    
    # Test 5: Batch prediction
    print("\n5. Testing Batch Prediction...")
    
    batch_data = [
        {
            "crop": "Rice",
            "crop_year": 2020,
            "season": "Autumn",
            "state": "Odisha",
            "area": 30000.0,
            "production": 25000.0,
            "annual_rainfall": 1200.0,
            "fertilizer": 3000000.0,
            "pesticide": 12000.0,
            "temperature": 24.5
        },
        {
            "crop": "Wheat",
            "crop_year": 2021,
            "season": "Winter",
            "state": "Maharashtra",
            "area": 35000.0,
            "production": 30000.0,
            "annual_rainfall": 900.0,
            "fertilizer": 3500000.0,
            "pesticide": 15000.0,
            "temperature": 20.0
        }
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/batch-predict",
            json=batch_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Batch prediction successful")
            print(f"   Total processed: {result['total_processed']}")
            for res in result['results']:
                if res['status'] == 'success':
                    pred = res['prediction']
                    print(f"   Index {res['index']}: {pred['predicted_yield']:.4f} tonnes/hectare (Confidence: {pred['model_confidence']})")
                else:
                    print(f"   Index {res['index']}: Error - {res['error']}")
        else:
            print(f"❌ Batch prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Batch prediction error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 API Testing Complete!")
    print("\n💡 To explore the API interactively, visit:")
    print("   📖 API Documentation: http://localhost:8000/docs")
    print("   🔄 Alternative docs: http://localhost:8000/redoc")

def test_specific_prediction():
    """Test with specific crop data"""
    print("\n🎯 Testing with specific crop scenarios...")
    
    scenarios = [
        {
            "name": "High-yield Rice scenario",
            "data": {
                "crop": "Rice",
                "crop_year": 2022,
                "season": "Autumn",
                "state": "Odisha",
                "area": 25000.0,
                "production": 30000.0,
                "annual_rainfall": 1400.0,
                "fertilizer": 4000000.0,
                "pesticide": 8000.0,
                "temperature": 25.0
            }
        },
        {
            "name": "Low-yield Wheat scenario",
            "data": {
                "crop": "Wheat",
                "crop_year": 2022,
                "season": "Winter",
                "state": "Maharashtra",
                "area": 50000.0,
                "production": 25000.0,
                "annual_rainfall": 600.0,
                "fertilizer": 2000000.0,
                "pesticide": 5000.0,
                "temperature": 18.0
            }
        }
    ]
    
    for scenario in scenarios:
        print(f"\n📊 {scenario['name']}:")
        try:
            response = requests.post(
                f"{BASE_URL}/predict",
                json=scenario['data'],
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   Predicted Yield: {result['predicted_yield']:.4f} tonnes/hectare")
                print(f"   Confidence: {result['model_confidence']}")
            else:
                print(f"   Error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"   Error: {e}")

if __name__ == "__main__":
    print("Make sure the FastAPI server is running on http://localhost:8000")
    print("You can start it with: python -m uvicorn app:app --reload")
    print("\nWaiting for server to be ready...")
    
    import time
    time.sleep(2)
    
    # Run basic tests
    test_api()
    
    # Run specific scenario tests
    test_specific_prediction()