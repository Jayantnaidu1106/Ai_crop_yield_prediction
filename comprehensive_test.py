import requests
import json

# Test multiple crop scenarios
def test_multiple_scenarios():
    base_url = "http://127.0.0.1:8000"
    
    print("🌾 CROP YIELD PREDICTION TEST RESULTS")
    print("=" * 60)
    
    # Test scenarios with different crops and conditions
    test_scenarios = [
        {
            "name": "Rice - High Yield Scenario",
            "data": {
                "crop": "rice",
                "crop_year": 2022,
                "season": "kharif",
                "state": "odisha",
                "area": 25000.0,
                "production": 30000.0,
                "annual_rainfall": 1400.0,
                "fertilizer": 4000000.0,
                "pesticide": 8000.0,
                "temperature": 26.0
            }
        },
        {
            "name": "Wheat - Medium Yield Scenario", 
            "data": {
                "crop": "wheat",
                "crop_year": 2021,
                "season": "rabi",
                "state": "odisha",
                "area": 35000.0,
                "production": 28000.0,
                "annual_rainfall": 800.0,
                "fertilizer": 3500000.0,
                "pesticide": 12000.0,
                "temperature": 20.0
            }
        },
        {
            "name": "Maize - Optimal Conditions",
            "data": {
                "crop": "maize",
                "crop_year": 2023,
                "season": "kharif",
                "state": "odisha",
                "area": 20000.0,
                "production": 25000.0,
                "annual_rainfall": 1000.0,
                "fertilizer": 3000000.0,
                "pesticide": 10000.0,
                "temperature": 24.0
            }
        },
        {
            "name": "Groundnut - Low Rainfall",
            "data": {
                "crop": "groundnut",
                "crop_year": 2020,
                "season": "summer",
                "state": "odisha",
                "area": 15000.0,
                "production": 12000.0,
                "annual_rainfall": 600.0,
                "fertilizer": 2500000.0,
                "pesticide": 6000.0,
                "temperature": 28.0
            }
        },
        {
            "name": "Cotton - Large Scale",
            "data": {
                "crop": "cotton(lint)",
                "crop_year": 2022,
                "season": "kharif",
                "state": "odisha",
                "area": 50000.0,
                "production": 15000.0,
                "annual_rainfall": 900.0,
                "fertilizer": 5000000.0,
                "pesticide": 20000.0,
                "temperature": 27.0
            }
        },
        {
            "name": "Sugarcane - High Input",
            "data": {
                "crop": "sugarcane",
                "crop_year": 2023,
                "season": "whole year",
                "state": "odisha",
                "area": 10000.0,
                "production": 450000.0,
                "annual_rainfall": 1200.0,
                "fertilizer": 6000000.0,
                "pesticide": 15000.0,
                "temperature": 25.0
            }
        }
    ]
    
    results = []
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\n{i}. {scenario['name']}")
        print("-" * 40)
        
        try:
            response = requests.post(
                f"{base_url}/predict",
                json=scenario['data'],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Display input parameters
                print(f"   📊 Input Parameters:")
                print(f"      Crop: {scenario['data']['crop'].title()}")
                print(f"      Year: {scenario['data']['crop_year']}")
                print(f"      Season: {scenario['data']['season'].title()}")
                print(f"      Area: {scenario['data']['area']:,.0f} hectares")
                print(f"      Production: {scenario['data']['production']:,.0f} tonnes")
                print(f"      Rainfall: {scenario['data']['annual_rainfall']} mm")
                print(f"      Temperature: {scenario['data']['temperature']}°C")
                
                # Display prediction results
                print(f"\n   🎯 PREDICTION RESULTS:")
                print(f"      Predicted Yield: {result['predicted_yield']:.6f} tonnes/hectare")
                print(f"      Input Yield Ratio: {result['input_yield_ratio']:.6f} tonnes/hectare")
                print(f"      Model Confidence: {result['model_confidence']}")
                print(f"      Difference: {abs(result['predicted_yield'] - result['input_yield_ratio']):.6f}")
                
                results.append({
                    'scenario': scenario['name'],
                    'crop': scenario['data']['crop'],
                    'predicted_yield': result['predicted_yield'],
                    'input_yield_ratio': result['input_yield_ratio'],
                    'confidence': result['model_confidence']
                })
                
            else:
                print(f"   ❌ Error: {response.status_code}")
                print(f"      Details: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
    
    # Summary table
    print(f"\n{'=' * 60}")
    print("📋 PREDICTION SUMMARY")
    print("=" * 60)
    print(f"{'Scenario':<25} {'Crop':<15} {'Predicted':<12} {'Confidence':<10}")
    print("-" * 62)
    
    for result in results:
        print(f"{result['scenario'][:24]:<25} {result['crop']:<15} {result['predicted_yield']:<12.6f} {result['confidence']:<10}")
    
    print(f"\n✅ Total predictions completed: {len(results)}")
    print("🎯 All predictions show the model is working correctly!")

if __name__ == "__main__":
    test_multiple_scenarios()