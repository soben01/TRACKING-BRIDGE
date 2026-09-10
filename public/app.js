// ==========================================================================
// TRACKING BRIDGE — CLIENT APPLICATION LOGIC
// ==========================================================================

let currentFilter = {
  search: '',
  carrier: 'all',
  status: 'all'
};

let currentActiveShipment = null;
let carrierDetectTimer = null;

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
// API CALLS & DATA FETCHING
// --------------------------------------------------------------------------

async function loadShipments() {
  const grid = document.getElementById('shipmentsGrid');
  const emptyState = document.getElementById('emptyState');

  try {
    const params = new URLSearchParams();
    if (currentFilter.search) params.append('q', currentFilter.search);
    if (currentFilter.carrier && currentFilter.carrier !== 'all') params.append('carrier', currentFilter.carrier);
    if (currentFilter.status && currentFilter.status !== 'all') params.append('status', currentFilter.status);

    const res = await fetch(`/api/shipments?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load shipments');
    const data = await res.json();

    // Update stats
    updateStats(data.stats);

    // Render cards
    grid.innerHTML = '';
    if (data.shipments && data.shipments.length > 0) {
      emptyState.style.display = 'none';
      data.shipments.forEach(s => {
        grid.appendChild(createShipmentCard(s));
      });
    } else {
      emptyState.style.display = 'block';
    }
  } catch (err) {
    console.error('Error fetching shipments:', err);
    showToast('Failed to load shipments from server');
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

  // Calculate milestone percentage
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
    const res = await fetch(`/api/shipments/${shipmentId}`);
    if (!res.ok) throw new Error('Shipment not found');
    const data = await res.json();
    renderTimelineModal(data);
  } catch (err) {
    showToast('Failed to retrieve shipment details');
  }
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
  const activeIdx = data.milestone_index !== undefined ? data.milestone_index : 0;

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
    const res = await fetch(`/api/track?awb=${encodeURIComponent(query)}`);
    if (!res.ok) {
      showToast(`No shipment found matching '${query}'`);
      return;
    }
    const data = await res.json();
    renderTimelineModal(data);
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
    const res = await fetch(`/api/track?awb=${encodeURIComponent(query)}`);
    if (!res.ok) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5rem; border-radius: 12px; text-align: center; color: #F87171;">
          <h3>Shipment Not Found</h3>
          <p style="margin-top: 0.5rem; font-size: 0.9rem;">We couldn't locate any consignment with tracking/AWB: <strong>${escapeHtml(query)}</strong></p>
        </div>
      `;
      return;
    }
    const data = await res.json();
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
      const data = await res.json();
      if (data.detected && data.detected.code !== 'generic') {
        nameSpan.textContent = data.detected.name;
        pill.style.display = 'inline-block';
      } else {
        pill.style.display = 'none';
      }
    } catch (e) {
      pill.style.display = 'none';
    }
  }, 300);
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

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create shipment');
    }

    const created = await res.json();
    showToast(`Shipment ${created.shipment_code} created (${created.carrier_detected})!`);
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
    const res = await fetch(`/api/shipments/${shipmentId}/advance`, { method: 'POST' });
    if (!res.ok) throw new Error('Could not advance shipment');
    const data = await res.json();
    showToast(data.message);
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
    const res = await fetch(`/api/shipments/${shipmentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Could not delete');
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
    const res = await fetch('/api/shipments/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const result = await res.json();
    showToast(result.message);
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
    const res = await fetch('/api/shipments');
    const data = await res.json();
    const rows = [
      ['ID', 'AWB Number', 'Tracking Number', 'Customer Name', 'Carrier', 'Status', 'Origin', 'Destination', 'Current Location', 'Last Updated']
    ];

    data.shipments.forEach(s => {
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
