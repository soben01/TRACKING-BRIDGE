// ==========================================================================
// TRACKING BRIDGE — STANDALONE CLOUDFLARE WORKER
// Multi-Carrier Parcel Tracking System
// ==========================================================================

const HTML_APP = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRACKING BRIDGE — Multi-Carrier Logistics & Parcel Tracking</title>
  <meta name="description" content="Unified multi-carrier parcel tracking system with automatic courier detection, normalized milestones, and comprehensive checkpoint history.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>/* ==========================================================================
   TRACKING BRIDGE — MODERN DESIGN SYSTEM & STYLESHEET
   ========================================================================== */

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Color Palette - Premium Slate & Indigo */
  --bg-main: #0B0F19;
  --bg-card: #111827;
  --bg-card-hover: #162032;
  --bg-surface: #1E293B;
  --bg-surface-light: #283548;
  
  --border-subtle: #1F2937;
  --border-card: #27354A;
  --border-accent: #3B82F6;

  --text-primary: #F9FAFB;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --text-accent: #38BDF8;

  --primary: #4F46E5;
  --primary-hover: #4338CA;
  --primary-glow: rgba(79, 70, 229, 0.35);

  --accent: #06B6D4;
  --accent-glow: rgba(6, 182, 212, 0.3);

  /* Status Colors */
  --status-delivered-bg: rgba(16, 185, 129, 0.15);
  --status-delivered-text: #34D399;
  --status-delivered-border: rgba(16, 185, 129, 0.3);

  --status-transit-bg: rgba(245, 158, 11, 0.15);
  --status-transit-text: #FBBF24;
  --status-transit-border: rgba(245, 158, 11, 0.3);

  --status-out-bg: rgba(14, 165, 233, 0.15);
  --status-out-text: #38BDF8;
  --status-out-border: rgba(14, 165, 233, 0.3);

  --status-created-bg: rgba(168, 85, 247, 0.15);
  --status-created-text: #C084FC;
  --status-created-border: rgba(168, 85, 247, 0.3);

  --status-exception-bg: rgba(239, 68, 68, 0.15);
  --status-exception-text: #F87171;
  --status-exception-border: rgba(239, 68, 68, 0.3);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(56, 189, 248, 0.2);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-main);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ==========================================================================
   NAVIGATION HEADER
   ========================================================================== */
.app-header {
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  text-decoration: none;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF;
  position: relative;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.pulse-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background-color: #10B981;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #FFF;
}

.text-accent {
  color: var(--text-accent);
}

.brand-subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.nav-tabs {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-surface);
  padding: 0.3rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.45rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab.active {
  background: var(--primary);
  color: #FFF;
  box-shadow: 0 2px 8px var(--primary-glow);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* ==========================================================================
   BUTTONS
   ========================================================================== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.55rem 1.1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
  color: #FFF;
  box-shadow: 0 4px 12px var(--primary-glow);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #4338CA 0%, #2563EB 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.45);
}

.btn-secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-card);
}

.btn-secondary:hover {
  background: var(--bg-surface-light);
  border-color: #475569;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.btn-text {
  background: none;
  border: none;
  color: var(--text-accent);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.2rem 0.4rem;
}

.btn-text:hover {
  color: #7DD3FC;
}

/* ==========================================================================
   HERO QUICK TRACK SECTION
   ========================================================================== */
.hero-section {
  background: radial-gradient(circle at 50% 0%, #1E293B 0%, #0B0F19 80%);
  padding: 3.5rem 1.5rem 2.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
}

.hero-content {
  max-width: 840px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: var(--text-accent);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  margin-bottom: 1.25rem;
  letter-spacing: 0.02em;
}

.hero-heading {
  font-size: 2.35rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #FFF;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.hero-subtext {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 660px;
  margin: 0 auto 2rem;
}

.search-box {
  max-width: 700px;
  margin: 0 auto 1.5rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-xl);
  padding: 0.45rem 0.55rem 0.45rem 1.25rem;
  box-shadow: var(--shadow-lg), 0 0 30px rgba(59, 130, 246, 0.1);
  transition: all 0.25s ease;
}

.search-input-wrapper:focus-within {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-lg), 0 0 25px rgba(56, 189, 248, 0.25);
}

.search-icon {
  color: var(--text-muted);
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  color: #FFF;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
}

.search-input-wrapper input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: #FFF;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-btn:hover {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  transform: translateY(-1px);
}

