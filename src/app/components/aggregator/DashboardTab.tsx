"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Building2,
  HeartPulse,
  ChevronRight,
  Bell,
  Search,
  Zap,
  ShieldAlert,
  Rocket, Map, 
  Handshake,
  Lightbulb,
  Store // Icon baru buat public view
} from "lucide-react";
import "./DashboardTab.css";

/* ── MOCK DATA KHUSUS ADMIN (HELICOPTER VIEW) ── */
const AdminKPI = [
  { label: "Portfolio Value", value: "Rp 71.8M", change: "+17.7%", trend: "up" as const, icon: <DollarSign size={18} />, color: "var(--accent-primary)", bg: "var(--accent-glow)" },
  { label: "Active Entities", value: "3", sub: "of 5 total", icon: <Building2 size={18} />, color: "var(--blue)", bg: "var(--blue-glow)" },
  { label: "Avg Growth", value: "17.7%", change: "vs Q1 2025", trend: "up" as const, icon: <TrendingUp size={18} />, color: "var(--amber)", bg: "var(--amber-glow)" },
  { label: "Health Index", value: "61", sub: "/ 100", icon: <HeartPulse size={18} />, color: "var(--red)", bg: "var(--red-glow)" },
];

const topEntities = [
  { name: "TechFlow Solutions", sector: "Tech", revenue: "24.5M", growth: 24.5, bmc: 85, risk: "low" },
  { name: "Kopi Kenangan Senja", sector: "F&B", revenue: "18.2M", growth: 15.8, bmc: 95, risk: "low" },
  { name: "DataNexus AI", sector: "Tech", revenue: "5.3M", growth: 42.1, bmc: 40, risk: "high" },
];

const triageSummary = [
  { label: "Urgent Review", entity: "Clean & Bright", deadline: "2 Hari", color: "var(--red)", bg: "var(--red-glow)", icon: <ShieldAlert size={16} /> },
  { label: "Golden Opportunity", entity: "DataNexus AI", deadline: "7 Hari", color: "var(--amber)", bg: "var(--amber-glow)", icon: <Zap size={16} /> },
  { label: "Strategic Expansion", entity: "Bali, Medan", deadline: "30 Hari", color: "var(--blue)", bg: "var(--blue-glow)", icon: <Rocket size={16} /> },
];

/* ── MOCK DATA KHUSUS MEMBER (MICRO / ACTIONABLE VIEW) ── */
const MemberKPI = [
  { label: "Omset Bulan Ini", value: "Rp 18.2M", change: "+15.8%", trend: "up" as const, icon: <DollarSign size={18} />, color: "var(--accent-primary)", bg: "var(--accent-glow)" },
  { label: "Skor BMC", value: "95", sub: "/ 100", icon: <HeartPulse size={18} />, color: "var(--amber)", bg: "var(--amber-glow)" },
  { label: "Pertumbuhan YoY", value: "12.4%", change: "Stabil", trend: "up" as const, icon: <TrendingUp size={18} />, color: "var(--blue)", bg: "var(--blue-glow)" },
];

const synergyOpportunities = [
  { 
    title: "Peluang Ekspansi Pasar", 
    desc: "Ada 3 bisnis Jamaah di sektor Retail yang membutuhkan suplai produk F&B Anda di regional Medan.", 
    icon: <Handshake size={16} />, color: "var(--blue)", bg: "var(--blue-glow)" 
  },
  { 
    title: "Rekomendasi Upscaling", 
    desc: "Skor Customer Relationship Anda stabil. Direkomendasikan menggunakan Vendor Digital Marketing Jamaah untuk scale-up.", 
    icon: <Lightbulb size={16} />, color: "var(--amber)", bg: "var(--amber-glow)" 
  },
];

