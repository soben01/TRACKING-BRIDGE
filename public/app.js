// ==========================================================================
// TRACKING BRIDGE — CLIENT APPLICATION LOGIC
// Dual-Mode: Live Server API with Resilient Client-Side Cloudflare Fallback
// ==========================================================================

let currentFilter = {
  search: '',
  carrier: 'all',
  status: 'all'
};

let currentActiveShipment = null;
let carrierDetectTimer = null;
let isOfflineMode = false;

// Default Seed Shipments for Cloudflare Pages / Static Hosting
const SEED_SHIPMENTS = [
  {
    id: 1,
    shipment_code: "SHIP-0001",
    awb_number: "15504338529265",
    tracking_number: "15504338529265",
    customer_name: "ASMITA SUNAR",
    origin: "Nepal",
    destination: "United Kingdom",
    carrier_name: "DPD (UK)",
    carrier_code: "dpd-uk",
    current_status: "Delivered",
    current_location: "Residential Address, London, UK",
    estimated_delivery: "2026-08-26 14:30:00",
    delivered_at: "2026-08-26 14:26:00",
    created_at: "2026-08-21 08:17:00",
    updated_at: "2026-08-26 14:26:00",
    events: [
      { id: 9, event_time: "2026-08-26 14:26", status: "Delivered", carrier_status: "Delivered - Signed", location: "Residential Address, London, UK", description: "Your parcel has been delivered successfully. Signed for by: ASMITA." },
      { id: 8, event_time: "2026-08-26 08:54", status: "Out for Delivery", carrier_status: "Out for Delivery", location: "London South Delivery Route, UK", description: "Your parcel will be delivered with you today by driver Dave between 13:30 and 14:30." },
      { id: 7, event_time: "2026-08-26 08:03", status: "At Depot", carrier_status: "At Depot Sorted", location: "London South Depot, UK", description: "Your parcel is at our local depot and staged for final vehicle loading." },
      { id: 6, event_time: "2026-08-26 00:52", status: "At Depot", carrier_status: "Arrived at Depot", location: "London Central Hub, UK", description: "We have your parcel and it is on its way to your local delivery depot." },
      { id: 5, event_time: "2026-08-25 18:40", status: "Arrived Destination", carrier_status: "Arrived in United Kingdom", location: "Heathrow Airport (LHR), London", description: "Consignment arrived at London air hub. Inbound customs release approved." },
      { id: 4, event_time: "2026-08-24 02:10", status: "Flight Dispatched", carrier_status: "Flight Assigned & Departed", location: "Tribhuvan Intl Airport (KTM)", description: "Dispatched on connecting cargo flight BA-142 to London Heathrow." },
      { id: 3, event_time: "2026-08-23 15:45", status: "Customs Clearance", carrier_status: "Customs Clearance Completed", location: "Tribhuvan International Hub, Nepal", description: "Customs declarations cleared. Approved for international export flight." },
      { id: 2, event_time: "2026-08-22 11:30", status: "Collected", carrier_status: "Picked Up", location: "Kathmandu Export Depot, Nepal", description: "Parcel collected from merchant warehouse and weighed." },
      { id: 1, event_time: "2026-08-21 08:17", status: "Shipment Created", carrier_status: "Order Information Received", location: "Kathmandu, Nepal", description: "Sender has provided electronic shipping documentation to DPD gateway." }
    ]
  },
  {
    id: 2,
    shipment_code: "SHIP-0002",
    awb_number: "1ZRJ70256812472852",
    tracking_number: "1ZRJ70256812472852",
    customer_name: "JOHN SMITH",
    origin: "Netherlands",
    destination: "Germany",
    carrier_name: "UPS",
    carrier_code: "ups",
    current_status: "In Transit",
    current_location: "Düsseldorf Sorting Hub, Germany",
    estimated_delivery: "2026-09-12 18:00:00",
    delivered_at: null,
    created_at: "2026-09-08 09:30:00",
    updated_at: "2026-09-10 11:20:00",
    events: [
      { id: 4, event_time: "2026-09-10 11:20", status: "In Transit", carrier_status: "Location Scan", location: "Düsseldorf Sorting Hub, Germany", description: "Package scanned at transit destination hub." },
      { id: 3, event_time: "2026-09-09 04:30", status: "Flight Dispatched", carrier_status: "Departure Scan", location: "Utrecht Ground Terminal, Netherlands", description: "Package departed origin facility en route to international hub." },
      { id: 2, event_time: "2026-09-08 17:15", status: "Collected", carrier_status: "Origin Scan", location: "Amsterdam Sorting Center, Netherlands", description: "Package arrived at UPS facility." },
      { id: 1, event_time: "2026-09-08 09:30", status: "Shipment Created", carrier_status: "Label Created", location: "Amsterdam, Netherlands", description: "Shipper created a label, UPS has not received the package yet." }
    ]
  },
  {
    id: 3,
    shipment_code: "SHIP-0003",
    awb_number: "DHL9823412091",
    tracking_number: "9823412091",
    customer_name: "EMMA WATSON",
    origin: "Japan",
    destination: "United States",
    carrier_name: "DHL Express",
    carrier_code: "dhl",
    current_status: "Out for Delivery",
    current_location: "Los Angeles Delivery Depot, CA, USA",
    estimated_delivery: "2026-09-10 17:00:00",
    delivered_at: null,
    created_at: "2026-09-07 10:00:00",
    updated_at: "2026-09-10 08:15:00",
    events: [
      { id: 6, event_time: "2026-09-10 08:15", status: "Out for Delivery", carrier_status: "With Delivery Courier", location: "Los Angeles, CA, USA", description: "Courier is en route to customer destination." },
      { id: 5, event_time: "2026-09-10 03:40", status: "At Depot", carrier_status: "Arrived at DHL Delivery Facility", location: "Los Angeles Facility, CA, USA", description: "Processed for courier vehicle loading." },
      { id: 4, event_time: "2026-09-09 14:20", status: "Customs Clearance", carrier_status: "Clearance Processing Complete", location: "Los Angeles Gateway (LAX), USA", description: "Customs cleared at port of entry." },
      { id: 3, event_time: "2026-09-08 22:15", status: "Flight Dispatched", carrier_status: "Departed Facility in Tokyo", location: "Tokyo Narita Airport (NRT)", description: "Transpacific cargo flight en route to Los Angeles." },
      { id: 2, event_time: "2026-09-07 16:45", status: "Collected", carrier_status: "Shipment Picked Up", location: "Narita Gateway, Japan", description: "Consignment picked up by DHL courier." },
      { id: 1, event_time: "2026-09-07 10:00", status: "Shipment Created", carrier_status: "Shipment Information Received", location: "Tokyo, Japan", description: "Digital shipment record generated." }
    ]
  },
  {
    id: 4,
    shipment_code: "SHIP-0004",
    awb_number: "FDX77391823091",
    tracking_number: "773918230912",
    customer_name: "CARLOS MENDEZ",
    origin: "Singapore",
    destination: "Australia",
    carrier_name: "FedEx",
    carrier_code: "fedex",
    current_status: "Shipment Created",
    current_location: "Singapore Changi Station",
    estimated_delivery: "2026-09-15 16:00:00",
    delivered_at: null,
    created_at: "2026-09-10 09:10:00",
    updated_at: "2026-09-10 09:10:00",
    events: [
      { id: 1, event_time: "2026-09-10 09:10", status: "Shipment Created", carrier_status: "Shipment Information Sent to FedEx", location: "Singapore Changi Station", description: "Shipping details electronically submitted." }
    ]
  },
  {
    id: 6,
    shipment_code: "SHIP-0005",
    awb_number: "12345",
    tracking_number: "1ZRJ70256834680363",
    customer_name: "Sobin Upreti",
    origin: "Nepal",
    destination: "United States",
    carrier_name: "UPS",
    carrier_code: "ups",
    current_status: "Shipment Created",
    current_location: "Netherlands",
    estimated_delivery: "Available when UPS receives package",
    delivered_at: null,
    created_at: "2026-09-08 12:09:00",
    updated_at: "2026-09-08 12:09:00",
    events: [
      { id: 1, event_time: "2026-09-08 12:09", status: "Shipment Created", carrier_status: "Label Created", location: "Netherlands", description: "Shipper created a label, UPS has not received the package yet." }
    ]
  }
];

