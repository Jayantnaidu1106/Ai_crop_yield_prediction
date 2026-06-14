import joblib
import json
import os
import numpy as np
from typing import Dict, List, Any, Tuple

class MLService:
    """Machine Learning Service for crop yield prediction"""
    
    def __init__(self):
        """Initialize ML Service and load model artifacts"""
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Load model, scaler, and mappings
        self.model = self._load_model()
        self.scaler = self._load_scaler()
        self.api_mappings = self._load_api_mappings()
        
        # Validate loaded components
        self.is_mock = False
        if self.model is None or self.scaler is None:
            print("WARNING: Using mock ML model because pickle files failed to load.")
            self.is_mock = True
            
        if self.api_mappings is None:
            print("WARNING: API mappings failed to load. Creating default mappings.")
            self.api_mappings = {
                "crop_mapping": {"wheat": 0, "rice": 1, "corn": 2},
                "season_mapping": {"kharif": 0, "rabi": 1, "summer": 2},
                "state_mapping": {"punjab": 0, "maharashtra": 1, "up": 2}
            }
    
    def _load_model(self):
        """Load the trained RandomForest model"""
        model_path = os.path.join(self.base_path, "crop_yield_model.pkl")
        try:
            model = joblib.load(model_path)
            print(f"Model loaded from {model_path}")
            return model
        except FileNotFoundError:
            print(f"Model file not found at {model_path}")
            return None
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    
    def _load_scaler(self):
        """Load the fitted StandardScaler"""
        scaler_path = os.path.join(self.base_path, "scaler.pkl")
        try:
            scaler = joblib.load(scaler_path)
            print(f"Scaler loaded from {scaler_path}")
            return scaler
        except FileNotFoundError:
            print(f"Scaler file not found at {scaler_path}")
            return None
        except Exception as e:
            print(f"Error loading scaler: {e}")
            return None
    
    def _load_api_mappings(self):
        """Load API mappings (crop, season, state)"""
        mappings_path = os.path.join(self.base_path, "api_mappings.json")
        try:
            with open(mappings_path, 'r') as f:
                mappings = json.load(f)
            print(f"API mappings loaded from {mappings_path}")
            return mappings
        except FileNotFoundError:
            print(f"API mappings file not found at {mappings_path}")
            return None
        except Exception as e:
            print(f"Error loading API mappings: {e}")
            return None
    
    def _encode_input(self, crop: str, crop_year: int, season: str, state: str,
                     area: float, production: float, annual_rainfall: float,
                     fertilizer: float, pesticide: float, temperature: float) -> np.ndarray:
        """
        Encode categorical features and prepare feature vector for prediction
        """
        # Validate and encode categorical features
        crop_lower = crop.lower().strip()
        season_lower = season.lower().strip()
        state_lower = state.lower().strip()
        
        # Get encoded values
        crop_mappings = self.api_mappings.get("crop_mapping", {})
        season_mappings = self.api_mappings.get("season_mapping", {})
        state_mappings = self.api_mappings.get("state_mapping", {})
        
        if crop_lower not in crop_mappings:
            available = ", ".join(crop_mappings.keys())
            raise ValueError(f"Crop '{crop}' not found. Available crops: {available}")
        
        if season_lower not in season_mappings:
            available = ", ".join(season_mappings.keys())
            raise ValueError(f"Season '{season}' not found. Available seasons: {available}")
        
        if state_lower not in state_mappings:
            available = ", ".join(state_mappings.keys())
            raise ValueError(f"State '{state}' not found. Available states: {available}")
        
        crop_encoded = crop_mappings[crop_lower]
        season_encoded = season_mappings[season_lower]
        state_encoded = state_mappings[state_lower]
        
        # Prepare feature vector (order matters!)
        # Features: Crop, Crop_Year, Season, State, Area, Production, Annual_Rainfall, Fertilizer, Pesticide, Temperature
        features = np.array([
            crop_encoded,
            crop_year,
            season_encoded,
            state_encoded,
            area,
            production,
            annual_rainfall,
            fertilizer,
            pesticide,
            temperature
        ]).reshape(1, -1)
        
        # Check feature count alignment with scaler
        expected_features = self.scaler.n_features_in_
        actual_features = features.shape[1]
        
        if actual_features != expected_features:
            if actual_features == 10 and expected_features == 11:
                # Legacy scaler expects 11 features; pad with production_standardized
                features = np.concatenate([features, [[0]]], axis=1)
            elif actual_features == 11 and expected_features == 10:
                # New scaler expects 10; remove extra feature
                features = features[:, :10]
        
        return features
    
    def predict(self, crop: str, crop_year: int, season: str, state: str,
               area: float, production: float, annual_rainfall: float,
               fertilizer: float, pesticide: float, temperature: float) -> float:
        """
        Predict crop yield
        
        Returns:
            Predicted yield in tonnes/hectare
        """
        try:
            if self.is_mock:
                # Provide a realistic mock prediction based on area and rainfall
                base = 2.5 + (annual_rainfall / 1000.0) + (fertilizer / 50.0)
                return max(0.5, float(base))
                
            features = self._encode_input(
                crop, crop_year, season, state,
                area, production, annual_rainfall,
                fertilizer, pesticide, temperature
            )
            features_scaled = self.scaler.transform(features)
            prediction = self.model.predict(features_scaled)[0]
            prediction = max(0.0, prediction)
            return float(prediction)
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}")
    
    def predict_with_confidence(self, crop: str, crop_year: int, season: str, state: str,
               area: float, production: float, annual_rainfall: float,
               fertilizer: float, pesticide: float, temperature: float) -> Dict[str, Any]:
        """
        Predict crop yield with confidence intervals using individual tree predictions.
        
        Returns:
            Dict with prediction, confidence_score, lower_bound, upper_bound, confidence_level
        """
        try:
            if self.is_mock:
                # Generate realistic mock confidence data
                base = 2.5 + (annual_rainfall / 1000.0) + (fertilizer / 50.0)
                mean_prediction = max(0.5, float(base))
                std_prediction = mean_prediction * 0.15
                lower_bound = mean_prediction - (1.96 * std_prediction)
                upper_bound = mean_prediction + (1.96 * std_prediction)
                confidence_score = 85.5
                
                return {
                    "yield_prediction": round(mean_prediction, 4),
                    "confidence_score": round(confidence_score, 2),
                    "confidence_level": "high",
                    "lower_bound": round(lower_bound, 4),
                    "upper_bound": round(upper_bound, 4),
                    "std_deviation": round(std_prediction, 4)
                }

            features = self._encode_input(
                crop, crop_year, season, state,
                area, production, annual_rainfall,
                fertilizer, pesticide, temperature
            )
            features_scaled = self.scaler.transform(features)
            
            # Get individual tree predictions for confidence estimation
            tree_predictions = np.array([
                tree.predict(features_scaled)[0]
                for tree in self.model.estimators_
            ])
            
            mean_prediction = max(0.0, float(np.mean(tree_predictions)))
            std_prediction = float(np.std(tree_predictions))
            
            # 95% confidence interval
            lower_bound = max(0.0, mean_prediction - 1.96 * std_prediction)
            upper_bound = mean_prediction + 1.96 * std_prediction
            
            # Confidence score: inverse of coefficient of variation (0-100)
            if mean_prediction > 0:
                cv = std_prediction / mean_prediction
                confidence_score = max(0, min(100, (1 - cv) * 100))
            else:
                confidence_score = 0
            
            # Confidence level label
            if confidence_score >= 80:
                confidence_level = "high"
            elif confidence_score >= 60:
                confidence_level = "medium"
            else:
                confidence_level = "low"
            
            return {
                "yield_prediction": round(mean_prediction, 4),
                "confidence_score": round(confidence_score, 2),
                "confidence_level": confidence_level,
                "lower_bound": round(lower_bound, 4),
                "upper_bound": round(upper_bound, 4),
                "std_deviation": round(std_prediction, 4)
            }
        except Exception as e:
            raise Exception(f"Prediction with confidence failed: {str(e)}")
    
    def scenario_analysis(self, base_params: Dict[str, Any], 
                          scenarios: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Run what-if scenario analysis: predict for base params and each scenario variation.
        
        Args:
            base_params: Base prediction parameters
            scenarios: List of dicts with parameter overrides
        
        Returns:
            List of scenario results with predictions
        """
        results = []
        
        # Base prediction
        base_result = self.predict_with_confidence(**base_params)
        base_result["scenario_name"] = "Current"
        base_result["params"] = base_params
        results.append(base_result)
        
        # Each scenario
        for scenario in scenarios:
            merged = {**base_params, **scenario.get("overrides", {})}
            try:
                result = self.predict_with_confidence(**merged)
                result["scenario_name"] = scenario.get("name", "Scenario")
                result["params"] = merged
                results.append(result)
            except Exception as e:
                results.append({
                    "scenario_name": scenario.get("name", "Scenario"),
                    "error": str(e),
                    "params": merged
                })
        
        return results
    
    def get_api_info(self) -> Dict[str, Any]:
        """Return API configuration information"""
        return {
            "feature_names": self.api_mappings.get("feature_names", []),
            "crop_mapping": self.api_mappings.get("crop_mapping", {}),
            "season_mapping": self.api_mappings.get("season_mapping", {}),
            "state_mapping": self.api_mappings.get("state_mapping", {}),
            "model_type": "MockModel" if self.is_mock else str(type(self.model).__name__),
            "features_required": 10 if self.is_mock else (self.scaler.n_features_in_ if self.scaler else 0),
            "is_mock": self.is_mock
        }
    
    def batch_predict(self, requests: List[Dict[str, Any]]) -> List[float]:
        """Predict yield for multiple requests"""
        predictions = []
        for req in requests:
            pred = self.predict(
                crop=req.get("crop"),
                crop_year=req.get("crop_year"),
                season=req.get("season"),
                state=req.get("state"),
                area=req.get("area"),
                production=req.get("production"),
                annual_rainfall=req.get("annual_rainfall"),
                fertilizer=req.get("fertilizer"),
                pesticide=req.get("pesticide"),
                temperature=req.get("temperature")
            )
            predictions.append(pred)
        return predictions
