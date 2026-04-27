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
  Rocket,
} from "lucide-react";
import "./DashboardTab.css";

/* ── static mock data (from panduan.md) ── */
const KPI = [
  {
    label: "Portfolio Value",
    value: "Rp 71.8M",
    change: "+17.7%",
    trend: "up" as const,
    icon: <DollarSign size={18} />,
    color: "var(--accent-primary)",
    bg: "var(--accent-glow)",
  },
  {
    label: "Active Entities",
    value: "3",
    sub: "of 5 total",
    icon: <Building2 size={18} />,
    color: "var(--blue)",
    bg: "var(--blue-glow)",
  },
  {
    label: "Avg Growth",
    value: "17.7%",
    change: "vs Q1 2025",
    trend: "up" as const,
    icon: <TrendingUp size={18} />,
    color: "var(--amber)",
    bg: "var(--amber-glow)",
  },
  {
    label: "Health Index",
    value: "61",
    sub: "/ 100",
    icon: <HeartPulse size={18} />,
    color: "var(--red)",
    bg: "var(--red-glow)",
  },
];

const topEntities = [
  {
    name: "TechFlow Solutions",
    sector: "Tech",
    revenue: "24.5M",
    growth: 24.5,
    bmc: 85,
    risk: "low",
  },
  {
    name: "Kopi Kenangan Senja",
    sector: "F&B",
    revenue: "18.2M",
    growth: 15.8,
    bmc: 95,
    risk: "low",
  },
  {
    name: "DataNexus AI",
    sector: "Tech",
    revenue: "5.3M",
    growth: 42.1,
    bmc: 40,
    risk: "high",
  },
];

const triageSummary = [
  {
    label: "Urgent Review",
    entity: "Clean & Bright",
    deadline: "2 Hari",
    color: "var(--red)",
    bg: "var(--red-glow)",
    icon: <ShieldAlert size={16} />,
  },
  {
    label: "Golden Opportunity",
    entity: "DataNexus AI",
    deadline: "7 Hari",
    color: "var(--amber)",
    bg: "var(--amber-glow)",
    icon: <Zap size={16} />,
  },
  {
    label: "Strategic Expansion",
    entity: "Bali, Medan",
    deadline: "30 Hari",
    color: "var(--blue)",
    bg: "var(--blue-glow)",
    icon: <Rocket size={16} />,
  },
];