// Local Storage Helper
function getLocalShipments() {
  const stored = localStorage.getItem('tb_shipments');
  if (!stored) {
    localStorage.setItem('tb_shipments', JSON.stringify(SEED_SHIPMENTS));
    return SEED_SHIPMENTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return SEED_SHIPMENTS;
  }
}

function saveLocalShipments(list) {
  localStorage.setItem('tb_shipments', JSON.stringify(list));
}

// Client-side Carrier Auto-Detection
function clientDetectCarrier(trackingNumber) {
  const clean = String(trackingNumber).trim().toUpperCase().replace(/[\s-]/g, '');
  if (/^1Z[0-9A-Z]{16}$/.test(clean)) return { code: 'ups', name: 'UPS' };
  if (/^\d{10}$/.test(clean) || clean.startsWith('DHL') || clean.startsWith('JJD')) return { code: 'dhl', name: 'DHL Express' };
  if (/^\d{14}$/.test(clean) || (clean.startsWith('155') && clean.length === 14) || (/^\d{12}$/.test(clean) && clean.startsWith('0'))) return { code: 'dpd-uk', name: 'DPD (UK)' };
  if (/^\d{12}$|^\d{15}$|^\d{20}$|^\d{22}$/.test(clean) || clean.startsWith('FDX')) return { code: 'fedex', name: 'FedEx' };
  if (/^[A-Z]{2}\d{9}GB$/.test(clean)) return { code: 'royal-mail', name: 'Royal Mail' };
  if (/^(94|92|93)\d{20}$/.test(clean) || /^[A-Z]{2}\d{9}US$/.test(clean)) return { code: 'usps', name: 'USPS' };
  return { code: 'generic', name: 'International Courier' };
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadShipments();

  // Check URL parameters for direct tracking link e.g. ?awb=15504338529265
  const urlParams = new URLSearchParams(window.location.search);
  const directAwb = urlParams.get('awb') || urlParams.get('track');
  if (directAwb) {
    lookupAndOpen(directAwb);
  }
});

