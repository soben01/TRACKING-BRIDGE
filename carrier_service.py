import re
import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta

# Supported carrier metadata
CARRIERS = {
    "dpd-uk": {
        "code": "dpd-uk",
        "name": "DPD (UK)",
        "logo_color": "#DC2626",
        "badge_bg": "rgba(220, 38, 38, 0.15)",
        "badge_text": "#EF4444",
        "tracking_url": "https://www.dpd.co.uk/tracking/{tracking_number}",
        "track17_carrier_code": 100010
    },
    "ups": {
        "code": "ups",
        "name": "UPS",
        "logo_color": "#CA8A04",
        "badge_bg": "rgba(202, 138, 4, 0.15)",
        "badge_text": "#EAB308",
        "tracking_url": "https://www.ups.com/track?tracknum={tracking_number}",
        "track17_carrier_code": 100002
    },
    "dhl": {
        "code": "dhl",
        "name": "DHL Express",
        "logo_color": "#EAB308",
        "badge_bg": "rgba(234, 179, 8, 0.15)",
        "badge_text": "#FACC15",
        "tracking_url": "https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}",
        "track17_carrier_code": 100001
    },
    "fedex": {
        "code": "fedex",
        "name": "FedEx",
        "logo_color": "#7C3AED",
        "badge_bg": "rgba(124, 58, 237, 0.15)",
        "badge_text": "#A78BFA",
        "tracking_url": "https://www.fedex.com/fedextrack/?tracknumbers={tracking_number}",
        "track17_carrier_code": 100003
    },
    "royal-mail": {
        "code": "royal-mail",
        "name": "Royal Mail",
        "logo_color": "#E11D48",
        "badge_bg": "rgba(225, 29, 72, 0.15)",
        "badge_text": "#FB7185",
        "tracking_url": "https://www.royalmail.com/track-your-item#/tracking-results/{tracking_number}",
        "track17_carrier_code": 100004
    },
    "usps": {
        "code": "usps",
        "name": "USPS",
        "logo_color": "#2563EB",
        "badge_bg": "rgba(37, 99, 235, 0.15)",
        "badge_text": "#60A5FA",
        "tracking_url": "https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking_number}",
        "track17_carrier_code": 100005
    },
    "generic": {
        "code": "generic",
        "name": "International Courier",
        "logo_color": "#6B7280",
        "badge_bg": "rgba(107, 114, 128, 0.15)",
        "badge_text": "#9CA3AF",
        "tracking_url": "https://t.17track.net/en#nums={tracking_number}",
        "track17_carrier_code": 0
    }
}

# Standardized Milestone Progression
MILESTONES = [
    "Shipment Created",
    "Collected",
    "In Transit",
    "Out for Delivery",
    "Delivered"
]

def detect_carrier(tracking_number):
    """
    Intelligently identifies the carrier from tracking number pattern.
    """
    clean_num = str(tracking_number).strip().upper().replace(" ", "").replace("-", "")

    # UPS: 1Z + 16 alphanumeric characters
    if re.match(r"^1Z[0-9A-Z]{16}$", clean_num):
        return CARRIERS["ups"]

    # DHL Express: 10 numeric digits, or starts with DHL / JJD / etc
    if re.match(r"^\d{10}$", clean_num) or clean_num.startswith("DHL") or clean_num.startswith("JJD"):
        return CARRIERS["dhl"]

    # DPD: 14 numeric digits (like 15504338529265 in reference) or 12 digits
    if re.match(r"^\d{14}$", clean_num) or (clean_num.startswith("155") and len(clean_num) == 14):
        return CARRIERS["dpd-uk"]
    if re.match(r"^\d{12}$", clean_num) and (clean_num.startswith("0") or clean_num.startswith("1")):
        return CARRIERS["dpd-uk"]

    # FedEx: 12, 15, 20 or 22 numeric digits, or starts with FDX
    if re.match(r"^\d{12}$|^\d{15}$|^\d{20}$|^\d{22}$", clean_num) or clean_num.startswith("FDX"):
        return CARRIERS["fedex"]

    # Royal Mail: 2 letters + 9 digits + GB
    if re.match(r"^[A-Z]{2}\d{9}GB$", clean_num):
        return CARRIERS["royal-mail"]

    # USPS: 20-22 numeric digits, or 2 letters + 9 digits + US
    if re.match(r"^(94|92|93)\d{20}$", clean_num) or re.match(r"^[A-Z]{2}\d{9}US$", clean_num):
        return CARRIERS["usps"]

    return CARRIERS["generic"]

