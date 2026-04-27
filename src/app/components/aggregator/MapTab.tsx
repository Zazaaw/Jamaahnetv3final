import React, { useState, useEffect, useRef } from "react";
import {
  MapPin, Navigation, Phone, X,
  LayoutDashboard, ShieldAlert, Locate
} from "lucide-react";
import "./MapTab.css";

// ── OBAT ANTI-BLANK VITE ──
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

/* ── Types ── */
interface Location {
  id: string;
  name: string;
  type: "pesantren" | "bisnis";
  lat: number;
  lng: number;
  city: string;
  sector?: string;
  revenue?: string;
  growth?: number;
  bmc?: number;
  santri?: number;
  linkedPesantren?: string;
  address: string;
}

/* ── Data ── */
const locations: Location[] = [
  { id: "p1", name: "Pesantren Hidayatullah Pusat",     type: "pesantren", lat: -1.2379, lng: 116.8529, city: "Balikpapan",  santri: 2450, address: "Jl. Gn. Tembak, Balikpapan Utara" },
  { id: "p2", name: "Pesantren Hidayatullah Jakarta",   type: "pesantren", lat: -6.3200, lng: 106.8400, city: "Jakarta",      santri: 1200, address: "Jl. Raya Hankam, Cipayung" },
  { id: "p3", name: "Pesantren Hidayatullah Surabaya",  type: "pesantren", lat: -7.3400, lng: 112.7100, city: "Surabaya",     santri: 980,  address: "Jl. Kejawan Putih, Mulyorejo" },
  { id: "p4", name: "Pesantren Hidayatullah Makassar",  type: "pesantren", lat: -5.1477, lng: 119.4327, city: "Makassar",     santri: 850,  address: "Jl. Abdullah Daeng Sirua" },
  { id: "p5", name: "Pesantren Hidayatullah Bandung",   type: "pesantren", lat: -6.8800, lng: 107.6100, city: "Bandung",      santri: 720,  address: "Jl. Cigadung Raya Timur" },
  { id: "p6", name: "Pesantren Hidayatullah Yogyakarta",type: "pesantren", lat: -7.8200, lng: 110.3600, city: "Yogyakarta",   santri: 650,  address: "Jl. Kaliurang KM 14" },
  { id: "p7", name: "Pesantren Hidayatullah Medan",     type: "pesantren", lat:  3.5500, lng:  98.6800, city: "Medan",        santri: 540,  address: "Jl. Karya Wisata, Medan Johor" },
  { id: "p8", name: "Pesantren Hidayatullah Semarang",  type: "pesantren", lat: -7.0200, lng: 110.4400, city: "Semarang",     santri: 480,  address: "Jl. Durian Selatan, Srondol" },
  { id: "b1",  name: "TechFlow Solutions",       type: "bisnis", lat: -6.2150, lng: 106.8450, city: "Jakarta",    sector: "Tech",          revenue: "24.5M", growth: 24.5,  bmc: 85, linkedPesantren: "p2", address: "Jl. Sudirman No. 45, Jakarta Selatan" },
  { id: "b2",  name: "Kopi Kenangan Senja",      type: "bisnis", lat: -6.9200, lng: 107.6100, city: "Bandung",    sector: "F&B",           revenue: "18.2M", growth: 15.8,  bmc: 95, linkedPesantren: "p5", address: "Jl. Braga No. 12, Bandung" },
  { id: "b3",  name: "Urban Style Wear",         type: "bisnis", lat: -6.1900, lng: 106.8200, city: "Jakarta",    sector: "Retail",        revenue: "15.1M", growth:  8.4,  bmc: 75, linkedPesantren: "p2", address: "Jl. Kemang Raya No. 8, Jakarta Selatan" },
  { id: "b4",  name: "Clean & Bright",           type: "bisnis", lat: -7.2800, lng: 112.7500, city: "Surabaya",   sector: "Service",       revenue: "8.7M",  growth: -2.3,  bmc: 60, linkedPesantren: "p3", address: "Jl. Raya Darmo No. 22, Surabaya" },
  { id: "b5",  name: "DataNexus AI",             type: "bisnis", lat: -7.7900, lng: 110.3700, city: "Yogyakarta", sector: "Tech",          revenue: "5.3M",  growth: 42.1,  bmc: 40, linkedPesantren: "p6", address: "Jl. Affandi No. 15, Yogyakarta" },
  { id: "b6",  name: "Hidayatullah Mart",        type: "bisnis", lat: -1.2500, lng: 116.8600, city: "Balikpapan", sector: "Retail",        revenue: "12.4M", growth: 11.2,  bmc: 78, linkedPesantren: "p1", address: "Jl. Gn. Tembak No. 5, Balikpapan" },
  { id: "b7",  name: "Berkah Catering",          type: "bisnis", lat: -5.1600, lng: 119.4200, city: "Makassar",   sector: "F&B",           revenue: "6.8M",  growth:  9.5,  bmc: 70, linkedPesantren: "p4", address: "Jl. AP Pettarani No. 18, Makassar" },
  { id: "b8",  name: "Amanah Travel",            type: "bisnis", lat: -7.0100, lng: 110.4100, city: "Semarang",   sector: "Service",       revenue: "4.2M",  growth:  5.3,  bmc: 65, linkedPesantren: "p8", address: "Jl. Pandanaran No. 30, Semarang" },
  { id: "b9",  name: "Global EduTech",           type: "bisnis", lat: -6.2300, lng: 106.8100, city: "Jakarta",    sector: "Tech",          revenue: "11.2M", growth: 18.5,  bmc: 80, linkedPesantren: "p2", address: "Jl. Gatot Subroto No. 10, Jakarta Selatan" },
  { id: "b10", name: "Nusantara Logistics",      type: "bisnis", lat: -6.1100, lng: 106.8800, city: "Jakarta",    sector: "Service",       revenue: "32.1M", growth:  5.2,  bmc: 88, linkedPesantren: "p2", address: "Jl. Yos Sudarso, Tanjung Priok" },
  { id: "b11", name: "Bumi Agro Farm",           type: "bisnis", lat: -6.7500, lng: 107.5000, city: "Bandung",    sector: "Agriculture",   revenue: "9.5M",  growth: 12.4,  bmc: 72, linkedPesantren: "p5", address: "Lembang, Bandung Barat" },
  { id: "b12", name: "Cipta Karya Printing",     type: "bisnis", lat: -7.3100, lng: 112.7300, city: "Surabaya",   sector: "Manufacturing", revenue: "14.8M", growth: -1.5,  bmc: 68, linkedPesantren: "p3", address: "Jl. Rungkut Industri, Surabaya" },
  { id: "b13", name: "Mandiri Berkah Finance",   type: "bisnis", lat: -1.2600, lng: 116.8300, city: "Balikpapan", sector: "Finance",       revenue: "28.5M", growth: 14.2,  bmc: 90, linkedPesantren: "p1", address: "Jl. Jend. Sudirman, Balikpapan" },
  { id: "b14", name: "Smart Property",           type: "bisnis", lat: -7.7800, lng: 110.3800, city: "Yogyakarta", sector: "Real Estate",   revenue: "19.3M", growth:  8.8,  bmc: 82, linkedPesantren: "p6", address: "Jl. Gejayan, Yogyakarta" },
  { id: "b15", name: "Klinik Sehat Utama",       type: "bisnis", lat: -5.1300, lng: 119.4500, city: "Makassar",   sector: "Healthcare",    revenue: "7.6M",  growth: 22.1,  bmc: 76, linkedPesantren: "p4", address: "Jl. Urip Sumoharjo, Makassar" },
  { id: "b16", name: "Samudera Raya Fishery",    type: "bisnis", lat:  3.6000, lng:  98.6500, city: "Medan",      sector: "Agriculture",   revenue: "16.4M", growth: 10.5,  bmc: 70, linkedPesantren: "p7", address: "Belawan, Medan" },
  { id: "b17", name: "Harmoni Furniture",        type: "bisnis", lat: -7.0300, lng: 110.4500, city: "Semarang",   sector: "Retail",        revenue: "8.9M",  growth:  4.1,  bmc: 64, linkedPesantren: "p8", address: "Jl. Majapahit, Semarang" },
  { id: "b18", name: "Tirta Jaya Konstruksi",    type: "bisnis", lat: -6.2500, lng: 106.8600, city: "Jakarta",    sector: "Construction",  revenue: "45.2M", growth: -5.4,  bmc: 85, linkedPesantren: "p2", address: "Jl. MT Haryono, Jakarta" },
  { id: "b19", name: "Sinergi Media",            type: "bisnis", lat: -6.9000, lng: 107.6300, city: "Bandung",    sector: "Tech",          revenue: "6.2M",  growth: 35.8,  bmc: 55, linkedPesantren: "p5", address: "Jl. Supratman, Bandung" },
  { id: "b20", name: "Maju Bersama Trading",     type: "bisnis", lat: -7.2600, lng: 112.7400, city: "Surabaya",   sector: "Retail",        revenue: "21.5M", growth:  7.6,  bmc: 78, linkedPesantren: "p3", address: "Jl. Basuki Rahmat, Surabaya" },
];

