import requests
import json

def test_batch_predictions():
    base_url = "http://127.0.0.1:8000"
    
    print("🎯 BATCH CROP YIELD PREDICTIONS")
    print("=" * 50)
    
    # Batch of different crop scenarios
    batch_data = [
        {
            "crop": "rice",
            "crop_year": 2020,
            "season": "kharif",
            "state": "odisha",
            "area": 30000.0,
            "production": 24000.0,
            "annual_rainfall": 1200.0,
            "fertilizer": 3500000.0,
            "pesticide": 11000.0,
            "temperature": 25.0
        },
        {
            "crop": "wheat",
            "crop_year": 2021,
            "season": "rabi", 
            "state": "odisha",
            "area": 40000.0,
            "production": 32000.0,
            "annual_rainfall": 700.0,
            "fertilizer": 4000000.0,
            "pesticide": 13000.0,
            "temperature": 19.0
        },
        {
            "crop": "groundnut",
            "crop_year": 2022,
            "season": "summer",
            "state": "odisha",
            "area": 18000.0,
            "production": 15000.0,
            "annual_rainfall": 900.0,
            "fertilizer": 2800000.0,
            "pesticide": 8000.0,
            "temperature": 27.0
        },
        {
            "crop": "maize",
            "crop_year": 2023,
            "season": "kharif",
            "state": "odisha", 
            "area": 22000.0,
            "production": 26000.0,
            "annual_rainfall": 1100.0,
            "fertilizer": 3200000.0,
            "pesticide": 9500.0,
            "temperature": 23.5
        }
    ]
    
    try:
        response = requests.post(
            f"{base_url}/batch-predict",
            json=batch_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ Batch processing completed!")
            print(f"📊 Total processed: {result['total_processed']} predictions\n")
            
            for i, res in enumerate(result['results'], 1):
                if res['status'] == 'success':
                    pred = res['prediction']
                    input_data = batch_data[res['index']]
                    
                    print(f"{i}. {input_data['crop'].upper()} - {input_data['season'].title()} {input_data['crop_year']}")
                    print(f"   Area: {input_data['area']:,.0f} hectares")
                    print(f"   Production: {input_data['production']:,.0f} tonnes") 
                    print(f"   🎯 Predicted Yield: {pred['predicted_yield']:.6f} tonnes/hectare")
                    print(f"   📈 Input Yield Ratio: {pred['input_yield_ratio']:.6f} tonnes/hectare")
                    print(f"   🎪 Confidence: {pred['model_confidence']}")
                    print()
                else:
                    print(f"{i}. Error in prediction {res['index']}: {res['error']}")
                    print()
        else:
            print(f"❌ Batch prediction failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception during batch prediction: {e}")

def test_individual_high_value_crops():
    """Test some high-value crops individually"""
    base_url = "http://127.0.0.1:8000"
    
    print("\n🌟 HIGH-VALUE CROP PREDICTIONS")
    print("=" * 50)
    
    high_value_crops = [
        {
            "name": "Soyabean - Commercial Scale",
            "crop": "soyabean",
            "crop_year": 2023,
            "season": "kharif",
            "state": "odisha",
            "area": 45000.0,
            "production": 40000.0,
            "annual_rainfall": 1000.0,
            "fertilizer": 4500000.0,
            "pesticide": 14000.0,
            "temperature": 24.0
        },
        {
            "name": "Onion - High Density",
            "crop": "onion", 
            "crop_year": 2022,
            "season": "rabi",
            "state": "odisha",
            "area": 8000.0,
            "production": 160000.0,
            "annual_rainfall": 800.0,
            "fertilizer": 2000000.0,
            "pesticide": 6000.0,
            "temperature": 22.0
        },
        {
            "name": "Turmeric - Premium Quality",
            "crop": "turmeric",
            "crop_year": 2023,
            "season": "whole year",
            "state": "odisha",
            "area": 5000.0,
            "production": 15000.0,
            "annual_rainfall": 1300.0,
            "fertilizer": 1500000.0,
            "pesticide": 4000.0,
            "temperature": 26.0
        }
    ]
    
    for i, scenario in enumerate(high_value_crops, 1):
        test_data = {k: v for k, v in scenario.items() if k != 'name'}
        
        try:
            response = requests.post(
                f"{base_url}/predict",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"{i}. {scenario['name']}")
                print(f"   🌾 Crop: {scenario['crop'].title()}")
                print(f"   📅 Year/Season: {scenario['crop_year']} - {scenario['season'].title()}")
                print(f"   🎯 Predicted Yield: {result['predicted_yield']:.6f} tonnes/hectare")
                print(f"   📊 Input Ratio: {result['input_yield_ratio']:.6f} tonnes/hectare")
                print(f"   🎪 Confidence: {result['model_confidence']}")
                print()
            else:
                print(f"{i}. {scenario['name']} - Error: {response.status_code}")
                print(f"   Details: {response.text}")
                print()
                
        except Exception as e:
            print(f"{i}. {scenario['name']} - Exception: {e}")
            print()

if __name__ == "__main__":
    # Test batch predictions
    test_batch_predictions()
    
    # Test high-value individual crops
    test_individual_high_value_crops()
    
    print("🏁 All tests completed!")
    print("💡 Visit http://127.0.0.1:8000/docs for interactive API testing")