.quick-examples {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.example-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.example-pill {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid var(--border-card);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-family: var(--font-mono);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s ease;
}

.example-pill:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: #475569;
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.pill-dot.dpd { background-color: #EF4444; }
.pill-dot.ups { background-color: #F59E0B; }
.pill-dot.dhl { background-color: #EAB308; }

/* ==========================================================================
   MAIN CONTENT & STATS
   ========================================================================== */
.main-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #334155;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-total { background: rgba(99, 102, 241, 0.15); color: #818CF8; }
.icon-transit { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }
.icon-out { background: rgba(14, 165, 233, 0.15); color: #38BDF8; }
.icon-delivered { background: rgba(16, 185, 129, 0.15); color: #34D399; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #FFF;
  line-height: 1.1;
  margin-top: 0.25rem;
}

/* ==========================================================================
   TOOLBAR & FILTERS
   ========================================================================== */
.toolbar-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg);
  padding: 0.85rem 1.25rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  flex: 1;
}

.inline-search {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.4rem 0.75rem;
  gap: 0.5rem;
  min-width: 240px;
}

.inline-search svg {
  color: var(--text-muted);
}

.inline-search input {
  background: transparent;
  border: none;
  color: #FFF;
  font-size: 0.85rem;
  outline: none;
  width: 100%;
}

.status-pills {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.pill {
  background: var(--bg-surface);
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.35rem 0.8rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pill:hover {
  color: var(--text-primary);
  background: var(--bg-surface-light);
}

.pill.active {
  background: var(--primary);
  color: #FFF;
  border-color: rgba(255, 255, 255, 0.2);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.select-dropdown {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 0.85rem;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
}

.select-dropdown:focus {
  border-color: var(--border-accent);
}

/* ==========================================================================
   SHIPMENTS GRID & CARDS
   ========================================================================== */
.shipments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.shipment-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.shipment-card:hover {
  border-color: #3B82F6;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Card Header */
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.carrier-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Carrier Custom Badges */
.carrier-dpd-uk { background: rgba(220, 38, 38, 0.15); color: #EF4444; border: 1px solid rgba(220, 38, 38, 0.3); }
.carrier-ups { background: rgba(202, 138, 4, 0.15); color: #F59E0B; border: 1px solid rgba(202, 138, 4, 0.3); }
.carrier-dhl { background: rgba(234, 179, 8, 0.15); color: #FACC15; border: 1px solid rgba(234, 179, 8, 0.3); }
.carrier-fedex { background: rgba(124, 58, 237, 0.15); color: #A78BFA; border: 1px solid rgba(124, 58, 237, 0.3); }
.carrier-royal-mail { background: rgba(225, 29, 72, 0.15); color: #FB7185; border: 1px solid rgba(225, 29, 72, 0.3); }
.carrier-usps { background: rgba(37, 99, 235, 0.15); color: #60A5FA; border: 1px solid rgba(37, 99, 235, 0.3); }
.carrier-generic { background: rgba(107, 114, 128, 0.15); color: #9CA3AF; border: 1px solid rgba(107, 114, 128, 0.3); }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  border-radius: 9999px;
}

.status-delivered { background: var(--status-delivered-bg); color: var(--status-delivered-text); border: 1px solid var(--status-delivered-border); }
.status-transit { background: var(--status-transit-bg); color: var(--status-transit-text); border: 1px solid var(--status-transit-border); }
.status-out { background: var(--status-out-bg); color: var(--status-out-text); border: 1px solid var(--status-out-border); }
.status-created { background: var(--status-created-bg); color: var(--status-created-text); border: 1px solid var(--status-created-border); }
.status-exception { background: var(--status-exception-bg); color: var(--status-exception-text); border: 1px solid var(--status-exception-border); }

/* Card Body */
.card-customer-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.avatar-initial {
  width: 38px;
  height: 38px;
  background: var(--bg-surface);
  color: var(--text-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  border: 1px solid #334155;
  flex-shrink: 0;
}

.customer-meta {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #FFF;
}

.tracking-awb-sub {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.copy-mini-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  display: inline-flex;
}

.copy-mini-btn:hover {
  color: var(--text-accent);
}

/* Route Strip */
.card-route-strip {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.15rem;
}

.route-endpoint {
  display: flex;
  flex-direction: column;
}

.route-tag {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.route-place {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.route-arrow {
  color: var(--text-accent);
  display: flex;
  align-items: center;
}

/* Progress Step Bar */
.progress-bar-container {
  margin-bottom: 1.25rem;
}

.milestone-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 0.5rem;
}

.milestone-line-bg {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: #1E293B;
  transform: translateY(-50%);
  z-index: 1;
}

.milestone-line-fill {
  position: absolute;
  top: 50%;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #3B82F6, #10B981);
  transform: translateY(-50%);
  z-index: 2;
  transition: width 0.3s ease;
}

.milestone-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1E293B;
  border: 2px solid #475569;
  z-index: 3;
  position: relative;
  transition: all 0.2s ease;
}

.milestone-dot.completed {
  background: #10B981;
  border-color: #10B981;
}

.milestone-dot.current {
  background: #3B82F6;
  border-color: #60A5FA;
  box-shadow: 0 0 10px #3B82F6;
}

.milestone-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Latest Location Text */
.latest-location-box {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
  line-height: 1.35;
}

.location-pin-icon {
  color: #38BDF8;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Card Actions */
.card-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle);
  padding-top: 1rem;
}

.card-btn-view {
  background: rgba(59, 130, 246, 0.1);
  color: #60A5FA;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.card-btn-view:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93C5FD;
}

.card-btn-advance {
  background: rgba(16, 185, 129, 0.1);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 0.78rem;
  padding: 0.35rem 0.65rem;
}

.card-btn-advance:hover {
  background: rgba(16, 185, 129, 0.2);
}

.btn-icon-danger {
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
}

.btn-icon-danger:hover {
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

/* ==========================================================================
   EMPTY STATE
   ========================================================================== */
.empty-state {
  text-align: center;
  padding: 4rem 1.5rem;
  background: var(--bg-card);
  border: 1px dashed var(--border-card);
  border-radius: var(--radius-lg);
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #FFF;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

/* ==========================================================================
   PUBLIC PORTAL VIEW
   ========================================================================== */
.portal-wrapper {
  max-width: 760px;
  margin: 1.5rem auto;
}

.portal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.portal-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818CF8;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

.portal-card h2 {
  font-size: 1.85rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.portal-card p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.portal-search {
  display: flex;
  gap: 0.75rem;
  max-width: 540px;
  margin: 0 auto 2.5rem;
}

.portal-search input {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  padding: 0.75rem 1.15rem;
  border-radius: var(--radius-md);
  color: #FFF;
  font-size: 0.95rem;
  outline: none;
}

.portal-search input:focus {
  border-color: var(--border-accent);
}

.portal-result-container {
  text-align: left;
  animation: fadeIn 0.3s ease;
}

/* ==========================================================================
   MODAL WINDOWS & TIMELINE DRAWER
   ========================================================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: fadeIn 0.2s ease;
}

.modal-overlay.active {
  display: flex;
}

.modal-dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg), 0 0 50px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  animation: slideUp 0.25s ease;
}

.modal-dialog.modal-lg {
  max-width: 860px;
}

.modal-header {
  padding: 1.35rem 1.75rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header-info {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #FFF;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.modal-close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.75rem;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.modal-close-btn:hover {
  color: #FFF;
}

.modal-body {
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.75rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  background: rgba(17, 24, 39, 0.5);
}

/* ==========================================================================
   TIMELINE DETAIL MODAL CONTENTS
   ========================================================================== */
.shipment-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.75rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.2rem;
}

.summary-val {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.font-mono {
  font-family: var(--font-mono);
}

.text-success {
  color: #34D399;
}

.section-title {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

/* Stepper Box */
.milestone-stepper-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.75rem;
}

.milestone-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.stepper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.stepper-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.stepper-item.completed .stepper-circle {
  background: #10B981;
  border-color: #10B981;
  color: #FFF;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

.stepper-item.active .stepper-circle {
  background: #3B82F6;
  border-color: #60A5FA;
  color: #FFF;
  box-shadow: 0 0 14px rgba(59, 130, 246, 0.6);
  animation: pulse-ring 1.8s infinite;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.stepper-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-align: center;
}

.stepper-item.completed .stepper-label,
.stepper-item.active .stepper-label {
  color: var(--text-primary);
}

/* Timeline Stream */
.timeline-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.event-count-badge {
  font-size: 0.75rem;
  background: var(--bg-surface);
  color: var(--text-accent);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
}

.timeline-stream {
  position: relative;
  padding-left: 1.75rem;
}

.timeline-stream::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 6px;
  width: 2px;
  background: #27354A;
}

.timeline-event-card {
  position: relative;
  margin-bottom: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  padding: 1rem 1.15rem;
  transition: all 0.2s ease;
}

.timeline-event-card:hover {
  border-color: #475569;
  background: var(--bg-card-hover);
}

.timeline-event-card.event-latest {
  border-color: #38BDF8;
  background: rgba(56, 189, 248, 0.04);
}

.timeline-dot-pin {
  position: absolute;
  top: 14px;
  left: -1.75rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid #475569;
  transform: translateX(-4px);
  z-index: 2;
}

.event-latest .timeline-dot-pin {
  background: #38BDF8;
  border-color: #E0F2FE;
  box-shadow: 0 0 10px #38BDF8;
}

.timeline-event-card.event-delivered .timeline-dot-pin {
  background: #10B981;
  border-color: #D1FAE5;
  box-shadow: 0 0 10px #10B981;
}

.event-time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.event-timestamp {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-accent);
  font-weight: 600;
}

.event-location-pill {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.event-status-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: #FFF;
  margin-bottom: 0.25rem;
}

.event-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* ==========================================================================
   FORMS & INPUTS
   ========================================================================== */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.label-with-detection {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detected-carrier-pill {
  font-size: 0.75rem;
  background: rgba(56, 189, 248, 0.15);
  color: var(--text-accent);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  animation: fadeIn 0.2s ease;
}

.form-group input,
.batch-textarea {
  background: var(--bg-surface);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.95rem;
  color: #FFF;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.batch-textarea:focus {
  border-color: var(--border-accent);
}

.field-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.batch-hint-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface);
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  margin-bottom: 0.85rem;
}

.batch-textarea {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  resize: vertical;
}

/* ==========================================================================
   FOOTER
   ========================================================================== */
.app-footer {
  margin-top: auto;
  border-top: 1px solid var(--border-subtle);
  background: #080B12;
  padding: 1.5rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.footer-inner {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-carriers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.carrier-tag {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  color: var(--text-secondary);
  font-weight: 600;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1E293B;
  border: 1px solid var(--border-accent);
  color: #FFF;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 200;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.25s ease;
  pointer-events: none;
}

.toast-notification.show {
  opacity: 1;
  transform: translateY(0);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-heading {
    font-size: 1.75rem;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .nav-tabs {
    width: 100%;
    justify-content: center;
  }
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .shipments-grid {
    grid-template-columns: 1fr;
  }
}
</style>
</head>
<body>
  <div class="app-container">
    <!-- Navigation Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span class="pulse-indicator"></span>
          </div>
          <div class="brand-text">
            <span class="brand-title">TRACKING<span class="text-accent">BRIDGE</span></span>
            <span class="brand-subtitle">Multi-Carrier Logistics Hub</span>
          </div>
        </div>

        <nav class="nav-tabs">
          <button class="nav-tab active" id="tabDashboardBtn" onclick="switchView('dashboard')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </button>
          <button class="nav-tab" id="tabPortalBtn" onclick="switchView('portal')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Public Track Portal
          </button>
        </nav>

        <div class="header-actions">
          <button class="btn btn-secondary" onclick="openSettingsModal()" title="Carrier API Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            API Settings
          </button>
          <button class="btn btn-secondary" onclick="openBatchModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Import CSV
          </button>
          <button class="btn btn-primary" onclick="openAddShipmentModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Shipment
          </button>
        </div>
      </div>
    </header>

    <!-- Global Quick Track Hero Bar -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">⚡ Global Courier Auto-Detection Engine</div>
        <h1 class="hero-heading">Track Any AWB or Courier Parcel</h1>
        <p class="hero-subtext">Unified tracking across DPD, UPS, DHL, FedEx, Royal Mail, USPS, and 3,000+ carriers with standardized milestone progression.</p>
        
        <form class="search-box" onsubmit="handleQuickTrack(event)">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="quickSearchInput" 
              placeholder="Enter AWB Number or Tracking Number (e.g. 15504338529265)..."
              autocomplete="off"
            >
            <button type="submit" class="search-btn">
              Track Parcel
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </form>

        <!-- Quick pill links -->
        <div class="quick-examples">
          <span class="example-label">Quick samples:</span>
          <button class="example-pill" onclick="quickSample('15504338529265')">
            <span class="pill-dot dpd"></span> 15504338529265 (Asmita Sunar / DPD)
          </button>
          <button class="example-pill" onclick="quickSample('1ZRJ70256812472852')">
            <span class="pill-dot ups"></span> 1ZRJ70256812472852 (UPS)
          </button>
          <button class="example-pill" onclick="quickSample('9823412091')">
            <span class="pill-dot dhl"></span> 9823412091 (DHL Express)
          </button>
        </div>
      </div>
    </section>

    <!-- MAIN VIEW: DASHBOARD -->
    <main id="dashboardView" class="main-content">
      <!-- KPI Stats Row -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon icon-total">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Shipments</span>
            <span class="stat-value" id="statTotal">0</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-transit">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">In Transit</span>
            <span class="stat-value" id="statTransit">0</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-out">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Out for Delivery</span>
            <span class="stat-value" id="statOut">0</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-delivered">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Delivered</span>
            <span class="stat-value" id="statDelivered">0</span>
          </div>
        </div>
      </section>

      <!-- Dashboard Controls & Filters -->
      <section class="toolbar-section">
        <div class="filter-group">
          <div class="inline-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="filterSearch" placeholder="Filter by AWB, name, country..." oninput="handleFilterChange()">
          </div>

          <div class="status-pills" id="statusPills">
            <button class="pill active" data-status="all" onclick="setStatusFilter('all', this)">All</button>
            <button class="pill" data-status="Delivered" onclick="setStatusFilter('Delivered', this)">Delivered</button>
            <button class="pill" data-status="Out for Delivery" onclick="setStatusFilter('Out for Delivery', this)">Out for Delivery</button>
            <button class="pill" data-status="In Transit" onclick="setStatusFilter('In Transit', this)">In Transit</button>
            <button class="pill" data-status="Shipment Created" onclick="setStatusFilter('Shipment Created', this)">Created</button>
          </div>
        </div>

        <div class="toolbar-right">
          <select id="carrierFilter" class="select-dropdown" onchange="handleFilterChange()">
            <option value="all">All Carriers</option>
            <option value="dpd-uk">DPD (UK)</option>
            <option value="ups">UPS</option>
            <option value="dhl">DHL Express</option>
            <option value="fedex">FedEx</option>
            <option value="royal-mail">Royal Mail</option>
            <option value="usps">USPS</option>
          </select>

          <button class="btn btn-secondary btn-sm" onclick="exportCSV()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export
          </button>
          <button class="btn btn-secondary btn-sm" onclick="loadShipments()" title="Refresh Shipments">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
        </div>
      </section>

      <!-- Shipment Cards Grid -->
      <section class="shipments-container">
        <div id="shipmentsGrid" class="shipments-grid">
          <!-- Populated dynamically -->
        </div>
        <div id="emptyState" class="empty-state" style="display: none;">
          <div class="empty-icon">📦</div>
          <h3>No Shipments Found</h3>
          <p>Try adjusting your search criteria or add a new shipment to track.</p>
          <button class="btn btn-primary" onclick="openAddShipmentModal()">Add First Shipment</button>
        </div>
      </section>
    </main>

    <!-- PUBLIC PORTAL VIEW -->
    <main id="portalView" class="main-content" style="display: none;">
      <div class="portal-wrapper">
        <div class="portal-card">
          <div class="portal-badge">Customer Tracking Portal</div>
          <h2>Live Package Tracking</h2>
          <p>Check the real-time shipping status and full milestone history of your package.</p>
          
          <form class="portal-search" onsubmit="handlePortalTrack(event)">
            <input type="text" id="portalInput" placeholder="Enter AWB or Tracking Number..." required>
            <button type="submit" class="btn btn-primary">Track Now</button>
          </form>

          <div id="portalResultContainer" class="portal-result-container" style="display: none;">
            <!-- Rendered parcel card and timeline -->
          </div>
        </div>
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="app-footer">
      <div class="footer-inner">
        <div>TRACKING BRIDGE Logistics Gateway • Built with high-fidelity Courier Normalization</div>
        <div class="footer-carriers">
          <span>Supported:</span>
          <span class="carrier-tag">DPD</span>
          <span class="carrier-tag">UPS</span>
          <span class="carrier-tag">DHL</span>
          <span class="carrier-tag">FedEx</span>
          <span class="carrier-tag">17TRACK API</span>
        </div>
      </div>
    </footer>
  </div>

  <!-- MODAL: DETAILED SHIPMENT TIMELINE -->
  <div id="timelineModal" class="modal-overlay" onclick="closeModalOnBackdrop(event, 'timelineModal')">
    <div class="modal-dialog modal-lg">
      <div class="modal-header">
        <div class="modal-header-info">
          <span id="modalCarrierBadge" class="carrier-badge">DPD (UK)</span>
          <h2 id="modalAwbTitle" class="modal-title">15504338529265</h2>
          <span id="modalStatusBadge" class="status-badge status-delivered">Delivered</span>
        </div>
        <button class="modal-close-btn" onclick="closeModal('timelineModal')">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Summary Strip -->
        <div class="shipment-summary-grid">
          <div class="summary-item">
            <span class="summary-label">Customer</span>
            <span id="modalCustomerName" class="summary-val">ASMITA SUNAR</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Carrier</span>
            <span id="modalCarrierName" class="summary-val">DPD (UK)</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">AWB Number</span>
            <span id="modalAwbNumber" class="summary-val font-mono">15504338529265</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Tracking Number</span>
            <span id="modalTrackingNumber" class="summary-val font-mono">15504338529265</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Origin</span>
            <span id="modalOrigin" class="summary-val">Nepal</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Destination</span>
            <span id="modalDestination" class="summary-val">United Kingdom</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Delivery Date</span>
            <span id="modalDeliveryDate" class="summary-val text-success">26 Aug 2026 14:26</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Internal Code</span>
            <span id="modalShipmentCode" class="summary-val font-mono">SHIP-0001</span>
          </div>
        </div>

        <!-- Visual Milestone Progress Stepper -->
        <div class="milestone-stepper-box">
          <h4 class="section-title">TRACKING PROGRESS</h4>
          <div class="milestone-stepper" id="modalMilestoneStepper">
            <!-- Dynamically injected milestones with progress connection -->
          </div>
        </div>

        <!-- Full Event History Timeline -->
        <div class="timeline-box">
          <div class="timeline-header-row">
            <h4 class="section-title">FULL CHECKPOINT HISTORY</h4>
            <span class="event-count-badge" id="modalEventCount">8 Checkpoints</span>
          </div>
          <div class="timeline-stream" id="modalTimelineStream">
            <!-- Dynamically populated event cards -->
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="syncActiveShipment()" title="Fetch fresh updates directly from carrier">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          Sync Live Carrier
        </button>
        <button class="btn btn-secondary" onclick="copyPublicLink()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy Tracking Link
        </button>
        <button class="btn btn-primary" onclick="closeModal('timelineModal')">Done</button>
      </div>
    </div>
  </div>

  <!-- MODAL: ADD SHIPMENT -->
  <div id="addModal" class="modal-overlay" onclick="closeModalOnBackdrop(event, 'addModal')">
    <div class="modal-dialog">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Add New Shipment</h2>
          <p class="modal-subtitle">Register AWB, customer details, and courier tracking information.</p>
        </div>
        <button class="modal-close-btn" onclick="closeModal('addModal')">&times;</button>
      </div>

      <form onsubmit="handleCreateShipment(event)" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label for="newAwb">AWB Number *</label>
            <input type="text" id="newAwb" placeholder="e.g. 15504338529265" required>
          </div>
          <div class="form-group">
            <label for="newCustomer">Customer Name *</label>
            <input type="text" id="newCustomer" placeholder="e.g. ASMITA SUNAR" required>
          </div>
        </div>

        <div class="form-group">
          <div class="label-with-detection">
            <label for="newTracking">Carrier Tracking Number *</label>
            <span id="detectedCarrierPill" class="detected-carrier-pill" style="display: none;">
              ⚡ Detected: <strong id="detectedCarrierName">DPD</strong>
            </span>
          </div>
          <input 
            type="text" 
            id="newTracking" 
            placeholder="e.g. 15504338529265, 1Z9999999..., 982341..."
            oninput="handleTrackingNumberInput(this.value)"
            required
          >
          <span class="field-hint">Auto-detects DPD, UPS, DHL, FedEx, USPS, and Royal Mail.</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="newOrigin">Origin Country / City</label>
            <input type="text" id="newOrigin" placeholder="e.g. Nepal" value="Nepal">
          </div>
          <div class="form-group">
            <label for="newDestination">Destination Country / City</label>
            <input type="text" id="newDestination" placeholder="e.g. United Kingdom" value="United Kingdom">
          </div>
        </div>

        <div class="form-group">
          <label for="newCarrierSelect">Carrier Override (Optional)</label>
          <select id="newCarrierSelect" class="select-dropdown">
            <option value="auto">✨ Auto-Detect Carrier</option>
            <option value="dpd-uk">DPD (UK)</option>
            <option value="ups">UPS</option>
            <option value="dhl">DHL Express</option>
            <option value="fedex">FedEx</option>
            <option value="royal-mail">Royal Mail</option>
            <option value="usps">USPS</option>
          </select>
        </div>

        <div class="modal-footer" style="padding-right: 0; padding-bottom: 0;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('addModal')">Cancel</button>
          <button type="submit" class="btn btn-primary" id="saveShipmentBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Add & Start Tracking
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: BATCH CSV IMPORT -->
  <div id="batchModal" class="modal-overlay" onclick="closeModalOnBackdrop(event, 'batchModal')">
    <div class="modal-dialog">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Batch Import Shipments</h2>
          <p class="modal-subtitle">Paste CSV or Excel tab-delimited rows with AWB, Tracking No, Name, Origin, Destination.</p>
        </div>
        <button class="modal-close-btn" onclick="closeModal('batchModal')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="batch-hint-box">
          <strong>Format:</strong> <code>AWB, Tracking Number, Customer Name, Origin, Destination</code>
          <button class="btn-text" onclick="loadSampleCsvData()">Paste Sample CSV</button>
        </div>
        <textarea id="batchCsvInput" class="batch-textarea" rows="7" placeholder="15504338529265, 15504338529265, ASMITA SUNAR, Nepal, United Kingdom
1ZRJ70256812472852, 1ZRJ70256812472852, JOHN SMITH, Netherlands, Germany"></textarea>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal('batchModal')">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitBatchImport()">Import Shipments</button>
      </div>
    </div>
  </div>

  <!-- MODAL: API SETTINGS -->
  <div id="settingsModal" class="modal-overlay" onclick="closeModalOnBackdrop(event, 'settingsModal')">
    <div class="modal-dialog">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Live Carrier API Settings</h2>
          <p class="modal-subtitle">Configure 17TRACK API to automatically fetch live tracking updates for UPS, DPD, DHL, FedEx, etc.</p>
        </div>
        <button class="modal-close-btn" onclick="closeModal('settingsModal')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="track17ApiKeyInput">17TRACK API Security Token (17token)</label>
          <input type="password" id="track17ApiKeyInput" placeholder="Paste your 17TRACK security token here...">
          <span class="field-hint">You can get a free token from <a href="https://api.17track.net" target="_blank" style="color: var(--text-accent); text-decoration: underline;">api.17track.net</a>. When connected, Tracking Bridge queries live courier checkpoints directly.</span>
        </div>
        <div id="apiKeyStatusBox" style="margin-top: 1.25rem; padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.85rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <span>Live API Status:</span>
          <span id="apiKeyStatusText" style="font-weight: 700; color: #F59E0B;">⚡ Simulated Mode</span>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeModal('settingsModal')">Close</button>
        <button type="button" class="btn btn-primary" onclick="saveApiKey()">Save API Key</button>
      </div>
    </div>
  </div>

  <!-- Notification Toast -->
  <div id="toastNotification" class="toast-notification"></div>

  <script>// ==========================================================================
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
  const clean = String(trackingNumber).trim().toUpperCase().replace(/[\\s-]/g, '');
  if (/^1Z[0-9A-Z]{16}$/.test(clean)) return { code: 'ups', name: 'UPS' };
  if (/^\\d{10}$/.test(clean) || clean.startsWith('DHL') || clean.startsWith('JJD')) return { code: 'dhl', name: 'DHL Express' };
  if (/^\\d{14}$/.test(clean) || (clean.startsWith('155') && clean.length === 14) || (/^\\d{12}$/.test(clean) && clean.startsWith('0'))) return { code: 'dpd-uk', name: 'DPD (UK)' };
  if (/^\\d{12}$|^\\d{15}$|^\\d{20}$|^\\d{22}$/.test(clean) || clean.startsWith('FDX')) return { code: 'fedex', name: 'FedEx' };
  if (/^[A-Z]{2}\\d{9}GB$/.test(clean)) return { code: 'royal-mail', name: 'Royal Mail' };
  if (/^(94|92|93)\\d{20}$/.test(clean) || /^[A-Z]{2}\\d{9}US$/.test(clean)) return { code: 'usps', name: 'USPS' };
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
      const res = await fetch(\`/api/shipments?\${params.toString()}\`);
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

  const carrierClass = \`carrier-\${s.carrier_code || 'generic'}\`;
  const statusClass = getStatusClass(s.current_status);
  const initial = s.customer_name ? s.customer_name.charAt(0).toUpperCase() : 'S';
  const progressPercent = calculateProgress(s.current_status);

  card.innerHTML = \`
    <div>
      <div class="card-header-row">
        <span class="carrier-badge \${carrierClass}">\${escapeHtml(s.carrier_name)}</span>
        <span class="status-badge \${statusClass}">\${escapeHtml(s.current_status)}</span>
      </div>

      <div class="card-customer-row">
        <div class="avatar-initial">\${initial}</div>
        <div class="customer-meta">
          <span class="customer-name">\${escapeHtml(s.customer_name)}</span>
          <span class="tracking-awb-sub">
            AWB: \${escapeHtml(s.awb_number)}
            <button class="copy-mini-btn" onclick="copyText('\${escapeHtml(s.awb_number)}')" title="Copy AWB">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </span>
        </div>
      </div>

      <div class="card-route-strip">
        <div class="route-endpoint">
          <span class="route-tag">Origin</span>
          <span class="route-place">\${escapeHtml(s.origin)}</span>
        </div>
        <div class="route-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>
        <div class="route-endpoint" style="text-align: right;">
          <span class="route-tag">Destination</span>
          <span class="route-place">\${escapeHtml(s.destination)}</span>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="milestone-track">
          <div class="milestone-line-bg"></div>
          <div class="milestone-line-fill" style="width: \${progressPercent}%;"></div>
          <div class="milestone-dot completed"></div>
          <div class="milestone-dot \${progressPercent >= 25 ? 'completed' : ''}"></div>
          <div class="milestone-dot \${progressPercent >= 50 ? 'completed' : ''}"></div>
          <div class="milestone-dot \${progressPercent >= 75 ? 'completed' : ''}"></div>
          <div class="milestone-dot \${progressPercent >= 100 ? 'completed' : ''}"></div>
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
        <span>\${escapeHtml(s.current_location || 'Transit Hub')}</span>
      </div>
    </div>

    <div class="card-actions-row">
      <button class="btn btn-sm card-btn-view" onclick="openShipmentDetails(\${s.id})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        View Timeline Details
      </button>
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <button class="btn btn-sm card-btn-advance" onclick="advanceStatus(\${s.id})" title="Simulate advancing to next checkpoint stage">
          ⚡ Advance
        </button>
        <button class="btn-icon-danger" onclick="deleteShipment(\${s.id})" title="Delete shipment">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  \`;

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
      const res = await fetch(\`/api/shipments/\${shipmentId}\`);
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
  carrierBadge.className = \`carrier-badge carrier-\${s.carrier_code || 'generic'}\`;

  document.getElementById('modalAwbTitle').textContent = s.awb_number;
  
  const statusBadge = document.getElementById('modalStatusBadge');
  statusBadge.textContent = s.current_status;
  statusBadge.className = \`status-badge \${getStatusClass(s.current_status)}\`;

  // Summary Grid
  document.getElementById('modalCustomerName').textContent = s.customer_name;
  document.getElementById('modalCarrierName').textContent = s.carrier_name;
  document.getElementById('modalAwbNumber').textContent = s.awb_number;
  document.getElementById('modalTrackingNumber').textContent = s.tracking_number;
  document.getElementById('modalOrigin').textContent = s.origin;
  document.getElementById('modalDestination').textContent = s.destination;
  document.getElementById('modalDeliveryDate').textContent = s.delivered_at || s.estimated_delivery || 'In Transit';
  document.getElementById('modalShipmentCode').textContent = s.shipment_code || \`SHIP-\${s.id}\`;

  // Stepper
  const stepper = document.getElementById('modalMilestoneStepper');
  stepper.innerHTML = '';
  const milestones = ['Shipment Created', 'Collected', 'In Transit', 'Out for Delivery', 'Delivered'];
  const activeIdx = data.milestone_index !== undefined ? data.milestone_index : getMilestoneIndex(s.current_status);

  milestones.forEach((m, idx) => {
    const item = document.createElement('div');
    const isCompleted = idx <= activeIdx;
    const isActive = idx === activeIdx;

    item.className = \`stepper-item \${isCompleted ? 'completed' : ''} \${isActive ? 'active' : ''}\`;
    item.innerHTML = \`
      <div class="stepper-circle">
        \${isCompleted ? '✓' : (idx + 1)}
      </div>
      <span class="stepper-label">\${m}</span>
    \`;
    stepper.appendChild(item);
  });

  // Timeline Event Stream
  const stream = document.getElementById('modalTimelineStream');
  stream.innerHTML = '';
  document.getElementById('modalEventCount').textContent = \`\${events.length} Checkpoints\`;

  events.forEach((ev, idx) => {
    const evCard = document.createElement('div');
    const isLatest = idx === 0;
    const isDelivered = ev.status === 'Delivered';

    evCard.className = \`timeline-event-card \${isLatest ? 'event-latest' : ''} \${isDelivered ? 'event-delivered' : ''}\`;
    evCard.innerHTML = \`
      <div class="timeline-dot-pin"></div>
      <div class="event-time-row">
        <span class="event-timestamp">\${escapeHtml(ev.event_time)}</span>
        <span class="event-location-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          \${escapeHtml(ev.location)}
        </span>
      </div>
      <div class="event-status-title">\${escapeHtml(ev.status)} • <span style="font-weight: 500; font-size: 0.85rem; color: var(--text-muted);">\${escapeHtml(ev.carrier_status)}</span></div>
      <p class="event-description">\${escapeHtml(ev.description)}</p>
    \`;
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
      const res = await fetch(\`/api/track?awb=\${encodeURIComponent(query)}\`);
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
      showToast(\`No shipment found matching '\${query}'\`);
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
      const res = await fetch(\`/api/track?awb=\${encodeURIComponent(query)}\`);
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
      resultBox.innerHTML = \`
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5rem; border-radius: 12px; text-align: center; color: #F87171;">
          <h3>Shipment Not Found</h3>
          <p style="margin-top: 0.5rem; font-size: 0.9rem;">We couldn't locate any consignment with tracking/AWB: <strong>\${escapeHtml(query)}</strong></p>
        </div>
      \`;
      return;
    }

    const s = data.shipment;
    const events = data.events || [];

    resultBox.style.display = 'block';
    resultBox.innerHTML = \`
      <div style="background: var(--bg-surface); border: 1px solid var(--border-card); border-radius: 16px; padding: 1.5rem; margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <span class="carrier-badge carrier-\${s.carrier_code || 'generic'}">\${escapeHtml(s.carrier_name)}</span>
          <span class="status-badge \${getStatusClass(s.current_status)}">\${escapeHtml(s.current_status)}</span>
        </div>
        <h3 style="font-size: 1.3rem; margin-bottom: 0.3rem;">\${escapeHtml(s.customer_name)}</h3>
        <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-accent); margin-bottom: 1rem;">AWB: \${escapeHtml(s.awb_number)}</p>
        <div style="display: flex; justify-content: space-between; background: var(--bg-card); padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <span><strong>From:</strong> \${escapeHtml(s.origin)}</span>
          <span>➔</span>
          <span><strong>To:</strong> \${escapeHtml(s.destination)}</span>
        </div>
        <h4 style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem;">Latest Checkpoints:</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          \${events.slice(0, 4).map(e => \`
            <div style="background: var(--bg-card); padding: 0.75rem 1rem; border-radius: 8px; border-left: 3px solid #38BDF8;">
              <div style="font-size: 0.75rem; color: var(--text-accent); font-family: var(--font-mono);">\${escapeHtml(e.event_time)} • \${escapeHtml(e.location)}</div>
              <div style="font-weight: 600; font-size: 0.9rem; margin-top: 2px;">\${escapeHtml(e.status)}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">\${escapeHtml(e.description)}</div>
            </div>
          \`).join('')}
        </div>
      </div>
    \`;
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
      const code = \`SHIP-\${String(all.length + 1).padStart(4, '0')}\`;
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
        current_location: \`\${origin} Dispatch Facility\`,
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
            location: \`\${origin} Dispatch Facility\`,
            description: \`Shipment registered electronically with \${det.name}.\`
          }
        ]
      };

      all.unshift(newShipment);
      saveLocalShipments(all);
      createdShipment = { shipment_code: code, carrier_detected: det.name };
    }

    showToast(\`Shipment \${createdShipment.shipment_code} registered!\`);
    closeModal('addModal');
    event.target.reset();
    document.getElementById('detectedCarrierPill').style.display = 'none';
    loadShipments();
  } catch (err) {
    showToast(err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = \`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Add & Start Tracking\`;
  }
}

// --------------------------------------------------------------------------
// ADVANCE / DEMO STATE TRANSITION
// --------------------------------------------------------------------------

async function advanceStatus(shipmentId) {
  try {
    let advanced = false;
    try {
      const res = await fetch(\`/api/shipments/\${shipmentId}/advance\`, { method: 'POST' });
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
          location: nextStatus === 'Delivered' ? \`\${s.destination} Recipient Address\` : \`\${s.destination} Regional Hub\`,
          description: \`Shipment advanced to \${nextStatus}.\`
        });
        if (nextStatus === 'Delivered') s.delivered_at = nowStr;
        saveLocalShipments(all);
        showToast(\`Status advanced to \${nextStatus}\`);
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
      const res = await fetch(\`/api/shipments/\${shipmentId}\`, { method: 'DELETE' });
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
  const sample = \`15504338529265, 15504338529265, ASMITA SUNAR, Nepal, United Kingdom
1ZRJ70256812472852, 1ZRJ70256812472852, JOHN SMITH, Netherlands, Germany
DHL5592810234, 5592810234, SARAH CONNOR, Japan, United States
FDX9920148201, 992014820124, DAVID BECKHAM, Singapore, Australia\`;
  document.getElementById('batchCsvInput').value = sample;
}

async function submitBatchImport() {
  const text = document.getElementById('batchCsvInput').value.trim();
  if (!text) {
    showToast('Please enter CSV data');
    return;
  }

  const lines = text.split('\\n');
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
          shipment_code: \`SHIP-\${String(all.length + 1).padStart(4, '0')}\`,
          awb_number: it.awb,
          tracking_number: it.tracking_number,
          customer_name: it.customer_name,
          origin: it.origin,
          destination: it.destination,
          carrier_name: det.name,
          carrier_code: det.code,
          current_status: 'Shipment Created',
          current_location: \`\${it.origin} Sorting Facility\`,
          estimated_delivery: 'In 3-5 business days',
          created_at: nowStr,
          updated_at: nowStr,
          events: [{ id: 1, event_time: nowStr, status: 'Shipment Created', carrier_status: 'Order Placed', location: \`\${it.origin} Hub\`, description: 'Shipment details imported.' }]
        });
      });
      saveLocalShipments(all);
      showToast(\`Successfully imported \${items.length} shipments\`);
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

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(x => \`"\${String(x).replace(/"/g, '""')}"\`).join(',')).join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', \`tracking_bridge_shipments_\${new Date().toISOString().slice(0, 10)}.csv\`);
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
        statusEl.innerHTML = \`🟢 Live 17TRACK Active (\${data.api_key_masked})\`;
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
    const res = await fetch(\`/api/shipments/\${currentActiveShipment.id}/sync\`, { method: 'POST' });
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
      btn.innerHTML = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Sync Live Carrier\`;
    }
  }
}

function copyPublicLink() {
  if (!currentActiveShipment) return;
  const url = \`\${window.location.origin}/?awb=\${encodeURIComponent(currentActiveShipment.awb_number)}\`;
  copyText(url);
  showToast('Public tracking URL copied to clipboard!');
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(\`Copied: \${text}\`);
  }).catch(() => {
    showToast(\`Copied to clipboard\`);
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
</script>
</body>
</html>
`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, 17token"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve Static UI
    if (path === "/" || path === "/index.html" || !path.startsWith("/api/")) {
      return new Response(HTML_APP, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=0, must-revalidate",
          ...corsHeaders
        }
      });
    }

    // API: Carrier Detection
    if (path === "/api/detect-carrier" && request.method === "POST") {
      try {
        const body = await request.json();
        const num = (body.tracking_number || "").trim().toUpperCase().replace(/[\s-]/g, "");
        let detected = { code: "generic", name: "International Courier" };

        if (/^1Z[0-9A-Z]{16}$/.test(num)) detected = { code: "ups", name: "UPS" };
        else if (/^\d{10}$/.test(num) || num.startsWith("DHL") || num.startsWith("JJD")) detected = { code: "dhl", name: "DHL Express" };
        else if (/^\d{14}$/.test(num) || (num.startsWith("155") && num.length === 14) || (/^\d{12}$/.test(num) && num.startsWith("0"))) detected = { code: "dpd-uk", name: "DPD (UK)" };
        else if (/^\d{12}$|^\d{15}$|^\d{20}$|^\d{22}$/.test(num) || num.startsWith("FDX")) detected = { code: "fedex", name: "FedEx" };
        else if (/^[A-Z]{2}\d{9}GB$/.test(num)) detected = { code: "royal-mail", name: "Royal Mail" };
        else if (/^(94|92|93)\d{20}$/.test(num) || /^[A-Z]{2}\d{9}US$/.test(num)) detected = { code: "usps", name: "USPS" };

        return new Response(JSON.stringify({ detected }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: corsHeaders });
      }
    }

    // Fallback: Let client handle local state smoothly
    return new Response(JSON.stringify({ error: "Endpoint handled client-side" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};
