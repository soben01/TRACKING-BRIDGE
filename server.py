import os
import json
import sqlite3
import mimetypes
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

import database
from carrier_service import (
    detect_carrier, normalize_status, get_carrier_checkpoints, CARRIERS, MILESTONES,
    get_api_key, set_api_key, query_17track_live
)

PORT = int(os.environ.get("PORT", 8080))
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

class TrackingBridgeHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status=400):
        self.send_json({"error": message}, status=status)

    def read_json_body(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                return {}
            raw_data = self.rfile.read(content_length).decode("utf-8")
            return json.loads(raw_data)
        except Exception as e:
            print(f"Error reading JSON body: {e}")
            return None

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query = parse_qs(parsed_url.query)

        # API Endpoints
        if path == "/api/shipments":
            self.handle_get_shipments(query)
            return

        if path.startswith("/api/shipments/"):
            shipment_id = path.split("/")[3]
            self.handle_get_single_shipment(shipment_id)
            return

        if path == "/api/track":
            awb = query.get("awb", [None])[0] or query.get("num", [None])[0]
            self.handle_track_lookup(awb)
            return

        if path == "/api/carriers":
            self.send_json({"carriers": CARRIERS})
            return

        if path == "/api/settings":
            k = get_api_key()
            masked = (k[:4] + "..." + k[-4:]) if len(k) >= 8 else ("Configured" if k else "")
            self.send_json({"has_api_key": bool(k), "api_key_masked": masked})
            return

        # Static File Serving
        self.serve_static(path)

    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        if path == "/api/shipments":
            self.handle_create_shipment()
            return

        if path.startswith("/api/shipments/") and path.endswith("/advance"):
            shipment_id = path.split("/")[3]
            self.handle_advance_shipment(shipment_id)
            return

        if path.startswith("/api/shipments/") and path.endswith("/sync"):
            shipment_id = path.split("/")[3]
            self.handle_sync_shipment(shipment_id)
            return

        if path == "/api/settings":
            data = self.read_json_body() or {}
            k = str(data.get("track17_api_key", "")).strip()
            set_api_key(k)
            self.send_json({"message": "17TRACK API Key saved successfully", "has_api_key": bool(k)})
            return

        if path == "/api/shipments/batch":
            self.handle_batch_import()
            return

        if path == "/api/detect-carrier":
            self.handle_detect_carrier()
            return

        self.send_error_json("Endpoint not found", 404)

    def do_DELETE(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        if path.startswith("/api/shipments/"):
            shipment_id = path.split("/")[3]
            self.handle_delete_shipment(shipment_id)
            return

        self.send_error_json("Endpoint not found", 404)

    # ------------------ API Handlers ------------------

    def handle_get_shipments(self, query):
        search = query.get("q", [""])[0].strip().lower()
        carrier_filter = query.get("carrier", [""])[0].strip()
        status_filter = query.get("status", [""])[0].strip()

        conn = database.get_db_connection()
        cursor = conn.cursor()

        sql = "SELECT * FROM shipments WHERE 1=1"
        params = []

        if search:
            sql += """ AND (
                LOWER(awb_number) LIKE ? OR
                LOWER(tracking_number) LIKE ? OR
                LOWER(customer_name) LIKE ? OR
                LOWER(carrier_name) LIKE ? OR
                LOWER(origin) LIKE ? OR
                LOWER(destination) LIKE ?
            )"""
            pattern = f"%{search}%"
            params.extend([pattern] * 6)

        if carrier_filter and carrier_filter != "all":
            sql += " AND carrier_code = ?"
            params.append(carrier_filter)

        if status_filter and status_filter != "all":
            sql += " AND LOWER(current_status) = LOWER(?)"
            params.append(status_filter)

        sql += " ORDER BY updated_at DESC"
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        shipments = [dict(row) for row in rows]

        # Fetch stats across all shipments
        cursor.execute("SELECT current_status, COUNT(*) as count FROM shipments GROUP BY current_status")
        stat_rows = cursor.fetchall()

        stats = {
            "total": len(shipments),
            "delivered": 0,
            "in_transit": 0,
            "out_for_delivery": 0,
            "created": 0,
            "exception": 0
        }

        # Global counts for KPI cards
        cursor.execute("SELECT COUNT(*) FROM shipments")
        stats["total"] = cursor.fetchone()[0]

        for r in stat_rows:
            st = str(r["current_status"]).lower()
            if "deliver" in st:
                stats["delivered"] += r["count"]
            elif "out for delivery" in st:
                stats["out_for_delivery"] += r["count"]
            elif "transit" in st or "custom" in st or "flight" in st or "depot" in st or "collect" in st:
                stats["in_transit"] += r["count"]
            elif "create" in st:
                stats["created"] += r["count"]
            elif "exception" in st:
                stats["exception"] += r["count"]

        conn.close()
        self.send_json({"shipments": shipments, "stats": stats})

    def handle_get_single_shipment(self, shipment_id):
        conn = database.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM shipments WHERE id = ? OR shipment_code = ?", (shipment_id, shipment_id))
        shipment_row = cursor.fetchone()

        if not shipment_row:
            conn.close()
            self.send_error_json("Shipment not found", 404)
            return

        shipment = dict(shipment_row)

        cursor.execute("""
            SELECT * FROM tracking_events
            WHERE shipment_id = ?
            ORDER BY event_time DESC
        """, (shipment["id"],))
        events = [dict(e) for e in cursor.fetchall()]

        # Milestone step progression calculation
        milestone_index = 0
        cur_status = shipment["current_status"]
        if cur_status == "Delivered":
            milestone_index = 4
        elif cur_status == "Out for Delivery":
            milestone_index = 3
        elif cur_status in ["In Transit", "At Depot", "Flight Dispatched", "Customs Clearance"]:
            milestone_index = 2
        elif cur_status in ["Collected"]:
            milestone_index = 1
        else:
            milestone_index = 0

        conn.close()
        self.send_json({
            "shipment": shipment,
            "events": events,
            "milestone_index": milestone_index,
            "milestones": MILESTONES
        })

    def handle_track_lookup(self, query_str):
        if not query_str:
            self.send_error_json("Missing AWB or tracking number", 400)
            return

        clean_query = query_str.strip()
        conn = database.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM shipments
            WHERE LOWER(awb_number) = LOWER(?)
               OR LOWER(tracking_number) = LOWER(?)
               OR LOWER(shipment_code) = LOWER(?)
            LIMIT 1
        """, (clean_query, clean_query, clean_query))
        shipment_row = cursor.fetchone()

        if not shipment_row:
            conn.close()
            self.send_error_json(f"No shipment found matching tracking/AWB '{clean_query}'", 404)
            return

        shipment = dict(shipment_row)
        cursor.execute("""
            SELECT * FROM tracking_events
            WHERE shipment_id = ?
            ORDER BY event_time DESC
        """, (shipment["id"],))
        events = [dict(e) for e in cursor.fetchall()]

        milestone_index = 0
        cur_status = shipment["current_status"]
        if cur_status == "Delivered":
            milestone_index = 4
        elif cur_status == "Out for Delivery":
            milestone_index = 3
        elif cur_status in ["In Transit", "At Depot", "Flight Dispatched", "Customs Clearance"]:
            milestone_index = 2
        elif cur_status in ["Collected"]:
            milestone_index = 1
        else:
            milestone_index = 0

        conn.close()
        self.send_json({
            "shipment": shipment,
            "events": events,
            "milestone_index": milestone_index,
            "milestones": MILESTONES
        })

    def handle_create_shipment(self):
        data = self.read_json_body()
        if not data:
            self.send_error_json("Invalid JSON payload", 400)
            return

        awb = str(data.get("awb_number", "")).strip()
        tracking_no = str(data.get("tracking_number", "")).strip() or awb
        customer = str(data.get("customer_name", "")).strip()
        origin = str(data.get("origin", "")).strip() or "Origin Facility"
        destination = str(data.get("destination", "")).strip() or "Destination Facility"
        carrier_code = data.get("carrier_code")

        if not awb:
            self.send_error_json("AWB Number is required", 400)
            return
        if not customer:
            self.send_error_json("Customer Name is required", 400)
            return

        # Auto-detect carrier if not provided
        if not carrier_code or carrier_code == "auto":
            detected = detect_carrier(tracking_no)
            carrier_code = detected["code"]
            carrier_name = detected["name"]
        else:
            carrier_info = CARRIERS.get(carrier_code, CARRIERS["generic"])
            carrier_name = carrier_info["name"]

        conn = database.get_db_connection()
        cursor = conn.cursor()

        # Generate unique shipment code
        cursor.execute("SELECT COUNT(*) FROM shipments")
        seq = cursor.fetchone()[0] + 1
        shipment_code = f"SHIP-{seq:04d}"

        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Initial check points
        initial_checkpoints = get_carrier_checkpoints(tracking_no, carrier_code, origin, destination)
        latest_event = initial_checkpoints[-1] if initial_checkpoints else None
        current_status = latest_event["status"] if latest_event else "Shipment Created"
        current_location = latest_event["location"] if latest_event else f"{origin} Logistics Hub"

        cursor.execute("""
            INSERT INTO shipments (
                shipment_code, awb_number, tracking_number, customer_name, origin, destination,
                carrier_name, carrier_code, current_status, current_location, estimated_delivery,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            shipment_code, awb, tracking_no, customer, origin, destination,
            carrier_name, carrier_code, current_status, current_location,
            "In 2-4 business days", now_str, now_str
        ))
        new_id = cursor.lastrowid

        for ev in initial_checkpoints:
            cursor.execute("""
                INSERT INTO tracking_events (shipment_id, event_time, status, carrier_status, location, description)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (new_id, ev["event_time"], ev["status"], ev["carrier_status"], ev["location"], ev["description"]))

        conn.commit()
        conn.close()

        self.send_json({
            "message": "Shipment created successfully",
            "shipment_id": new_id,
            "shipment_code": shipment_code,
            "carrier_detected": carrier_name
        }, 201)

    def handle_advance_shipment(self, shipment_id):
        conn = database.get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM shipments WHERE id = ?", (shipment_id,))
        shipment = cursor.fetchone()
        if not shipment:
            conn.close()
            self.send_error_json("Shipment not found", 404)
            return

        cur = shipment["current_status"]
        now = datetime.now()
        now_time = now.strftime("%Y-%m-%d %H:%M")

        next_status = "Delivered"
        location = shipment["current_location"]
        desc = ""
        carrier_status = ""

        if cur == "Shipment Created":
            next_status = "Collected"
            location = f"{shipment['origin']} Depository"
            carrier_status = "Package Picked Up"
            desc = "Carrier has collected parcel from origin dispatch."
        elif cur == "Collected":
            next_status = "In Transit"
            location = f"{shipment['origin']} Air Terminal"
            carrier_status = "Departed Sorting Hub"
            desc = "In transit to destination gateway."
        elif cur == "In Transit" or cur in ["Flight Dispatched", "Customs Clearance"]:
            next_status = "At Depot"
            location = f"{shipment['destination']} Central Depot"
            carrier_status = "Arrived at Destination Facility"
            desc = "Processed through inbound destination sorting facility."
        elif cur == "At Depot":
            next_status = "Out for Delivery"
            location = f"{shipment['destination']} Delivery Unit"
            carrier_status = "Out for Delivery with Courier"
            desc = "Package is on vehicle with courier for delivery today."
        elif cur == "Out for Delivery":
            next_status = "Delivered"
            location = f"{shipment['destination']} Recipient Address"
            carrier_status = "Delivered - Signed"
            desc = f"Package delivered successfully. Signed by: {shipment['customer_name']}."

        cursor.execute("""
            INSERT INTO tracking_events (shipment_id, event_time, status, carrier_status, location, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (shipment_id, now_time, next_status, carrier_status, location, desc))

        delivered_at = now.strftime("%Y-%m-%d %H:%M:%S") if next_status == "Delivered" else shipment["delivered_at"]

        cursor.execute("""
            UPDATE shipments
            SET current_status = ?, current_location = ?, delivered_at = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (next_status, location, delivered_at, shipment_id))

        conn.commit()
        conn.close()

        self.send_json({
            "message": f"Shipment status advanced to {next_status}",
            "new_status": next_status
        })

    def handle_sync_shipment(self, shipment_id):
        conn = database.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM shipments WHERE id = ?", (shipment_id,))
        shipment = cursor.fetchone()
        if not shipment:
            conn.close()
            self.send_error_json("Shipment not found", 404)
            return

        tracking_no = shipment["tracking_number"]
        carrier_code = shipment["carrier_code"]
        live_events = query_17track_live(tracking_no, carrier_code)
        if not live_events:
            conn.close()
            self.send_json({
                "message": "No live carrier updates available yet. Configure 17TRACK API Key in settings.",
                "synced": False
            })
            return

        cursor.execute("DELETE FROM tracking_events WHERE shipment_id = ?", (shipment_id,))
        for ev in live_events:
            cursor.execute("""
                INSERT INTO tracking_events (shipment_id, event_time, status, carrier_status, location, description)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (shipment_id, ev["event_time"], ev["status"], ev["carrier_status"], ev["location"], ev["description"]))

        latest = live_events[0]
        cursor.execute("""
            UPDATE shipments
            SET current_status = ?, current_location = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (latest["status"], latest["location"], shipment_id))
        conn.commit()
        conn.close()

        self.send_json({
            "message": f"Successfully synced with live {shipment['carrier_name']} data!",
            "synced": True,
            "status": latest["status"]
        })

    def handle_batch_import(self):
        data = self.read_json_body()
        if not data or "items" not in data:
            self.send_error_json("Expected JSON with 'items' list", 400)
            return

        items = data["items"]
        if not isinstance(items, list) or len(items) == 0:
            self.send_error_json("No items provided", 400)
            return

        conn = database.get_db_connection()
        cursor = conn.cursor()

        created_count = 0
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        for it in items:
            awb = str(it.get("awb", "") or it.get("awb_number", "")).strip()
            tracking_no = str(it.get("tracking_number", "")).strip() or awb
            name = str(it.get("customer_name", "") or it.get("name", "")).strip()
            origin = str(it.get("origin", "")).strip() or "Origin Hub"
            dest = str(it.get("destination", "")).strip() or "Destination Hub"

            if not awb or not name:
                continue

            detected = detect_carrier(tracking_no)
            carrier_code = detected["code"]
            carrier_name = detected["name"]

            cursor.execute("SELECT COUNT(*) FROM shipments")
            seq = cursor.fetchone()[0] + 1
            shipment_code = f"SHIP-{seq:04d}"

            checkpoints = get_carrier_checkpoints(tracking_no, carrier_code, origin, dest)
            latest = checkpoints[-1] if checkpoints else None
            status = latest["status"] if latest else "Shipment Created"
            loc = latest["location"] if latest else f"{origin} Logistics Center"

            cursor.execute("""
                INSERT INTO shipments (
                    shipment_code, awb_number, tracking_number, customer_name, origin, destination,
                    carrier_name, carrier_code, current_status, current_location, estimated_delivery,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                shipment_code, awb, tracking_no, name, origin, dest,
                carrier_name, carrier_code, status, loc,
                "In 3-5 business days", now_str, now_str
            ))
            s_id = cursor.lastrowid

            for ev in checkpoints:
                cursor.execute("""
                    INSERT INTO tracking_events (shipment_id, event_time, status, carrier_status, location, description)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (s_id, ev["event_time"], ev["status"], ev["carrier_status"], ev["location"], ev["description"]))

            created_count += 1

        conn.commit()
        conn.close()

        self.send_json({"message": f"Successfully imported {created_count} shipments", "count": created_count})

    def handle_detect_carrier(self):
        data = self.read_json_body()
        num = data.get("tracking_number", "") if data else ""
        detected = detect_carrier(num)
        self.send_json({"detected": detected})

    def handle_delete_shipment(self, shipment_id):
        conn = database.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM shipments WHERE id = ?", (shipment_id,))
        cursor.execute("DELETE FROM tracking_events WHERE shipment_id = ?", (shipment_id,))
        conn.commit()
        conn.close()
        self.send_json({"message": "Shipment deleted successfully"})

    # ------------------ Static File Serving ------------------

    def serve_static(self, path):
        if path == "/" or path == "":
            path = "/index.html"

        # Prevent directory traversal
        safe_path = os.path.normpath(path.lstrip("/"))
        file_path = os.path.join(PUBLIC_DIR, safe_path)

        if not os.path.exists(file_path) or os.path.isdir(file_path):
            file_path = os.path.join(PUBLIC_DIR, "index.html")

        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", f"{content_type}; charset=utf-8" if "text" in content_type or "javascript" in content_type else content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error_json(f"Error serving file: {e}", 500)

def run():
    database.init_db()
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, TrackingBridgeHandler)
    print(f"🚀 Tracking Bridge Server running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    run()