// Switch Views (Dashboard vs Public Portal)
function switchView(viewName) {
  const dashView = document.getElementById('dashboardView');
  const portalView = document.getElementById('portalView');
  const dashBtn = document.getElementById('tabDashboardBtn');
  const portalBtn = document.getElementById('tabPortalBtn');

  if (viewName === 'portal') {
    dashView.style.display = 'none';
    portalView.style.display = 'block';
    dashBtn.classList.remove('active');
    portalBtn.classList.add('active');
  } else {
    portalView.style.display = 'none';
    dashView.style.display = 'block';
    portalBtn.classList.remove('active');
    dashBtn.classList.add('active');
  }
}

// --------------------------------------------------------------------------
// DATA FETCHING (SERVER API WITH LOCAL FALLBACK)
// --------------------------------------------------------------------------

async function loadShipments() {
  const grid = document.getElementById('shipmentsGrid');
  const emptyState = document.getElementById('emptyState');

  try {
    const params = new URLSearchParams();
    if (currentFilter.search) params.append('q', currentFilter.search);
    if (currentFilter.carrier && currentFilter.carrier !== 'all') params.append('carrier', currentFilter.carrier);
    if (currentFilter.status && currentFilter.status !== 'all') params.append('status', currentFilter.status);

    let shipments = [];
    let stats = null;

    try {
      const res = await fetch(`/api/shipments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        shipments = data.shipments || [];
        stats = data.stats;
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (apiErr) {
      // Offline/Cloudflare fallback
      isOfflineMode = true;
      const all = getLocalShipments();
      const q = currentFilter.search.toLowerCase();
      const cf = currentFilter.carrier;
      const sf = currentFilter.status.toLowerCase();

      shipments = all.filter(s => {
        const matchesQ = !q || (
          (s.awb_number && s.awb_number.toLowerCase().includes(q)) ||
          (s.tracking_number && s.tracking_number.toLowerCase().includes(q)) ||
          (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
          (s.carrier_name && s.carrier_name.toLowerCase().includes(q)) ||
          (s.origin && s.origin.toLowerCase().includes(q)) ||
          (s.destination && s.destination.toLowerCase().includes(q))
        );
        const matchesC = (cf === 'all' || s.carrier_code === cf);
        const matchesS = (sf === 'all' || (s.current_status && s.current_status.toLowerCase() === sf));
        return matchesQ && matchesC && matchesS;
      });

      stats = {
        total: all.length,
        delivered: all.filter(s => String(s.current_status).toLowerCase().includes('deliver')).length,
        out_for_delivery: all.filter(s => String(s.current_status).toLowerCase().includes('out for delivery')).length,
        in_transit: all.filter(s => ['in transit', 'customs clearance', 'flight dispatched', 'at depot', 'collected'].includes(String(s.current_status).toLowerCase())).length,
        created: all.filter(s => String(s.current_status).toLowerCase().includes('created')).length
      };
    }

    updateStats(stats);

    // Render cards
    grid.innerHTML = '';
    if (shipments.length > 0) {
      emptyState.style.display = 'none';
      shipments.forEach(s => {
        grid.appendChild(createShipmentCard(s));
      });
    } else {
      emptyState.style.display = 'block';
    }
  } catch (err) {
    console.error('Error in loadShipments:', err);
    showToast('Failed to load shipments');
  }
}

function updateStats(stats) {
  if (!stats) return;
  document.getElementById('statTotal').textContent = stats.total || 0;
  document.getElementById('statTransit').textContent = stats.in_transit || 0;
  document.getElementById('statOut').textContent = stats.out_for_delivery || 0;
  document.getElementById('statDelivered').textContent = stats.delivered || 0;
}

// --------------------------------------------------------------------------
// CARD RENDERING
// --------------------------------------------------------------------------

function createShipmentCard(s) {
  const card = document.createElement('div');
  card.className = 'shipment-card';

  const carrierClass = `carrier-${s.carrier_code || 'generic'}`;
  const statusClass = getStatusClass(s.current_status);
  const initial = s.customer_name ? s.customer_name.charAt(0).toUpperCase() : 'S';
  const progressPercent = calculateProgress(s.current_status);

  card.innerHTML = `
    <div>
      <div class="card-header-row">
        <span class="carrier-badge ${carrierClass}">${escapeHtml(s.carrier_name)}</span>
        <span class="status-badge ${statusClass}">${escapeHtml(s.current_status)}</span>
      </div>

      <div class="card-customer-row">
        <div class="avatar-initial">${initial}</div>
        <div class="customer-meta">
          <span class="customer-name">${escapeHtml(s.customer_name)}</span>
          <span class="tracking-awb-sub">
            AWB: ${escapeHtml(s.awb_number)}
            <button class="copy-mini-btn" onclick="copyText('${escapeHtml(s.awb_number)}')" title="Copy AWB">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </span>
        </div>
      </div>

      <div class="card-route-strip">
        <div class="route-endpoint">
          <span class="route-tag">Origin</span>
          <span class="route-place">${escapeHtml(s.origin)}</span>
        </div>
        <div class="route-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
        <div class="route-endpoint" style="text-align: right;">
          <span class="route-tag">Destination</span>
          <span class="route-place">${escapeHtml(s.destination)}</span>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="milestone-track">
          <div class="milestone-line-bg"></div>
          <div class="milestone-line-fill" style="width: ${progressPercent}%;"></div>
          <div class="milestone-dot completed"></div>
          <div class="milestone-dot ${progressPercent >= 25 ? 'completed' : ''}"></div>
          <div class="milestone-dot ${progressPercent >= 50 ? 'completed' : ''}"></div>
          <div class="milestone-dot ${progressPercent >= 75 ? 'completed' : ''}"></div>
          <div class="milestone-dot ${progressPercent >= 100 ? 'completed' : ''}"></div>
        </div>
        <div class="milestone-labels">
          <span>Created</span>
          <span>Picked Up</span>
          <span>Transit</span>
          <span>Out</span>
          <span>Delivered</span>
        </div>
      </div>

      <div class="latest-location-box">
        <svg class="location-pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>${escapeHtml(s.current_location || 'Transit Hub')}</span>
      </div>
    </div>

    <div class="card-actions-row">
      <button class="btn btn-sm card-btn-view" onclick="openShipmentDetails(${s.id})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        View Timeline Details
      </button>
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <button class="btn btn-sm card-btn-advance" onclick="advanceStatus(${s.id})" title="Simulate advancing to next checkpoint stage">
          ⚡ Advance
        </button>
        <button class="btn-icon-danger" onclick="deleteShipment(${s.id})" title="Delete shipment">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  `;

  return card;
}

function calculateProgress(status) {
  const s = String(status).toLowerCase();
  if (s.includes('deliver') || s.includes('signed')) return 100;
  if (s.includes('out for delivery')) return 75;
  if (s.includes('transit') || s.includes('depot') || s.includes('custom') || s.includes('flight')) return 50;
  if (s.includes('collect') || s.includes('picked')) return 25;
  return 5;
}

function getStatusClass(status) {
  const s = String(status).toLowerCase();
  if (s.includes('deliver')) return 'status-delivered';
  if (s.includes('out for delivery')) return 'status-out';
  if (s.includes('transit') || s.includes('depot') || s.includes('flight') || s.includes('custom') || s.includes('collect')) return 'status-transit';
  if (s.includes('create')) return 'status-created';
  if (s.includes('exception')) return 'status-exception';
  return 'status-transit';
}

// --------------------------------------------------------------------------
// DETAILED MODAL TIMELINE
// --------------------------------------------------------------------------

async function openShipmentDetails(shipmentId) {
  try {
    let data = null;
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error('Non-200');
      }
    } catch (e) {
      const all = getLocalShipments();
      const s = all.find(x => x.id === Number(shipmentId) || x.shipment_code === shipmentId);
      if (s) {
        data = {
          shipment: s,
          events: s.events || [],
          milestone_index: getMilestoneIndex(s.current_status)
        };
      }
    }

    if (data) {
      renderTimelineModal(data);
    } else {
      showToast('Shipment not found');
    }
  } catch (err) {
    showToast('Failed to retrieve shipment details');
  }
}

function getMilestoneIndex(status) {
  const s = String(status).toLowerCase();
  if (s.includes('deliver')) return 4;
  if (s.includes('out for delivery')) return 3;
  if (s.includes('transit') || s.includes('depot') || s.includes('custom') || s.includes('flight')) return 2;
  if (s.includes('collect')) return 1;
  return 0;
}

function renderTimelineModal(data) {
  const s = data.shipment;
  const events = data.events || [];
  currentActiveShipment = s;

  // Header info
  const carrierBadge = document.getElementById('modalCarrierBadge');
  carrierBadge.textContent = s.carrier_name;
  carrierBadge.className = `carrier-badge carrier-${s.carrier_code || 'generic'}`;

  document.getElementById('modalAwbTitle').textContent = s.awb_number;
  
  const statusBadge = document.getElementById('modalStatusBadge');
  statusBadge.textContent = s.current_status;
  statusBadge.className = `status-badge ${getStatusClass(s.current_status)}`;

  // Summary Grid
  document.getElementById('modalCustomerName').textContent = s.customer_name;
  document.getElementById('modalCarrierName').textContent = s.carrier_name;
  document.getElementById('modalAwbNumber').textContent = s.awb_number;
  document.getElementById('modalTrackingNumber').textContent = s.tracking_number;
  document.getElementById('modalOrigin').textContent = s.origin;
  document.getElementById('modalDestination').textContent = s.destination;
  document.getElementById('modalDeliveryDate').textContent = s.delivered_at || s.estimated_delivery || 'In Transit';
  document.getElementById('modalShipmentCode').textContent = s.shipment_code || `SHIP-${s.id}`;

  // Stepper
  const stepper = document.getElementById('modalMilestoneStepper');
  stepper.innerHTML = '';
  const milestones = ['Shipment Created', 'Collected', 'In Transit', 'Out for Delivery', 'Delivered'];
  const activeIdx = data.milestone_index !== undefined ? data.milestone_index : getMilestoneIndex(s.current_status);

  milestones.forEach((m, idx) => {
    const item = document.createElement('div');
    const isCompleted = idx <= activeIdx;
    const isActive = idx === activeIdx;

    item.className = `stepper-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`;
    item.innerHTML = `
      <div class="stepper-circle">
        ${isCompleted ? '✓' : (idx + 1)}
      </div>
      <span class="stepper-label">${m}</span>
    `;
    stepper.appendChild(item);
  });

  // Timeline Event Stream
  const stream = document.getElementById('modalTimelineStream');
  stream.innerHTML = '';
  document.getElementById('modalEventCount').textContent = `${events.length} Checkpoints`;

  events.forEach((ev, idx) => {
    const evCard = document.createElement('div');
    const isLatest = idx === 0;
    const isDelivered = ev.status === 'Delivered';

    evCard.className = `timeline-event-card ${isLatest ? 'event-latest' : ''} ${isDelivered ? 'event-delivered' : ''}`;
    evCard.innerHTML = `
      <div class="timeline-dot-pin"></div>
      <div class="event-time-row">
        <span class="event-timestamp">${escapeHtml(ev.event_time)}</span>
        <span class="event-location-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${escapeHtml(ev.location)}
        </span>
      </div>
      <div class="event-status-title">${escapeHtml(ev.status)} • <span style="font-weight: 500; font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(ev.carrier_status)}</span></div>
      <p class="event-description">${escapeHtml(ev.description)}</p>
    `;
    stream.appendChild(evCard);
  });

  openModal('timelineModal');
}

// --------------------------------------------------------------------------
// QUICK SEARCH & PORTAL
// --------------------------------------------------------------------------

async function handleQuickTrack(event) {
  event.preventDefault();
  const input = document.getElementById('quickSearchInput');
  const query = input.value.trim();
  if (!query) return;

  await lookupAndOpen(query);
}

function quickSample(awb) {
  document.getElementById('quickSearchInput').value = awb;
  lookupAndOpen(awb);
}

async function lookupAndOpen(query) {
  try {
    let data = null;
    try {
      const res = await fetch(`/api/track?awb=${encodeURIComponent(query)}`);
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error('Non-200');
      }
    } catch (e) {
      const all = getLocalShipments();
      const q = query.toLowerCase();
      const s = all.find(x =>
        (x.awb_number && x.awb_number.toLowerCase() === q) ||
        (x.tracking_number && x.tracking_number.toLowerCase() === q) ||
        (x.shipment_code && x.shipment_code.toLowerCase() === q)
      );
      if (s) {
        data = {
          shipment: s,
          events: s.events || [],
          milestone_index: getMilestoneIndex(s.current_status)
        };
      }
    }

    if (data) {
      renderTimelineModal(data);
    } else {
      showToast(`No shipment found matching '${query}'`);
    }
  } catch (err) {
    showToast('Lookup error: ' + err.message);
  }
}

async function handlePortalTrack(event) {
  event.preventDefault();
  const input = document.getElementById('portalInput');
  const resultBox = document.getElementById('portalResultContainer');
  const query = input.value.trim();
  if (!query) return;

  try {
    let data = null;
    try {
      const res = await fetch(`/api/track?awb=${encodeURIComponent(query)}`);
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error('Non-200');
      }
    } catch (e) {
      const all = getLocalShipments();
      const q = query.toLowerCase();
      const s = all.find(x =>
        (x.awb_number && x.awb_number.toLowerCase() === q) ||
        (x.tracking_number && x.tracking_number.toLowerCase() === q) ||
        (x.shipment_code && x.shipment_code.toLowerCase() === q)
      );
      if (s) {
        data = {
          shipment: s,
          events: s.events || [],
          milestone_index: getMilestoneIndex(s.current_status)
        };
      }
    }

    if (!data) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5rem; border-radius: 12px; text-align: center; color: #F87171;">
          <h3>Shipment Not Found</h3>
          <p style="margin-top: 0.5rem; font-size: 0.9rem;">We couldn't locate any consignment with tracking/AWB: <strong>${escapeHtml(query)}</strong></p>
        </div>
      `;
      return;
    }

    const s = data.shipment;
    const events = data.events || [];

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-card); border-radius: 16px; padding: 1.5rem; margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <span class="carrier-badge carrier-${s.carrier_code || 'generic'}">${escapeHtml(s.carrier_name)}</span>
          <span class="status-badge ${getStatusClass(s.current_status)}">${escapeHtml(s.current_status)}</span>
        </div>
        <h3 style="font-size: 1.3rem; margin-bottom: 0.3rem;">${escapeHtml(s.customer_name)}</h3>
        <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-accent); margin-bottom: 1rem;">AWB: ${escapeHtml(s.awb_number)}</p>
        <div style="display: flex; justify-content: space-between; background: var(--bg-card); padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <span><strong>From:</strong> ${escapeHtml(s.origin)}</span>
          <span>➔</span>
          <span><strong>To:</strong> ${escapeHtml(s.destination)}</span>
        </div>
        <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem;">Latest Checkpoints:</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${events.slice(0, 4).map(e => `
            <div style="background: var(--bg-card); padding: 0.75rem 1rem; border-radius: 8px; border-left: 3px solid #38BDF8;">
              <div style="font-size: 0.75rem; color: var(--text-accent); font-family: var(--font-mono);">${escapeHtml(e.event_time)} • ${escapeHtml(e.location)}</div>
              <div style="font-weight: 600; font-size: 0.9rem; margin-top: 2px;">${escapeHtml(e.status)}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${escapeHtml(e.description)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    showToast('Failed to track shipment in portal');
  }
}