export default function DashboardTab({
  onNavigate,
  userName = "Member",
  userRole = "user"
}: {
  onNavigate: (t: any) => void;
  userName?: string;
  userRole?: string;
}) {
  
  // LOGIKA 3 KASTA!
  const isAdmin = ['admin', 'aggregator_it', 'developer'].includes(userRole);
  const isMember = userRole === 'aggregator_member';
  const isPublic = userRole === 'user';

  return (
    <div className="dash">
      {/* Header Umum */}
      <header className="dash-header anim-fade">
        <div className="dash-header-left">
          <p className="dash-greeting">Selamat Datang,</p>
          <h1 className="dash-name">{userName}</h1> 
        </div>
        <div className="dash-header-right">
          <button className="header-icon-btn" aria-label="Search">
            <Search size={20} />
          </button>
          <button className="header-icon-btn" aria-label="Notifications">
            <Bell size={20} />
            <span className="notif-dot" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 1. RENDER TAMPILAN ADMIN (HELICOPTER VIEW)               */}
      {/* ======================================================== */}
      {isAdmin && (
        <>
          <section className="dash-hero anim-scale d1">
            <div className="hero-bg-orb hero-orb-1" />
            <div className="hero-bg-orb hero-orb-2" />
            <div className="hero-content">
              <p className="hero-label">Total Portofolio Nasional</p>
              <h2 className="hero-value">Rp 71.8<span className="hero-unit">M</span></h2>
              <div className="hero-change">
                <TrendingUp size={14} />
                <span>+17.7% YoY</span>
              </div>
            </div>
            <div className="hero-ring">
              <svg viewBox="0 0 80 80" className="hero-ring-svg">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="url(#heroGrad)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${61 * 2.136} ${100 * 2.136}`} transform="rotate(-90 40 40)" />
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06d6a0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="hero-ring-label">
                <span className="hero-ring-value">61</span>
                <span className="hero-ring-sub">Health</span>
              </div>
            </div>
          </section>

          <section className="dash-section">
            <div className="section-head anim-fade d2">
              <h3 className="section-title">KPI Global</h3>
            </div>
            <div className="kpi-grid">
              {AdminKPI.map((k, i) => (
                <div key={k.label} className={`kpi-card card anim-slide d${i + 2}`}>
                  <div className="kpi-icon" style={{ color: k.color, background: k.bg }}>{k.icon}</div>
                  <p className="kpi-label">{k.label}</p>
                  <div className="kpi-value-row">
                    <span className="kpi-value">{k.value}</span>
                    {k.sub && <span className="kpi-sub">{k.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dash-section">
            <div className="section-head anim-fade d3">
              <h3 className="section-title">Top Entitas Bisnis</h3>
              <button className="section-link" onClick={() => onNavigate("entities")}>
                Lihat Semua <ChevronRight size={14} />
              </button>
            </div>
            <div className="entity-list">
              {topEntities.map((e, i) => (
                <div key={e.name} className={`entity-row card anim-slide d${i + 3}`}>
                  <div className="entity-avatar"><span>{e.name.charAt(0)}</span></div>
                  <div className="entity-info">
                    <h4 className="entity-name">{e.name}</h4>
                    <p className="entity-meta">{e.sector} · Rp {e.revenue}</p>
                  </div>
                  <div className="entity-metrics">
                    <span className={`entity-growth ${e.growth >= 0 ? "positive" : "negative"}`}>
                      {e.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {e.growth >= 0 ? "+" : ""}{e.growth}%
                    </span>
                    <div className="entity-bmc">
                      <span className="bmc-label">BMC</span>
                      <div className="progress-track" style={{ width: 48 }}>
                        <div className="progress-fill" style={{ width: `${e.bmc}%`, background: e.bmc >= 80 ? "linear-gradient(90deg, #10b981, #06d6a0)" : "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
                      </div>
                      <span className="bmc-val">{e.bmc}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dash-section">
            <div className="section-head anim-fade d4">
              <h3 className="section-title">Strategic Triage</h3>
              <button className="section-link" onClick={() => onNavigate("triage")}>
                Detail <ChevronRight size={14} />
              </button>
            </div>
            <div className="triage-preview anim-slide d5">
              {triageSummary.map((t) => (
                <div key={t.label} className="triage-pill">
                  <div className="triage-pill-icon" style={{ color: t.color, background: t.bg }}>{t.icon}</div>
                  <div className="triage-pill-info">
                    <span className="triage-pill-label">{t.label}</span>
                    <span className="triage-pill-entity">{t.entity}</span>
                  </div>
                  <span className="triage-pill-deadline badge" style={{ background: t.bg, color: t.color, borderColor: t.color }}>{t.deadline}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}


      {/* ======================================================== */}
      {/* 2. RENDER TAMPILAN MEMBER (MICRO VIEW - PUNYA BISNIS)    */}
      {/* ======================================================== */}
      {isMember && (
        <>
          <section className="dash-hero anim-scale d1">
            <div className="hero-bg-orb hero-orb-1" style={{ background: 'var(--amber)' }} />
            <div className="hero-bg-orb hero-orb-2" style={{ background: 'var(--accent-primary)' }} />
            <div className="hero-content">
              <p className="hero-label">Status Bisnis Anda</p>
              <h2 className="hero-value" style={{ fontSize: '1.8rem' }}>Kopi Kenangan Senja</h2>
              <div className="hero-change" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <span>Sektor: F&B Retail</span>
              </div>
            </div>
            <div className="hero-ring">
              <svg viewBox="0 0 80 80" className="hero-ring-svg">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${95 * 2.136} ${100 * 2.136}`} transform="rotate(-90 40 40)" />
              </svg>
              <div className="hero-ring-label">
                <span className="hero-ring-value">95</span>
                <span className="hero-ring-sub">BMC Skor</span>
              </div>
            </div>
          </section>

          <section className="dash-section">
            <div className="section-head anim-fade d2">
              <h3 className="section-title">Performa Unit</h3>
            </div>
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
              {MemberKPI.map((k, i) => (
                <div key={k.label} className={`kpi-card card anim-slide d${i + 2}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
                  <div className="flex items-center gap-4">
                    <div className="kpi-icon" style={{ color: k.color, background: k.bg, margin: 0 }}>{k.icon}</div>
                    <div>
                      <p className="kpi-label" style={{ marginBottom: '4px' }}>{k.label}</p>
                      <div className="kpi-value-row">
                        <span className="kpi-value" style={{ fontSize: '1.2rem' }}>{k.value}</span>
                        {k.sub && <span className="kpi-sub">{k.sub}</span>}
                      </div>
                    </div>
                  </div>
                  {k.change && (
                    <span className={`badge ${k.trend === "up" ? "badge-success" : "badge-danger"}`}>
                      {k.trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {k.change}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="dash-section">
            <div className="section-head anim-fade d3">
              <h3 className="section-title">Peluang & Sinergi Jamaah</h3>
            </div>
            <div className="triage-preview anim-slide d4">
              {synergyOpportunities.map((opp, index) => (
                <div key={index} className="triage-pill" style={{ padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="triage-pill-icon" style={{ color: opp.color, background: opp.bg }}>{opp.icon}</div>
                    <span className="triage-pill-label" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{opp.title}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {opp.desc}
                  </p>
                  <button className="badge" style={{ background: opp.bg, color: opp.color, borderColor: opp.color, width: '100%', justifyContent: 'center', marginTop: '4px', padding: '8px' }}>
                    Lihat Detail Kesempatan
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}


      {/* ======================================================== */}
      {/* 3. RENDER TAMPILAN PUBLIC (JAMAAH BIASA)                 */}
      {/* ======================================================== */}
      {isPublic && (
        <>
          <section className="dash-hero anim-scale d1">
            <div className="hero-bg-orb hero-orb-1" style={{ background: 'var(--blue)' }} />
            <div className="hero-bg-orb hero-orb-2" style={{ background: 'var(--accent-primary)' }} />
            <div className="hero-content">
              <p className="hero-label">Direktori Ekonomi</p>
              <h2 className="hero-value" style={{ fontSize: '1.6rem', lineHeight: '1.2', marginTop: '4px' }}>
                Dukung Bisnis <br />Saudara Kita
              </h2>
              <div className="hero-change" style={{ background: 'rgba(255,255,255,0.2)', marginTop: '12px' }}>
                <span>Temukan & Berbelanja di Ekosistem Jamaah</span>
              </div>
            </div>
            <div className="hero-ring">
              <Store size={48} style={{ color: 'rgba(255,255,255,0.8)', opacity: 0.8 }} />
            </div>
          </section>

          <section className="dash-section">
            <div className="section-head anim-fade d2">
              <h3 className="section-title">Aksi Cepat</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 anim-slide d3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="card" onClick={() => onNavigate("entities")} style={{ padding: '16px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'var(--blue-glow)', padding: '12px', borderRadius: '50%', color: 'var(--blue)' }}>
                  <Building2 size={24} />
                </div>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold' }}>Daftar Bisnis</h4>
              </div>
              
              <div className="card" onClick={() => onNavigate("map")} style={{ padding: '16px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'var(--amber-glow)', padding: '12px', borderRadius: '50%', color: 'var(--amber)' }}>
                  <Map size={24} /> {/* Pastikan di atas kau import Map dari lucide-react kalau error ya wak! */}
                </div>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold' }}>Peta Lokasi</h4>
              </div>
            </div>
          </section>

          <section className="dash-section mt-4">
            <div className="card anim-slide d4" style={{ padding: '24px 20px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
              <Store size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>Punya Usaha Sendiri?</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                Jadilah bagian dari ekosistem ekonomi Jamaah.net untuk mendapatkan eksposur pasar dan insight pengembangan bisnis dari Pusat.
              </p>
              <button 
                className="badge" 
                style={{ background: 'var(--accent-primary)', color: 'white', padding: '10px 20px', fontSize: '12px', width: '100%', justifyContent: 'center', fontWeight: 'bold' }}
              >
                Daftar Jadi Member Aggregator
              </button>
            </div>
          </section>
        </>
      )}

    </div>
  );
}