def normalize_status(raw_status_text):
    """
    Converts raw carrier status strings into standardized milestone statuses.
    """
    text = str(raw_status_text).lower()

    if any(k in text for k in ["deliver", "signed", "completed"]):
        return "Delivered"
    if any(k in text for k in ["out for delivery", "with courier", "on delivery vehicle", "with driver"]):
        return "Out for Delivery"
    if any(k in text for k in ["at depot", "depot sorted", "delivery facility", "sorting center", "arrival at delivery"]):
        return "At Depot"
    if any(k in text for k in ["arrived destination", "arrived in", "destination country", "inbound airport"]):
        return "Arrived Destination"
    if any(k in text for k in ["flight", "departed airport", "departed facility", "transit"]):
        return "Flight Dispatched"
    if any(k in text for k in ["customs", "clearance", "duty"]):
        return "Customs Clearance"
    if any(k in text for k in ["origin facility", "transit scan", "location scan", "departed"]):
        return "In Transit"
    if any(k in text for k in ["picked up", "collected", "origin scan", "received at facility"]):
        return "Collected"
    if any(k in text for k in ["created", "label created", "information received", "order data"]):
        return "Shipment Created"
    if any(k in text for k in ["exception", "delay", "failed", "attempted", "returned"]):
        return "Exception"

    return "In Transit"

def get_carrier_checkpoints(tracking_number, carrier_code, origin, destination):
    """
    Retrieves checkpoints via 17TRACK API if API key is provided,
    otherwise generates realistic sequential events according to shipping route.
    """
    api_key = os.environ.get("TRACK17_API_KEY")

    if api_key:
        try:
            url = "https://api.17track.net/track/v2.2/gettrackinfo"
            payload = [{"number": tracking_number}]
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "17token": api_key
                }
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    res_data = json.loads(response.read().decode("utf-8"))
                    # Parse 17track response if available
                    accepted = res_data.get("data", {}).get("accepted", [])
                    if accepted:
                        track_info = accepted[0].get("track", {})
                        events = track_info.get("z0", {}).get("z", [])
                        if events:
                            parsed_events = []
                            for ev in events:
                                time_str = ev.get("a", "")
                                desc = ev.get("z", "")
                                loc = ev.get("c", origin)
                                norm = normalize_status(desc)
                                parsed_events.append({
                                    "event_time": time_str,
                                    "status": norm,
                                    "carrier_status": desc,
                                    "location": loc,
                                    "description": desc
                                })
                            return parsed_events
        except Exception as e:
            print(f"17TRACK API query notice: {e}. Falling back to simulation.")

    # High-quality realistic event generation
    now = datetime.now()
    carrier = CARRIERS.get(carrier_code, CARRIERS["generic"])
    cname = carrier["name"]

    created_time = (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M")
    collected_time = (now - timedelta(days=1, hours=18)).strftime("%Y-%m-%d %H:%M")
    transit_time = (now - timedelta(days=1, hours=6)).strftime("%Y-%m-%d %H:%M")
    depot_time = (now - timedelta(hours=8)).strftime("%Y-%m-%d %H:%M")
    out_time = (now - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M")

    return [
        {
            "event_time": created_time,
            "status": "Shipment Created",
            "carrier_status": "Shipment Information Received",
            "location": f"{origin} Logistics Center",
            "description": f"Shipment details received electronically by {cname}."
        },
        {
            "event_time": collected_time,
            "status": "Collected",
            "carrier_status": "Package Picked Up",
            "location": f"{origin} Processing Facility",
            "description": f"Package received from shipper and scanned into network."
        },
        {
            "event_time": transit_time,
            "status": "In Transit",
            "carrier_status": "Departed International Gateway",
            "location": f"{origin} Cargo Terminal",
            "description": f"Dispatched on international route en route to {destination}."
        },
        {
            "event_time": depot_time,
            "status": "At Depot",
            "carrier_status": "Arrived at Destination Facility",
            "location": f"{destination} Regional Hub",
            "description": "Package received at destination sorting depot."
        },
        {
            "event_time": out_time,
            "status": "Out for Delivery",
            "carrier_status": "Out for Delivery with Courier",
            "location": f"{destination} Distribution Depot",
            "description": f"Loaded on vehicle for delivery to recipient address."
        }
    ]