// --------------------------------------------------------------------------
// ADD SHIPMENT & AUTO-DETECTION
// --------------------------------------------------------------------------

function handleTrackingNumberInput(val) {
  clearTimeout(carrierDetectTimer);
  const pill = document.getElementById('detectedCarrierPill');
  const nameSpan = document.getElementById('detectedCarrierName');

  if (!val || val.trim().length < 4) {
    pill.style.display = 'none';
    return;
  }

  carrierDetectTimer = setTimeout(async () => {
    try {
      const res = await fetch('/api/detect-carrier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: val })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.detected && data.detected.code !== 'generic') {
          nameSpan.textContent = data.detected.name;
          pill.style.display = 'inline-block';
          return;
        }
      }
    } catch (e) {}

    // Fallback client detection
    const detected = clientDetectCarrier(val);
    if (detected.code !== 'generic') {
      nameSpan.textContent = detected.name;
      pill.style.display = 'inline-block';
    } else {
      pill.style.display = 'none';
    }
  }, 250);
}

async function handleCreateShipment(event) {
  event.preventDefault();
  const awb = document.getElementById('newAwb').value.trim();
  const tracking = document.getElementById('newTracking').value.trim() || awb;
  const customer = document.getElementById('newCustomer').value.trim();
  const origin = document.getElementById('newOrigin').value.trim() || 'Nepal';
  const destination = document.getElementById('newDestination').value.trim() || 'United Kingdom';
  const carrierCode = document.getElementById('newCarrierSelect').value;

  const btn = document.getElementById('saveShipmentBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    let saved = false;
    let createdShipment = null;

    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awb_number: awb,
          tracking_number: tracking,
          customer_name: customer,
          origin,
          destination,
          carrier_code: carrierCode
        })
      });
      if (res.ok) {
        createdShipment = await res.json();
        saved = true;
      }
    } catch (apiErr) {}

    if (!saved) {
      // Local fallback
      const all = getLocalShipments();
      const det = (carrierCode && carrierCode !== 'auto') ? { code: carrierCode, name: carrierCode.toUpperCase() } : clientDetectCarrier(tracking);
      const newId = Date.now();
      const code = `SHIP-${String(all.length + 1).padStart(4, '0')}`;
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

      const newShipment = {
        id: newId,
        shipment_code: code,
        awb_number: awb,
        tracking_number: tracking,
        customer_name: customer,
        origin,
        destination,
        carrier_name: det.name,
        carrier_code: det.code,
        current_status: 'Shipment Created',
        current_location: `${origin} Dispatch Facility`,
        estimated_delivery: 'In 3-5 business days',
        delivered_at: null,
        created_at: nowStr,
        updated_at: nowStr,
        events: [
          {
            id: 1,
            event_time: nowStr,
            status: 'Shipment Created',
            carrier_status: 'Order Information Received',
            location: `${origin} Dispatch Facility`,
            description: `Shipment registered electronically with ${det.name}.`
          }
        ]
      };

      all.unshift(newShipment);
      saveLocalShipments(all);
      createdShipment = { shipment_code: code, carrier_detected: det.name };
    }

    showToast(`Shipment ${createdShipment.shipment_code} registered!`);
    closeModal('addModal');
    event.target.reset();
    document.getElementById('detectedCarrierPill').style.display = 'none';
    loadShipments();
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Add & Start Tracking`;
  }
}

// --------------------------------------------------------------------------
// ADVANCE / DEMO STATE TRANSITION
// --------------------------------------------------------------------------

async function advanceStatus(shipmentId) {
  try {
    let advanced = false;
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/advance`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message);
        advanced = true;
      }
    } catch (e) {}

    if (!advanced) {
      // Local advance
      const all = getLocalShipments();
      const s = all.find(x => x.id === Number(shipmentId));
      if (s) {
        const flow = ['Shipment Created', 'Collected', 'In Transit', 'Out for Delivery', 'Delivered'];
        const curIdx = flow.indexOf(s.current_status);
        const nextStatus = flow[Math.min(curIdx + 1, flow.length - 1)] || 'Delivered';
        s.current_status = nextStatus;
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
        if (!s.events) s.events = [];
        s.events.unshift({
          id: Date.now(),
          event_time: nowStr,
          status: nextStatus,
          carrier_status: nextStatus,
          location: nextStatus === 'Delivered' ? `${s.destination} Recipient Address` : `${s.destination} Regional Hub`,
          description: `Shipment advanced to ${nextStatus}.`
        });
        if (nextStatus === 'Delivered') s.delivered_at = nowStr;
        saveLocalShipments(all);
        showToast(`Status advanced to ${nextStatus}`);
      }
    }

    loadShipments();
    if (currentActiveShipment && currentActiveShipment.id === shipmentId) {
      openShipmentDetails(shipmentId);
    }
  } catch (err) {
    showToast(err.message);
  }
}

