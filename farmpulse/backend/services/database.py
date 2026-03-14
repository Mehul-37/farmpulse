import json
import os
from typing import Dict, Any, Optional

DB_FILE = "farm_data.json"

def load_db() -> Dict[str, Any]:
    if not os.path.exists(DB_FILE):
        return {"profiles": {}}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except:
        return {"profiles": {}}

def save_db(data: Dict[str, Any]):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

def save_profile(profile_id: str, profile_data: Dict[str, Any]):
    db = load_db()
    db["profiles"][profile_id] = profile_data
    save_db(db)

def get_profile(profile_id: str) -> Optional[Dict[str, Any]]:
    db = load_db()
    return db["profiles"].get(profile_id)
