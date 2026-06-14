/**
 * Recommendations Engine (JavaScript)
 * Generates farming advice based on prediction inputs and results
 */

// Optimal ranges for parameters
const OPTIMAL_RANGES = {
  temperature: { min: 20, max: 35 },
  annual_rainfall: { min: 800, max: 2000 },
  fertilizer: { min: 40, max: 150 },
  pesticide: { min: 0.5, max: 5 }
};

// Crop-specific knowledge base
const CROP_KNOWLEDGE = {
  rice: {
    temp: [22, 32], rainfall: [1000, 2000], fertilizer: [80, 120],
    soil: 'clayey, loamy',
    tips: [
      'Maintain standing water of 5cm during tillering stage',
      'Apply nitrogen in 3 split doses for better absorption',
      'Use zinc sulfate if leaves show bronzing symptoms'
    ]
  },
  wheat: {
    temp: [15, 25], rainfall: [400, 800], fertilizer: [100, 140],
    soil: 'loamy, clayey-loam',
    tips: [
      'Irrigate at crown root initiation and flowering stages',
      'Seed treatment with fungicide prevents smut and bunt',
      'Harvest at 14% moisture content for best storage'
    ]
  },
  maize: {
    temp: [21, 30], rainfall: [600, 1200], fertilizer: [100, 150],
    soil: 'well-drained loamy',
    tips: [
      'Earthing up at knee-high stage improves root anchorage',
      'Tasseling stage is most critical for irrigation',
      'Intercropping with legumes improves soil nitrogen'
    ]
  },
  sugarcane: {
    temp: [25, 35], rainfall: [1500, 2500], fertilizer: [150, 250],
    soil: 'deep rich loamy',
    tips: [
      'Trash mulching conserves moisture and suppresses weeds',
      'Ring pit method increases yield by 20-30%',
      'Harvest at 10-12 months for maximum sugar recovery'
    ]
  },
  potato: {
    temp: [15, 25], rainfall: [500, 800], fertilizer: [120, 180],
    soil: 'sandy loam, well-drained',
    tips: [
      'Earthing up 3 weeks after planting prevents greening',
      'Avoid waterlogging to prevent late blight',
      'Harvest when tops start yellowing and dying back'
    ]
  },
  groundnut: {
    temp: [25, 30], rainfall: [500, 1000], fertilizer: [20, 50],
    soil: 'sandy loam',
    tips: [
      'Apply gypsum at flowering for better pod development',
      'Do not apply nitrogen — it is a legume fixing its own N',
      'Harvest when 70% pods are mature (dark inner shell)'
    ]
  }
};

const SEASON_ADVICE = {
  kharif: {
    general: 'Monitor for excessive rainfall and waterlogging',
    tips: ['Ensure proper drainage channels', 'Watch for fungal diseases due to high humidity', 'Apply foliar sprays during dry spells']
  },
  rabi: {
    general: 'Manage irrigation carefully as rainfall is limited',
    tips: ['Schedule irrigation at critical growth stages', 'Apply mulch to conserve soil moisture', 'Protect crops from frost during December-January']
  },
  summer: {
    general: 'Heat stress management is critical',
    tips: ['Irrigate during cooler hours', 'Use shade nets for sensitive crops', 'Apply potassium to improve heat tolerance']
  },
  autumn: {
    general: 'Transition period — prepare fields for rabi season',
    tips: ['Deep ploughing after kharif harvest', 'Apply well-decomposed FYM before rabi sowing', 'Test soil pH and nutrient levels']
  },
  winter: {
    general: 'Protect crops from cold and frost damage',
    tips: ['Use light irrigation before expected frost nights', 'Apply sulfur-based fungicides preventively', 'Harvest rabi crops at proper maturity']
  },
  'whole year': {
    general: 'Year-round crops need consistent management',
    tips: ['Maintain regular fertilizer schedule', 'Rotate pest management strategies seasonally', 'Monitor soil health quarterly']
  }
};

