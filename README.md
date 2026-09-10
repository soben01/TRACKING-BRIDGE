# TRACKING BRIDGE 📦🌉

A modern, multi-carrier parcel tracking system with automatic courier detection, status normalization, and interactive checkpoint timelines.

---

## 🌟 Key Features

- **Multi-Carrier Auto-Detection**: Intelligently identifies couriers (DPD, UPS, DHL Express, FedEx, Royal Mail, USPS) directly from tracking number patterns.
- **Universal Status Normalization**: Converts disparate courier status events into standardized milestones:
  - `Shipment Created` ➔ `Collected` ➔ `In Transit` ➔ `Out for Delivery` ➔ `Delivered`
- **Interactive Checkpoint Timeline**: Chronological event history detailing timestamps, locations, carrier-specific descriptions, and visual progress steppers.
- **Preloaded Reference Data**: Includes the reference international consignment (`AWB: 15504338529265`, Nepal ➔ UK via DPD) with 8+ full milestone checkpoints.
- **Public Customer Portal**: Dedicated lookup page for end-customers to track packages by AWB or Tracking Number.
- **Batch CSV Import & Export**: Bulk shipment onboarding via CSV text input and export capabilities.
- **Zero External Dependencies**: Powered by Python 3 standard library and SQLite3.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ (No external pip dependencies required)

### Running the Application

```bash
python3 server.py
```

Open your browser and navigate to:
```
http://localhost:8080
```

---

## 📁 Project Structure

```text
TRACKING-BRIDGE/
├── server.py              # Main HTTP server & RESTful API endpoints
├── database.py            # SQLite schema, tables, and seed data
├── carrier_service.py     # Courier auto-detection & 17TRACK adapter
├── public/                # Frontend application
│   ├── index.html         # Responsive dashboard & customer portal
│   ├── style.css          # Modern dark-slate design system
│   └── app.js             # Client logic, filters, modals, batch import
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shipments` | List shipments with search & filter params (`q`, `carrier`, `status`) |
| `GET` | `/api/shipments/:id` | Fetch single shipment with full chronological checkpoints |
| `GET` | `/api/track?awb=:awb` | Public tracking lookup by AWB or Tracking Number |
| `POST` | `/api/shipments` | Register a new shipment with auto-detection |
| `POST` | `/api/shipments/:id/advance` | Advance status to next milestone (testing/demo) |
| `POST` | `/api/shipments/batch` | Bulk import shipments from CSV/JSON |
| `POST` | `/api/detect-carrier` | Test courier detection on a tracking number |
| `DELETE` | `/api/shipments/:id` | Remove a shipment record |