async function deleteShipment(shipmentId) {
  if (!confirm('Are you sure you want to delete this shipment?')) return;
  try {
    let deleted = false;
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`, { method: 'DELETE' });
      if (res.ok) deleted = true;
    } catch (e) {}

    const all = getLocalShipments().filter(x => x.id !== Number(shipmentId));
    saveLocalShipments(all);

    showToast('Shipment removed');
    loadShipments();
  } catch (err) {
    showToast(err.message);
  }
}

// --------------------------------------------------------------------------
// BATCH IMPORT
// --------------------------------------------------------------------------

function loadSampleCsvData() {
  const sample = `15504338529265, 15504338529265, ASMITA SUNAR, Nepal, United Kingdom
1ZRJ70256812472852, 1ZRJ70256812472852, JOHN SMITH, Netherlands, Germany
DHL5592810234, 5592810234, SARAH CONNOR, Japan, United States
FDX9920148201, 992014820124, DAVID BECKHAM, Singapore, Australia`;
  document.getElementById('batchCsvInput').value = sample;
}

async function submitBatchImport() {
  const text = document.getElementById('batchCsvInput').value.trim();
  if (!text) {
    showToast('Please enter CSV data');
    return;
  }

  const lines = text.split('\n');
  const items = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const cols = trimmed.split(',').map(c => c.trim());
    if (cols.length >= 2) {
      items.push({
        awb: cols[0],
        tracking_number: cols[1] || cols[0],
        customer_name: cols[2] || 'Customer',
        origin: cols[3] || 'Origin',
        destination: cols[4] || 'Destination'
      });
    }
  }

  if (items.length === 0) {
    showToast('No valid rows found');
    return;
  }

  try {
    let imported = false;
    try {
      const res = await fetch('/api/shipments/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (res.ok) {
        const result = await res.json();
        showToast(result.message);
        imported = true;
      }
    } catch (e) {}

    if (!imported) {
      const all = getLocalShipments();
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
      items.forEach(it => {
        const det = clientDetectCarrier(it.tracking_number);
        all.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          shipment_code: `SHIP-${String(all.length + 1).padStart(4, '0')}`,
          awb_number: it.awb,
          tracking_number: it.tracking_number,
          customer_name: it.customer_name,
          origin: it.origin,
          destination: it.destination,
          carrier_name: det.name,
          carrier_code: det.code,
          current_status: 'Shipment Created',
          current_location: `${it.origin} Sorting Facility`,
          estimated_delivery: 'In 3-5 business days',
          created_at: nowStr,
          updated_at: nowStr,
          events: [{ id: 1, event_time: nowStr, status: 'Shipment Created', carrier_status: 'Order Placed', location: `${it.origin} Hub`, description: 'Shipment details imported.' }]
        });
      });
      saveLocalShipments(all);
      showToast(`Successfully imported ${items.length} shipments`);
    }

    closeModal('batchModal');
    document.getElementById('batchCsvInput').value = '';
    loadShipments();
  } catch (e) {
    showToast('Failed to import CSV');
  }
}

// --------------------------------------------------------------------------
// EXPORT CSV
// --------------------------------------------------------------------------

async function exportCSV() {
  try {
    let shipments = [];
    try {
      const res = await fetch('/api/shipments');
      if (res.ok) {
        const data = await res.json();
        shipments = data.shipments || [];
      }
    } catch (e) {}

    if (shipments.length === 0) {
      shipments = getLocalShipments();
    }

    const rows = [
      ['ID', 'AWB Number', 'Tracking Number', 'Customer Name', 'Carrier', 'Status', 'Origin', 'Destination', 'Current Location', 'Last Updated']
    ];

    shipments.forEach(s => {
      rows.push([
        s.shipment_code,
        s.awb_number,
        s.tracking_number,
        s.customer_name,
        s.carrier_name,
        s.current_status,
        s.origin,
        s.destination,
        s.current_location,
        s.updated_at
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tracking_bridge_shipments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Shipment export completed');
  } catch (e) {
    showToast('Failed to export CSV');
  }
}

// --------------------------------------------------------------------------
// FILTERS & SEARCH
// --------------------------------------------------------------------------

function handleFilterChange() {
  currentFilter.search = document.getElementById('filterSearch').value.trim();
  currentFilter.carrier = document.getElementById('carrierFilter').value;
  loadShipments();
}

function setStatusFilter(status, pillEl) {
  currentFilter.status = status;
  const pills = document.querySelectorAll('#statusPills .pill');
  pills.forEach(p => p.classList.remove('active'));
  pillEl.classList.add('active');
  loadShipments();
}

// --------------------------------------------------------------------------
// MODAL HELPERS & UTILITIES
// --------------------------------------------------------------------------

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

function closeModalOnBackdrop(e, id) {
  if (e.target.id === id) {
    closeModal(id);
  }
}

function openAddShipmentModal() {
  openModal('addModal');
}

function openBatchModal() {
  openModal('batchModal');
}

async function openSettingsModal() {
  openModal('settingsModal');
  const statusEl = document.getElementById('apiKeyStatusText');
  const inputEl = document.getElementById('track17ApiKeyInput');
  statusEl.textContent = 'Checking...';

  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.has_api_key) {
        statusEl.innerHTML = `🟢 Live 17TRACK Active (${data.api_key_masked})`;
        statusEl.style.color = '#10B981';
      } else {
        statusEl.innerHTML = '⚡ Simulated Mode (No API key set)';
        statusEl.style.color = '#F59E0B';
      }
    }
  } catch (e) {
    const localKey = localStorage.getItem('tb_17track_key') || '';
    if (localKey) {
      inputEl.value = localKey;
      statusEl.innerHTML = '🟢 Client-side 17TRACK Key Configured';
      statusEl.style.color = '#10B981';
    } else {
      statusEl.innerHTML = '⚡ Simulated Mode (No API key set)';
      statusEl.style.color = '#F59E0B';
    }
  }
}

async function saveApiKey() {
  const inputEl = document.getElementById('track17ApiKeyInput');
  const key = inputEl.value.trim();
  localStorage.setItem('tb_17track_key', key);

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track17_api_key: key })
    });
    if (res.ok) {
      showToast('17TRACK API key saved successfully!');
      closeModal('settingsModal');
      return;
    }
  } catch (e) {}

  showToast('17TRACK API key saved in browser!');
  closeModal('settingsModal');
}

async function syncActiveShipment() {
  if (!currentActiveShipment) return;
  const btn = event?.currentTarget;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Syncing...';
  }

  try {
    const res = await fetch(`/api/shipments/${currentActiveShipment.id}/sync`, { method: 'POST' });
    const data = await res.json();
    showToast(data.message);
    if (data.synced) {
      loadShipments();
      openShipmentDetails(currentActiveShipment.id);
    }
  } catch (e) {
    showToast('Sync request complete');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Sync Live Carrier`;
    }
  }
}

function copyPublicLink() {
  if (!currentActiveShipment) return;
  const url = `${window.location.origin}/?awb=${encodeURIComponent(currentActiveShipment.awb_number)}`;
  copyText(url);
  showToast('Public tracking URL copied to clipboard!');
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied: ${text}`);
  }).catch(() => {
    showToast(`Copied to clipboard`);
  });
}

function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
