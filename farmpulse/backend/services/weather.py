import requests
from typing import Dict, Any

def get_weather_data(lat: float, lng: float) -> Dict[str, Any]:
    """
    Fetches real-time weather data from Open-Meteo (No API key required).
    Returns temperature, humidity, and recent precipitation.
    """
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum&timezone=auto"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        current = data.get("current", {})
        daily = data.get("daily", {})
        
        # Calculate recent rainfall (sum of last 7 days)
        precip_7d = sum(daily.get("precipitation_sum", [])[:7]) if "precipitation_sum" in daily else 0
        
        return {
            "temp": current.get("temperature_2m", 25.0),
            "humidity": current.get("relative_humidity_2m", 60),
            "precipitation_current": current.get("precipitation", 0),
            "precipitation_7d_total": round(precip_7d, 2),
            "status": "live"
        }
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return {
            "temp": 25.0,
            "humidity": 60,
            "precipitation_current": 0,
            "precipitation_7d_total": 0,
            "status": "fallback"
        }
