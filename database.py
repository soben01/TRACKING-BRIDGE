import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tracking_bridge.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create shipments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_code TEXT UNIQUE,
        awb_number TEXT NOT NULL,
        tracking_number TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        carrier_name TEXT NOT NULL,
        carrier_code TEXT NOT NULL,
        current_status TEXT NOT NULL,
        current_location TEXT NOT NULL,
        estimated_delivery TEXT,
        delivered_at TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create tracking_events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tracking_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id INTEGER NOT NULL,
        event_time TEXT NOT NULL,
        status TEXT NOT NULL,
        carrier_status TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
    )
    """)

    conn.commit()

    # Check if shipments already exist; if not, seed realistic data
    cursor.execute("SELECT COUNT(*) FROM shipments")
    count = cursor.fetchone()[0]

    if count == 0:
        seed_data(cursor)
        conn.commit()

    conn.close()

def seed_data(cursor):
    # Reference Shipment 1: ASMITA SUNAR (Nepal -> UK, DPD) exactly from the ChatGPT reference
    cursor.execute("""
    INSERT INTO shipments (
        shipment_code, awb_number, tracking_number, customer_name, origin, destination,
        carrier_name, carrier_code, current_status, current_location, estimated_delivery, delivered_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "SHIP-0001",
        "15504338529265",
        "15504338529265",
        "ASMITA SUNAR",
        "Nepal",
        "United Kingdom",
        "DPD (UK)",
        "dpd-uk",
        "Delivered",
        "Residential Address, London, UK",
        "2026-08-26 14:30:00",
        "2026-08-26 14:26:00",
        "2026-08-21 08:17:00",
        "2026-08-26 14:26:00"
    ))
    s1_id = cursor.lastrowid

    s1_events = [
        ("2026-08-21 08:17", "Shipment Created", "Order Information Received", "Kathmandu, Nepal", "Sender has provided electronic shipping documentation to DPD gateway."),
        ("2026-08-22 11:30", "Collected", "Picked Up", "Kathmandu Export Depot, Nepal", "Parcel collected from merchant warehouse and weighed."),
        ("2026-08-23 15:45", "Customs Clearance", "Customs Clearance Completed", "Tribhuvan International Hub, Nepal", "Customs declarations cleared. Approved for international export flight."),
        ("2026-08-24 02:10", "Flight Dispatched", "Flight Assigned & Departed", "Tribhuvan Intl Airport (KTM)", "Dispatched on connecting cargo flight BA-142 to London Heathrow."),
        ("2026-08-25 18:40", "Arrived Destination", "Arrived in United Kingdom", "Heathrow Airport (LHR), London", "Consignment arrived at London air hub. Inbound customs release approved."),
        ("2026-08-26 00:52", "At Depot", "Arrived at Depot", "London Central Hub, UK", "We have your parcel and it is on its way to your local delivery depot."),
        ("2026-08-26 08:03", "At Depot", "At Depot Sorted", "London South Depot, UK", "Your parcel is at our local depot and staged for final vehicle loading."),
        ("2026-08-26 08:54", "Out for Delivery", "Out for Delivery", "London South Delivery Route, UK", "Your parcel will be delivered with you today by driver Dave between 13:30 and 14:30."),
        ("2026-08-26 14:26", "Delivered", "Delivered - Signed", "Residential Address, London, UK", "Your parcel has been delivered successfully. Signed for by: ASMITA.")
    ]

    for ev in s1_events:
        cursor.execute("""
        INSERT INTO tracking_events (shipment_id, event_time, status, carrier_status, location, description)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (s1_id, ev[0], ev[1], ev[2], ev[3], ev[4]))

    # Shipment 2: JOHN SMITH (Netherlands -> Germany, UPS)
    cursor.execute("""
    INSERT INTO shipments (
        shipment_code, awb_number, tracking_number, customer_name, origin, destination,
        carrier_name, carrier_code, current_status, current_location, estimated_delivery, delivered_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "SHIP-0002",
        "1ZRJ70256812472852",
        "1ZRJ70256812472852",
        "JOHN SMITH",
        "Netherlands",
        "Germany",
        "UPS",
        "ups",
        "In Transit",
        "Düsseldorf Sorting Hub, Germany",
        "2026-09-12 18:00:00",
        None,
        "2026-09-08 09:30:00",
        "2026-09-10 11:20:00"
    ))
    s2_id = cursor.lastrowid

    s2_events = [
        ("2026-09-08 09:30", "Shipment Created", "Label Created", "Amsterdam, Netherlands", "Shipper created a label, UPS has not received the package yet."),
        ("2026-09-08 17:15", "Collected", "Origin Scan", "Amsterdam Sorting Center, Netherlands", "Package arrived at UPS facility."),
        ("2026-09-09 04:30", "Flight Dispatched", "Departure Scan", "Utrecht Ground Terminal, Netherlands", "Package departed origin facility en route to international hub."),
        ("2026-09-10 11:20", "In Transit", "Location Scan", "Düsseldorf Sorting Hub, Germany", "Package scanned at transit destination hub.")
    ]

    for ev in s2_events:
        cursor.execute("""
        INSERT INTO tracking_events (shipment_id, event_time, status, carrier_status, location, description)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (s2_id, ev[0], ev[1], ev[2], ev[3], ev[4]))

    # Shipment 3: EMMA WATSON (Japan -> United States, DHL Express)
    cursor.execute("""
    INSERT INTO shipments (
        shipment_code, awb_number, tracking_number, customer_name, origin, destination,
        carrier_name, carrier_code, current_status, current_location, estimated_delivery, delivered_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "SHIP-0003",
        "DHL9823412091",
        "9823412091",
        "EMMA WATSON",
        "Japan",
        "United States",
        "DHL Express",
        "dhl",
        "Out for Delivery",
        "Los Angeles Delivery Depot, CA, USA",
        "2026-09-10 17:00:00",
        None,
        "2026-09-07 10:00:00",
        "2026-09-10 08:15:00"
    ))
    s3_id = cursor.lastrowid

    s3_events = [
        ("2026-09-07 10:00", "Shipment Created", "Shipment Information Received", "Tokyo, Japan", "Digital shipment record generated."),
        ("2026-09-07 16:45", "Collected", "Shipment Picked Up", "Narita Gateway, Japan", "Consignment picked up by DHL courier."),
        ("2026-09-08 22:15", "Flight Dispatched", "Departed Facility in Tokyo", "Tokyo Narita Airport (NRT)", "Transpacific cargo flight en route to Los Angeles."),
        ("2026-09-09 14:20", "Customs Clearance", "Clearance Processing Complete", "Los Angeles Gateway (LAX), USA", "Customs cleared at port of entry."),
        ("2026-09-10 03:40", "At Depot", "Arrived at DHL Delivery Facility", "Los Angeles Facility, CA, USA", "Processed for courier vehicle loading."),
        ("2026-09-10 08:15", "Out for Delivery", "With Delivery Courier", "Los Angeles, CA, USA", "Courier is en route to customer destination.")
    ]

    for ev in s3_events:
        cursor.execute("""
        INSERT INTO tracking_events (shipment_id, event_time, status, carrier_status, location, description)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (s3_id, ev[0], ev[1], ev[2], ev[3], ev[4]))

    # Shipment 4: CARLOS MENDEZ (Singapore -> Australia, FedEx)
    cursor.execute("""
    INSERT INTO shipments (
        shipment_code, awb_number, tracking_number, customer_name, origin, destination,
        carrier_name, carrier_code, current_status, current_location, estimated_delivery, delivered_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "SHIP-0004",
        "FDX77391823091",
        "773918230912",
        "CARLOS MENDEZ",
        "Singapore",
        "Australia",
        "FedEx",
        "fedex",
        "Shipment Created",
        "Singapore Changi Station",
        "2026-09-15 16:00:00",
        None,
        "2026-09-10 09:10:00",
        "2026-09-10 09:10:00"
    ))
    s4_id = cursor.lastrowid

    cursor.execute("""
    INSERT INTO tracking_events (shipment_id, event_time, status, carrier_status, location, description)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (s4_id, "2026-09-10 09:10", "Shipment Created", "Shipment Information Sent to FedEx", "Singapore Changi Station", "Shipping details electronically submitted."))