/* ── Helpers ── */
function getHealthScore(loc: Location): number {
  if (loc.type === "bisnis") {
    return Math.round((loc.bmc ?? 0) * 0.6 + Math.min(Math.max((loc.growth ?? 0) * 2, 0), 40));
  }
  const linked = locations.filter(l => l.linkedPesantren === loc.id && l.type === "bisnis");
  if (linked.length === 0) return 85;
  return Math.round(linked.reduce((acc, curr) => acc + getHealthScore(curr), 0) / linked.length);
}

function getStatus(score: number): "healthy" | "warning" | "risk" {
  if (score >= 75) return "healthy";
  if (score >= 50) return "warning";
  return "risk";
}

function getPesantrenStats(id: string) {
  const linked = locations.filter(l => l.linkedPesantren === id && l.type === "bisnis");
  const totalRev = linked.reduce((acc, curr) => acc + parseFloat(curr.revenue ?? "0"), 0);
  const avgGrowth = linked.length > 0
    ? linked.reduce((acc, curr) => acc + (curr.growth ?? 0), 0) / linked.length
    : 0;
  return { totalRev: totalRev.toFixed(1), avgGrowth: avgGrowth.toFixed(1), count: linked.length };
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type FilterKey  = "all" | "pesantren" | "bisnis" | "risk";
type SheetState = "collapsed" | "half" | "full";

/* ── Component ── */
export default function MapTab() {
  const [filter, setFilter]       = useState<FilterKey>("all");
  const [selected, setSelected]   = useState<Location | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>("half");
  const mapRef          = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  const filtered = filter === "all"  ? locations
    : filter === "risk"              ? locations.filter(l => getStatus(getHealthScore(l)) === "risk")
    : locations.filter(l => l.type === filter);

  const totalPesantren = locations.filter(l => l.type === "pesantren").length;
  const totalBisnis    = locations.filter(l => l.type === "bisnis").length;
  const totalRisk      = locations.filter(l => getStatus(getHealthScore(l)) === "risk").length;

  /* ── Initialize Map (Vite Style) ── */
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapReady) return;
    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118],
      zoom: 5,
      maxZoom: 18, // <--- TAMBAHKAN INI WAK, INI OBATNYA!
      zoomControl: false,
      attributionControl: false,
    });
    
    // Tambahkan juga maxZoom di TileLayer biar makin aman
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18
    }).addTo(map);
    
    mapRef.current = map;
    setMapReady(true);
    return () => { map.remove(); };
  }, [L]);

  /* ── Markers ── */
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    map.eachLayer((layer: any) => {
      if (layer._isMarker || layer._isCluster) map.removeLayer(layer);
    });

    const cluster = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        return L.divIcon({
          html: `<div class="cluster-marker"><span>${count}</span></div>`,
          className: "custom-cluster-icon",
          iconSize: [44, 44],
        });
      },
    });

    filtered.forEach(loc => {
      const status = getStatus(getHealthScore(loc));
      const icon   = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="marker-pin status-${status}">
            ${loc.type === "pesantren" ? "🕌" : "🏢"}
            ${status === "risk" ? '<div class="marker-alert"></div>' : ""}
          </div>
          <div class="marker-label">${loc.name.length > 14 ? loc.name.slice(0, 12) + "…" : loc.name}</div>
        `,
        iconSize: [44, 62],
        iconAnchor: [22, 62],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon });
      marker.on("click", () => {
        setSelected(loc);
        setSheetState("half");
        map.flyTo([loc.lat, loc.lng], 13, { duration: 0.8 });
      });
      (marker as any)._isMarker = true;
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
  }, [filtered, mapReady]);

  /* ── Handlers ── */
  const handleFlyTo = (loc: Location) => {
    setSelected(loc);
    setSheetState("half");
    mapRef.current?.flyTo([loc.lat, loc.lng], 13, { duration: 0.8 });
  };

  const handleReset = () => {
    mapRef.current?.flyTo([-2.5, 118], 5, { duration: 0.8 });
    setSelected(null);
  };

  const cycleSheet = () =>
    setSheetState(s => s === "collapsed" ? "half" : s === "half" ? "full" : "half");

  /* ── Render ── */
  return (
    <div className="map-tab">

      {/* Header */}
      <header className="map-header">
        <div className="map-header-content">
          <h1 className="map-title">Peta Entitas</h1>
          <p className="map-subtitle">{locations.length} Lokasi · {totalPesantren} Pesantren · {totalBisnis} Bisnis</p>
        </div>
        <div className="map-header-actions">
          <button className="map-icon-btn" onClick={handleReset} title="Reset peta">
            <Locate size={18} />
          </button>
        </div>
      </header>

      {/* Filter Chips */}
      <div className="map-filters">
        <button className={`map-filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => { setFilter("all"); setSelected(null); }}>
          <LayoutDashboard size={14} /> Semua
        </button>
        <button className={`map-filter-chip chip-pesantren ${filter === "pesantren" ? "active" : ""}`} onClick={() => { setFilter("pesantren"); setSelected(null); }}>
          🕌 Pesantren
        </button>
        <button className={`map-filter-chip chip-bisnis ${filter === "bisnis" ? "active" : ""}`} onClick={() => { setFilter("bisnis"); setSelected(null); }}>
          🏢 Bisnis
        </button>
        <button className={`map-filter-chip chip-risk ${filter === "risk" ? "active" : ""}`} onClick={() => { setFilter("risk"); setSelected(null); }}>
          <ShieldAlert size={14} /> Risiko
          {totalRisk > 0 && <span style={{ background: "rgba(239,68,68,0.25)", borderRadius: "1rem", padding: "0 0.35rem", fontSize: "0.65rem" }}>{totalRisk}</span>}
        </button>
      </div>

      {/* Map */}
      <div className="map-container">
        <div ref={mapContainerRef} className="leaflet-map" style={{ height: "100%", width: "100%" }} />
        {!mapReady && (
          <div className="map-loading">
            <div className="map-loading-spinner" />
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className={`map-sheet sheet-${sheetState}`}>
        <div className="sheet-handle-area" onClick={cycleSheet}>
          <div className="sheet-handle-bar" />
        </div>

        {selected ? (
          /* ── Detail View ── */
          <div className="sheet-detail">
            {/* Header row */}
            <div className="sheet-detail-header">
              <div className={`sheet-detail-icon ${selected.type === "pesantren" ? "icon-pesantren" : "icon-bisnis"}`}>
                {selected.type === "pesantren" ? "🕌" : "🏢"}
              </div>
              <div className="sheet-detail-info">
                <h3 className="sheet-detail-name">{selected.name}</h3>
                <p className="sheet-detail-addr"><MapPin size={12} /> {selected.address}</p>
                {selected.sector && <span className="sector-chip">{selected.sector}</span>}
              </div>
              <button className="sheet-close" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            {/* Stats */}
            {selected.type === "pesantren" ? (() => {
              const s = getPesantrenStats(selected.id);
              const h = getHealthScore(selected);
              const st = getStatus(h);
              return (
                <div className="sheet-pesantren-stats">
                  <div className="sheet-stat">
                    <span className="sheet-stat-label">Total Revenue</span>
                    <span className="sheet-stat-value">Rp {s.totalRev}M</span>
                  </div>
                  <div className="sheet-stat">
                    <span className="sheet-stat-label">Avg Growth</span>
                    <span className={`sheet-stat-value ${parseFloat(s.avgGrowth) >= 0 ? "text-healthy" : "text-risk"}`}>
                      {parseFloat(s.avgGrowth) >= 0 ? "+" : ""}{s.avgGrowth}%
                    </span>
                  </div>
                  <div className="sheet-stat">
                    <span className="sheet-stat-label">Santri</span>
                    <span className="sheet-stat-value">{selected.santri?.toLocaleString()}</span>
                  </div>
                  <div className="sheet-stat">
                    <span className="sheet-stat-label">Unit Bisnis</span>
                    <span className="sheet-stat-value">{s.count}</span>
                  </div>
                  <div className="sheet-health-bar-wrap">
                    <div className="sheet-health-header">
                      <span className="sheet-health-label">Health Score</span>
                      <span className={`sheet-health-value text-${st}`}>{h} / 100</span>
                    </div>
                    <div className="sheet-health-track">
                      <div className={`sheet-health-fill fill-${st}`} style={{ width: `${h}%` }} />
                    </div>
                  </div>
                </div>
              );
            })() : (() => {
              const h  = getHealthScore(selected);
              const st = getStatus(h);
              const pesantren = locations.find(l => l.id === selected.linkedPesantren);
              return (
                <div className="sheet-bisnis-stats">
                  <div className="sheet-stat">
                    <span className="sheet-stat-label">Revenue</span>
                    <span className="sheet-stat-value">Rp {selected.revenue}</span>
                  </div>
                  <div className="sheet-stat">
                    <span className="sheet-stat-label">Growth YoY</span>
                    <span className={`sheet-stat-value ${(selected.growth ?? 0) >= 0 ? "text-healthy" : "text-risk"}`}>
                      {(selected.growth ?? 0) >= 0 ? "+" : ""}{selected.growth}%
                    </span>
                  </div>
                  {pesantren && (
                    <div className="sheet-stat" style={{ gridColumn: "span 2" }}>
                      <span className="sheet-stat-label">Induk Pesantren</span>
                      <span className="sheet-stat-value" style={{ fontSize: "0.9rem" }}>{pesantren.name}</span>
                    </div>
                  )}
                  <div className="sheet-health-bar-wrap">
                    <div className="sheet-health-header">
                      <span className="sheet-health-label">Health Index (BMC)</span>
                      <span className={`sheet-health-value text-${st}`}>{h}%</span>
                    </div>
                    <div className="sheet-health-track">
                      <div className={`sheet-health-fill fill-${st}`} style={{ width: `${h}%` }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="sheet-actions">
              <button className="sheet-btn sheet-btn-route"><Navigation size={17} /> Lihat Rute</button>
              <button className="sheet-btn sheet-btn-contact"><Phone size={17} /> Hubungi</button>
            </div>

            {/* Related businesses for pesantren */}
            {selected.type === "pesantren" && (() => {
              const linked = locations.filter(l => l.linkedPesantren === selected.id);
              if (linked.length === 0) return null;
              return (
                <div className="sheet-nearby-container">
                  <p className="sheet-related-title">Bisnis Terkait · {linked.length} Unit</p>
                  {linked.map(b => {
                    const score  = getHealthScore(b);
                    const status = getStatus(score);
                    return (
                      <div key={b.id} className="sheet-list-item" onClick={() => handleFlyTo(b)}>
                        <div className="sheet-list-dot dot-bisnis">🏢</div>
                        <div className="sheet-list-info">
                          <span className="sheet-list-name">{b.name}</span>
                          <span className="sheet-list-meta">
                            {b.sector} · {haversine(selected.lat, selected.lng, b.lat, b.lng).toFixed(0)} km
                          </span>
                        </div>
                        <span className={`sheet-list-badge badge-${status}`}>
                          {(b.growth ?? 0) >= 0 ? "+" : ""}{b.growth}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        ) : (
          /* ── List View ── */
          <>
            {/* Summary pills */}
            <div className="sheet-summary">
              <div className="sheet-summary-pill">
                <div className="pill-dot" style={{ background: "#10b981" }} />
                {totalPesantren} Pesantren
              </div>
              <div className="sheet-summary-pill">
                <div className="pill-dot" style={{ background: "#f59e0b" }} />
                {totalBisnis} Bisnis
              </div>
              {totalRisk > 0 && (
                <div className="sheet-summary-pill">
                  <div className="pill-dot" style={{ background: "#ef4444" }} />
                  {totalRisk} Risiko
                </div>
              )}
            </div>

            <div className="sheet-list-container">
              <h4 className="sheet-list-title">
                {filter === "all" ? "Semua Entitas" : filter === "pesantren" ? "Pesantren" : filter === "bisnis" ? "Unit Bisnis" : "Entitas Berisiko"}
                {" "}· <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>{filtered.length}</span>
              </h4>
              {filtered.map(loc => {
                const score  = getHealthScore(loc);
                const status = getStatus(score);
                return (
                  <div key={loc.id} className="sheet-list-item" onClick={() => handleFlyTo(loc)}>
                    <div className={`sheet-list-dot ${loc.type === "pesantren" ? "dot-pesantren" : "dot-bisnis"}`}>
                      {loc.type === "pesantren" ? "🕌" : "🏢"}
                    </div>
                    <div className="sheet-list-info">
                      <span className="sheet-list-name">{loc.name}</span>
                      <span className="sheet-list-meta">
                        {loc.city}
                        {loc.sector && <> · {loc.sector}</>}
                        {loc.santri && <> · {loc.santri.toLocaleString()} santri</>}
                      </span>
                    </div>
                    <span className={`sheet-list-badge badge-${status}`}>{score}%</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}