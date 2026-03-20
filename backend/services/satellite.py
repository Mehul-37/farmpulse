import ee
from datetime import datetime, timedelta

def init_gee():
    try:
        ee.Initialize(project='gen-lang-client-0708495064')
        print("GEE Initialized successfully.")
    except Exception as e:
        print(f"GEE Initialization failed (non-fatal): {e}")

def get_ndvi(lat: float, lng: float, date_start: str = None, date_end: str = None):
    """
    Fetches real NDVI value for a given location from Sentinel-2.
    Tries progressively wider date ranges if no cloud-free imagery is found.
    """
    point = ee.Geometry.Point([lng, lat])
    
    # Try increasingly wide date ranges to find usable imagery
    search_days = [30, 60, 90, 180, 365]
    
    for days in search_days:
        try:
            end_dt = datetime.now()
            start_dt = end_dt - timedelta(days=days)
            ds = start_dt.strftime('%Y-%m-%d')
            de = end_dt.strftime('%Y-%m-%d')
            
            print(f"Searching Sentinel-2 from {ds} to {de} ...")
            
            collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterDate(ds, de) \
                .filterBounds(point) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
            
            # Check if collection has any images
            count = collection.size().getInfo()
            print(f"  Found {count} images in last {days} days")
            
            if count == 0:
                continue
            
            image = collection.median()
            
            # Calculate NDVI: (NIR - Red) / (NIR + Red)
            ndvi = image.normalizedDifference(['B8', 'B4'])
            
            result = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=10
            ).getInfo()
            
            val = result.get('nd')
            if val is not None:
                print(f"  SUCCESS: NDVI = {val:.4f}")
                return round(val, 3)
                
        except Exception as e:
            print(f"Error fetching GEE data (range={days}d): {e}")
            continue
    
    print("No NDVI data found in any date range")
    return -1.0

def get_ndwi(lat: float, lng: float):
    """
    Fetches real NDWI (Normalized Difference Water Index) for a given location.
    NDWI = (B8A - B11) / (B8A + B11)   — measures vegetation water content.
    Uses the same progressive date-range strategy as get_ndvi().
    """
    point = ee.Geometry.Point([lng, lat])
    search_days = [30, 60, 90, 180, 365]

    for days in search_days:
        try:
            end_dt = datetime.now()
            start_dt = end_dt - timedelta(days=days)
            ds = start_dt.strftime('%Y-%m-%d')
            de = end_dt.strftime('%Y-%m-%d')

            print(f"[NDWI] Searching Sentinel-2 from {ds} to {de} ...")

            collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterDate(ds, de) \
                .filterBounds(point) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))

            count = collection.size().getInfo()
            print(f"  [NDWI] Found {count} images in last {days} days")

            if count == 0:
                continue

            image = collection.median()

            # NDWI: (NIR narrow - SWIR) / (NIR narrow + SWIR)
            ndwi = image.normalizedDifference(['B8A', 'B11'])

            result = ndwi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=10
            ).getInfo()

            val = result.get('nd')
            if val is not None:
                print(f"  [NDWI] SUCCESS: NDWI = {val:.4f}")
                return round(val, 3)

        except Exception as e:
            print(f"[NDWI] Error fetching GEE data (range={days}d): {e}")
            continue

    print("[NDWI] No NDWI data found in any date range")
    return -1.0
