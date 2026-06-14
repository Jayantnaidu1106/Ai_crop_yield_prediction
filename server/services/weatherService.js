/**
 * Weather Service — OpenWeatherMap Integration
 * Fetches real weather data for farm locations and detects rain/severe weather
 */

const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const weatherClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

/**
 * Get current weather for a location
 */
async function getCurrentWeather(lat, lng) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured. Set OPENWEATHER_API_KEY in .env');
  }

  try {
    const response = await weatherClient.get('/weather', {
      params: {
        lat, lon: lng,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;
    return {
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      weather: data.weather[0]?.main || 'Unknown',
      weather_description: data.weather[0]?.description || '',
      weather_icon: data.weather[0]?.icon || '01d',
      clouds: data.clouds?.all || 0,
      rain_1h: data.rain?.['1h'] || 0,
      rain_3h: data.rain?.['3h'] || 0,
      visibility: data.visibility || 10000,
      location_name: data.name || 'Unknown',
      country: data.sys?.country || '',
      sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
      sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenWeatherMap API key');
    }
    throw new Error(`Weather fetch failed: ${error.message}`);
  }
}

/**
 * Get 5-day/3-hour forecast for a location
 */
async function getForecast(lat, lng) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  try {
    const response = await weatherClient.get('/forecast', {
      params: {
        lat, lon: lng,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const forecasts = response.data.list.map(item => ({
      datetime: item.dt_txt,
      timestamp: item.dt,
      temperature: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      weather: item.weather[0]?.main || 'Unknown',
      weather_description: item.weather[0]?.description || '',
      weather_icon: item.weather[0]?.icon || '01d',
      wind_speed: item.wind.speed,
      clouds: item.clouds?.all || 0,
      rain_3h: item.rain?.['3h'] || 0,
      snow_3h: item.snow?.['3h'] || 0,
      pop: Math.round((item.pop || 0) * 100) // Probability of precipitation %
    }));

    return {
      location_name: response.data.city?.name || 'Unknown',
      country: response.data.city?.country || '',
      forecasts
    };
  } catch (error) {
    throw new Error(`Forecast fetch failed: ${error.message}`);
  }
}

/**
 * Detect rain/severe weather in upcoming forecast
 * Returns array of alert objects
 */
function detectWeatherAlerts(forecastData) {
  const alerts = [];
  const { forecasts, location_name } = forecastData;

  // Group forecasts by date
  const byDate = {};
  forecasts.forEach(f => {
    const date = f.datetime.split(' ')[0];
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(f);
  });

  for (const [date, items] of Object.entries(byDate)) {
    // Rain detection
    const rainItems = items.filter(f =>
      f.weather === 'Rain' || f.weather === 'Drizzle' || f.rain_3h > 0 || f.pop > 60
    );

    if (rainItems.length > 0) {
      const totalRain = rainItems.reduce((sum, f) => sum + (f.rain_3h || 0), 0);
      const maxPop = Math.max(...rainItems.map(f => f.pop));
      const timeSlots = rainItems.map(f => {
        const hour = parseInt(f.datetime.split(' ')[1].split(':')[0]);
        return `${hour}:00`;
      });

      const dateObj = new Date(date);
      const dateStr = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

      alerts.push({
        type: 'rain',
        severity: totalRain > 20 ? 'critical' : totalRain > 5 ? 'warning' : 'info',
        date,
        date_display: dateStr,
        location: location_name,
        message: `🌧️ Rain expected on ${dateStr} between ${timeSlots[0]}–${timeSlots[timeSlots.length - 1]}`,
        details: `Expected: ~${Math.round(totalRain)}mm, Probability: ${maxPop}%`,
        precautions: getRainPrecautions(totalRain),
        total_rain_mm: Math.round(totalRain),
        probability: maxPop
      });
    }

    // Extreme temperature detection
    const maxTemp = Math.max(...items.map(f => f.temperature));
    const minTemp = Math.min(...items.map(f => f.temperature));

    if (maxTemp > 42) {
      const dateObj = new Date(date);
      alerts.push({
        type: 'heat',
        severity: 'critical',
        date,
        date_display: dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        location: location_name,
        message: `🔥 Extreme heat warning: ${maxTemp}°C expected`,
        details: `Max temperature: ${maxTemp}°C`,
        precautions: 'Increase irrigation frequency. Provide shade for nurseries. Avoid field work between 11AM–3PM. Apply mulch to conserve soil moisture.'
      });
    }

    if (minTemp < 5) {
      const dateObj = new Date(date);
      alerts.push({
        type: 'frost',
        severity: 'warning',
        date,
        date_display: dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        location: location_name,
        message: `❄️ Frost risk: Temperature dropping to ${minTemp}°C`,
        details: `Min temperature: ${minTemp}°C`,
        precautions: 'Light irrigation before sunset. Use straw/plastic covers for sensitive crops. Avoid spraying pesticides in frost conditions.'
      });
    }

    // Strong wind detection
    const maxWind = Math.max(...items.map(f => f.wind_speed));
    if (maxWind > 15) {
      const dateObj = new Date(date);
      alerts.push({
        type: 'wind',
        severity: maxWind > 25 ? 'critical' : 'warning',
        date,
        date_display: dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        location: location_name,
        message: `💨 Strong wind alert: ${Math.round(maxWind)} m/s`,
        details: `Max wind speed: ${Math.round(maxWind)} m/s`,
        precautions: 'Stake tall crops. Delay pesticide spraying. Secure greenhouse coverings.'
      });
    }
  }

  return alerts;
}

/**
 * Get rain precautions based on expected rainfall amount
 */
function getRainPrecautions(rainMm) {
  if (rainMm > 50) {
    return 'Heavy rainfall expected! Ensure proper drainage. Move harvested produce to covered storage. Avoid applying fertilizer or pesticide. Check bunds and field boundaries.';
  } else if (rainMm > 20) {
    return 'Moderate rain expected. Cover harvested crops. Ensure drainage channels are clear. Delay irrigation. Check for waterlogging after rain.';
  } else if (rainMm > 5) {
    return 'Light to moderate rain expected. Good for standing crops. Delay any planned irrigation. Monitor for fungal diseases after rain.';
  } else {
    return 'Light drizzle possible. No major precautions needed. Good conditions for crop growth.';
  }
}

/**
 * Generate SMS message for weather alert
 */
function generateWeatherSMS(alert, farmLocation) {
  const location = farmLocation || alert.location || 'your farm';
  let msg = `🌾 FarmPlus Weather Alert\n`;
  msg += `📍 ${location}\n\n`;
  msg += `${alert.message}\n`;
  msg += `${alert.details}\n\n`;
  msg += `⚠️ Precautions:\n${alert.precautions}`;
  return msg;
}

module.exports = {
  getCurrentWeather,
  getForecast,
  detectWeatherAlerts,
  generateWeatherSMS
};