function generateRecommendations({ crop, season, state, area, production, annual_rainfall, fertilizer, pesticide, temperature, yield_prediction, prediction_id, user_phone }) {
  const recommendations = [];
  const cropLower = (crop || '').toLowerCase().trim();
  const seasonLower = (season || '').toLowerCase().trim();
  const cropInfo = CROP_KNOWLEDGE[cropLower] || null;

  // 1. Temperature
  const tempRange = cropInfo ? cropInfo.temp : [OPTIMAL_RANGES.temperature.min, OPTIMAL_RANGES.temperature.max];
  if (temperature < tempRange[0]) {
    recommendations.push({
      category: 'temperature', severity: temperature < tempRange[0] - 10 ? 'critical' : 'warning',
      title: 'Low Temperature Alert',
      message: `Temperature (${temperature}°C) is below optimal (${tempRange[0]}-${tempRange[1]}°C) for ${crop}.`,
      action: 'Consider frost protection, mulching, or row covers to protect crops from cold stress.',
      icon: 'thermometer-snowflake'
    });
  } else if (temperature > tempRange[1]) {
    recommendations.push({
      category: 'temperature', severity: temperature > tempRange[1] + 5 ? 'critical' : 'warning',
      title: 'High Temperature Alert',
      message: `Temperature (${temperature}°C) exceeds optimal (${tempRange[0]}-${tempRange[1]}°C) for ${crop}.`,
      action: 'Increase irrigation frequency, apply mulch to cool soil, and consider shade nets.',
      icon: 'thermometer-sun'
    });
  } else {
    recommendations.push({
      category: 'temperature', severity: 'info',
      title: 'Temperature Optimal',
      message: `Temperature (${temperature}°C) is within optimal range for ${crop}.`,
      action: 'Maintain current practices. Monitor for sudden weather changes.',
      icon: 'thermometer'
    });
  }

  // 2. Rainfall / Irrigation
  const rainRange = cropInfo ? cropInfo.rainfall : [OPTIMAL_RANGES.annual_rainfall.min, OPTIMAL_RANGES.annual_rainfall.max];
  if (annual_rainfall < rainRange[0]) {
    const deficit = rainRange[0] - annual_rainfall;
    recommendations.push({
      category: 'irrigation', severity: deficit > 400 ? 'critical' : 'warning',
      title: 'Rainfall Deficit — Irrigation Needed',
      message: `Rainfall (${annual_rainfall}mm) is ${Math.round(deficit)}mm below minimum (${rainRange[0]}mm) for ${crop}.`,
      action: 'Implement supplemental irrigation. Consider drip irrigation. Mulch to reduce evaporation.',
      icon: 'droplets'
    });
  } else if (annual_rainfall > rainRange[1]) {
    recommendations.push({
      category: 'irrigation', severity: (annual_rainfall - rainRange[1]) > 500 ? 'critical' : 'warning',
      title: 'Excess Rainfall Warning',
      message: `Rainfall (${annual_rainfall}mm) exceeds optimal max (${rainRange[1]}mm) for ${crop}.`,
      action: 'Ensure proper field drainage. Raise bed heights. Watch for waterlogging and root rot.',
      icon: 'cloud-rain'
    });
  } else {
    recommendations.push({
      category: 'irrigation', severity: 'info',
      title: 'Rainfall Adequate',
      message: `Rainfall (${annual_rainfall}mm) is within optimal range for ${crop}.`,
      action: 'Supplement with irrigation only during dry spells longer than 10 days.',
      icon: 'cloud-sun'
    });
  }

  // 3. Fertilizer
  const fertRange = cropInfo ? cropInfo.fertilizer : [OPTIMAL_RANGES.fertilizer.min, OPTIMAL_RANGES.fertilizer.max];
  if (fertilizer < fertRange[0]) {
    recommendations.push({
      category: 'fertilizer', severity: 'warning',
      title: 'Increase Fertilizer Application',
      message: `Fertilizer (${fertilizer} kg/ha) is below recommended (${fertRange[0]}-${fertRange[1]} kg/ha) for ${crop}.`,
      action: `Increase to at least ${fertRange[0]} kg/ha. Apply in split doses: 50% basal, 25% at tillering, 25% at flowering.`,
      icon: 'flask-conical'
    });
  } else if (fertilizer > fertRange[1]) {
    recommendations.push({
      category: 'fertilizer', severity: 'warning',
      title: 'Excess Fertilizer — Reduce Application',
      message: `Fertilizer (${fertilizer} kg/ha) exceeds maximum (${fertRange[1]} kg/ha) for ${crop}.`,
      action: 'Reduce to avoid nutrient runoff and soil salinity. Excess nitrogen causes lodging.',
      icon: 'flask-conical'
    });
  } else {
    recommendations.push({
      category: 'fertilizer', severity: 'info',
      title: 'Fertilizer Rate Optimal',
      message: `Fertilizer (${fertilizer} kg/ha) is within recommended range for ${crop}.`,
      action: 'Continue current schedule. Consider soil testing for micronutrient fine-tuning.',
      icon: 'flask-conical'
    });
  }

  // 4. Pesticide
  if (pesticide < OPTIMAL_RANGES.pesticide.min) {
    recommendations.push({
      category: 'pest_management', severity: 'warning',
      title: 'Low Pest Protection',
      message: `Pesticide usage (${pesticide} kg/ha) is below minimum recommended (${OPTIMAL_RANGES.pesticide.min} kg/ha).`,
      action: 'Monitor fields weekly. Consider IPM with biological controls and neem-based sprays.',
      icon: 'bug'
    });
  } else if (pesticide > OPTIMAL_RANGES.pesticide.max) {
    recommendations.push({
      category: 'pest_management', severity: 'critical',
      title: 'Excessive Pesticide Use',
      message: `Pesticide usage (${pesticide} kg/ha) exceeds safe limits (${OPTIMAL_RANGES.pesticide.max} kg/ha).`,
      action: 'Reduce pesticide use. Adopt IPM practices and use targeted pest-specific treatments.',
      icon: 'shield-alert'
    });
  } else {
    recommendations.push({
      category: 'pest_management', severity: 'info',
      title: 'Pest Management Adequate',
      message: `Pesticide (${pesticide} kg/ha) is within acceptable range.`,
      action: 'Continue monitoring. Rotate pesticide groups to prevent resistance.',
      icon: 'shield-check'
    });
  }

  // 5. Yield analysis
  if (area > 0 && production > 0 && yield_prediction) {
    const historicalYield = production / area;
    if (yield_prediction > historicalYield * 1.2) {
      recommendations.push({
        category: 'yield_analysis', severity: 'info',
        title: 'Above-Average Yield Expected',
        message: `Predicted yield (${yield_prediction.toFixed(2)} t/ha) is 20%+ above historical (${historicalYield.toFixed(2)} t/ha).`,
        action: 'Prepare adequate storage and transport. Consider forward selling contracts.',
        icon: 'trending-up'
      });
    } else if (yield_prediction < historicalYield * 0.8) {
      recommendations.push({
        category: 'yield_analysis', severity: 'warning',
        title: 'Below-Average Yield Expected',
        message: `Predicted yield (${yield_prediction.toFixed(2)} t/ha) is 20%+ below historical (${historicalYield.toFixed(2)} t/ha).`,
        action: 'Review input factors. Check for nutrient deficiencies, water stress, or pest pressure.',
        icon: 'trending-down'
      });
    }
  }

  // 6. Season-specific
  const seasonInfo = SEASON_ADVICE[seasonLower];
  if (seasonInfo) {
    recommendations.push({
      category: 'seasonal', severity: 'info',
      title: `${season.charAt(0).toUpperCase() + season.slice(1)} Season Advisory`,
      message: seasonInfo.general,
      action: seasonInfo.tips.join(' | '),
      icon: 'calendar'
    });
  }

  // 7. Crop-specific tips
  if (cropInfo && cropInfo.tips) {
    recommendations.push({
      category: 'crop_specific', severity: 'info',
      title: `${crop.charAt(0).toUpperCase() + crop.slice(1)} Growing Tips`,
      message: `Best practices for ${crop} cultivation (soil: ${cropInfo.soil || 'varies'}).`,
      action: cropInfo.tips.join(' | '),
      icon: 'sprout'
    });
  }

  // 8. Soil health general
  recommendations.push({
    category: 'general', severity: 'info',
    title: 'Soil Health Monitoring',
    message: 'Regular soil testing ensures optimal nutrient management.',
    action: 'Test soil at least once per season. Monitor pH, organic carbon, N-P-K levels.',
    icon: 'microscope'
  });

  // Attach metadata to all
  return recommendations.map(rec => ({
    ...rec,
    prediction_id: prediction_id || null,
    user_phone: user_phone || null,
    crop, season,
    created_at: new Date()
  }));
}

module.exports = { generateRecommendations };