export default function DashboardTab({
  onNavigate,
}: {
  onNavigate: (t: TabId) => void;
}) {
  return (
    <div className="dash">
      {/* Header */}
      <header className="dash-header anim-fade">
        <div className="dash-header-left">
          <p className="dash-greeting">Selamat Datang,</p>
          <h1 className="dash-name">Admin Hidayatullah</h1>
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

      {/* Hero Card */}
      <section className="dash-hero anim-scale d1">
        <div className="hero-bg-orb hero-orb-1" />
        <div className="hero-bg-orb hero-orb-2" />
        <div className="hero-content">
          <p className="hero-label">Total Portofolio</p>
          <h2 className="hero-value">
            Rp 71.8<span className="hero-unit">M</span>
          </h2>
          <div className="hero-change">
            <TrendingUp size={14} />
            <span>+17.7% YoY</span>
          </div>
        </div>
        <div className="hero-ring">
          <svg viewBox="0 0 80 80" className="hero-ring-svg">
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="5"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="url(#heroGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${61 * 2.136} ${100 * 2.136}`}
              transform="rotate(-90 40 40)"
            />
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

      {/* KPI Grid */}
      <section className="dash-section">
        <div className="section-head anim-fade d2">
          <h3 className="section-title">KPI Utama</h3>
        </div>
        <div className="kpi-grid">
          {KPI.map((k, i) => (
            <div
              key={k.label}
              className={`kpi-card card anim-slide d${i + 2}`}
            >
              <div
                className="kpi-icon"
                style={{ color: k.color, background: k.bg }}
              >
                {k.icon}
              </div>
              <p className="kpi-label">{k.label}</p>
              <div className="kpi-value-row">
                <span className="kpi-value">{k.value}</span>
                {k.sub && <span className="kpi-sub">{k.sub}</span>}
              </div>
              {k.change && (
                <span
                  className={`badge ${
                    k.trend === "up" ? "badge-success" : "badge-danger"
                  }`}
                >
                  {k.trend === "up" ? (
                    <TrendingUp size={10} />
                  ) : (
                    <TrendingDown size={10} />
                  )}
                  {k.change}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Top Entities */}
      <section className="dash-section">
        <div className="section-head anim-fade d3">
          <h3 className="section-title">Top Entitas</h3>
          <button
            className="section-link"
            onClick={() => onNavigate("entities")}
          >
            Lihat Semua <ChevronRight size={14} />
          </button>
        </div>
        <div className="entity-list">
          {topEntities.map((e, i) => (
            <div key={e.name} className={`entity-row card anim-slide d${i + 3}`}>
              <div className="entity-avatar">
                <span>{e.name.charAt(0)}</span>
              </div>
              <div className="entity-info">
                <h4 className="entity-name">{e.name}</h4>
                <p className="entity-meta">
                  {e.sector} · Rp {e.revenue}
                </p>
              </div>
              <div className="entity-metrics">
                <span
                  className={`entity-growth ${
                    e.growth >= 0 ? "positive" : "negative"
                  }`}
                >
                  {e.growth >= 0 ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {e.growth >= 0 ? "+" : ""}
                  {e.growth}%
                </span>
                <div className="entity-bmc">
                  <span className="bmc-label">BMC</span>
                  <div className="progress-track" style={{ width: 48 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${e.bmc}%`,
                        background:
                          e.bmc >= 80
                            ? "linear-gradient(90deg, #10b981, #06d6a0)"
                            : e.bmc >= 60
                            ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                            : "linear-gradient(90deg, #ef4444, #f87171)",
                      }}
                    />
                  </div>
                  <span className="bmc-val">{e.bmc}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Triage Preview */}
      <section className="dash-section">
        <div className="section-head anim-fade d4">
          <h3 className="section-title">Strategic Triage</h3>
          <button
            className="section-link"
            onClick={() => onNavigate("triage")}
          >
            Detail <ChevronRight size={14} />
          </button>
        </div>
        <div className="triage-preview anim-slide d5">
          {triageSummary.map((t) => (
            <div key={t.label} className="triage-pill">
              <div
                className="triage-pill-icon"
                style={{ color: t.color, background: t.bg }}
              >
                {t.icon}
              </div>
              <div className="triage-pill-info">
                <span className="triage-pill-label">{t.label}</span>
                <span className="triage-pill-entity">{t.entity}</span>
              </div>
              <span
                className="triage-pill-deadline badge"
                style={{
                  background: t.bg,
                  color: t.color,
                  borderColor: t.color,
                }}
              >
                {t.deadline}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Intelligence Loop */}
      <section className="dash-section">
        <div className="section-head anim-fade d5">
          <h3 className="section-title">Intelligence Loop</h3>
        </div>
        <div className="loop-flow anim-slide d6">
          {[
            {
              step: "1",
              title: "Sinyal Pasar",
              desc: "Data real-time dari aktivitas bisnis",
              icon: <Activity size={18} />,
            },
            {
              step: "2",
              title: "Kalkulasi",
              desc: "Pemetaan ke Strategic Matrix",
              icon: <Zap size={18} />,
            },
            {
              step: "3",
              title: "Triage",
              desc: "Prioritas aksi otomatis",
              icon: <ShieldAlert size={18} />,
            },
            {
              step: "4",
              title: "Eksekusi",
              desc: "Intervensi strategis Admin",
              icon: <Rocket size={18} />,
            },
          ].map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="loop-step">
                <div className="loop-step-icon">{s.icon}</div>
                <div className="loop-step-content">
                  <span className="loop-step-num">0{s.step}</span>
                  <h4 className="loop-step-title">{s.title}</h4>
                  <p className="loop-step-desc">{s.desc}</p>
                </div>
              </div>
              {i < 3 && <div className="loop-connector" />}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}
