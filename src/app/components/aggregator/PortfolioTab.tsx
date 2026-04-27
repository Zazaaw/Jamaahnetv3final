"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  Flame,
  Layers,
} from "lucide-react";
import "./PortfolioTab.css";

/* ── Entity data from panduan.md ── */
interface Entity {
  name: string;
  sector: string;
  revenue: string;
  growth: number;
  bmc: number;
  risk: "low" | "medium" | "high";
  status: string;
  description: string;
}

const entities: Entity[] = [
  {
    name: "TechFlow Solutions",
    sector: "Tech",
    revenue: "24.5M",
    growth: 24.5,
    bmc: 85,
    risk: "low",
    status: "Active",
    description: "Platform teknologi end-to-end untuk digitalisasi proses bisnis",
  },
  {
    name: "Kopi Kenangan Senja",
    sector: "F&B",
    revenue: "18.2M",
    growth: 15.8,
    bmc: 95,
    risk: "low",
    status: "Active",
    description: "Jaringan kedai kopi premium dengan konsep lokal modern",
  },
  {
    name: "Urban Style Wear",
    sector: "Retail",
    revenue: "15.1M",
    growth: 8.4,
    bmc: 75,
    risk: "medium",
    status: "Active",
    description: "Brand fashion urban untuk segmen millennial dan Gen-Z",
  },
  {
    name: "Clean & Bright",
    sector: "Service",
    revenue: "8.7M",
    growth: -2.3,
    bmc: 60,
    risk: "high",
    status: "Under Review",
    description: "Layanan kebersihan dan maintenance komersial",
  },
  {
    name: "DataNexus AI",
    sector: "Tech",
    revenue: "5.3M",
    growth: 42.1,
    bmc: 40,
    risk: "high",
    status: "Incubation",
    description: "Startup AI/ML untuk analisis data prediktif bisnis",
  },
];

const riskConfig = {
  low: {
    label: "Low Risk",
    color: "#34d399",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.2)",
    icon: <Shield size={14} />,
  },
  medium: {
    label: "Medium Risk",
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.2)",
    icon: <AlertTriangle size={14} />,
  },
  high: {
    label: "High Risk",
    color: "#f87171",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.2)",
    icon: <Flame size={14} />,
  },
};

type FilterKey = "all" | "low" | "medium" | "high";

export default function PortfolioTab() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    filter === "all" ? entities : entities.filter((e) => e.risk === filter);

  return (
    <div className="port">
      <header className="port-header anim-fade">
        <div>
          <h1 className="port-title">Entities</h1>
          <p className="port-subtitle">
            {entities.length} entitas bisnis · 3 aktif
          </p>
        </div>
        <div className="port-header-icon">
          <Layers size={22} />
        </div>
      </header>

      {/* Strategic Matrix Mini */}
      <section className="matrix-card card anim-scale d1">
        <h3 className="matrix-title">Matriks Posisi Strategis</h3>
        <div className="matrix-grid">
          <div className="matrix-y-label">
            <span>BMC Score (%)</span>
          </div>
          <div className="matrix-plot">
            {entities.map((e) => {
              const x = Math.min(Math.max((e.growth + 10) / 60, 0), 1) * 100;
              const y = (1 - e.bmc / 100) * 100;
              const rc = riskConfig[e.risk];
              return (
                <div
                  key={e.name}
                  className="matrix-dot"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    background: rc.color,
                    boxShadow: `0 0 8px ${rc.bg}`,
                  }}
                  title={e.name}
                >
                  <span className="matrix-dot-label">{e.name.charAt(0)}</span>
                </div>
              );
            })}
            {/* Quadrant lines */}
            <div className="matrix-line-h" />
            <div className="matrix-line-v" />
            <span className="matrix-q q-tl">Stars</span>
            <span className="matrix-q q-tr">Scale-Up</span>
            <span className="matrix-q q-bl">Watch</span>
            <span className="matrix-q q-br">Incubate</span>
          </div>
          <div className="matrix-x-label">
            <span>Growth Rate (%)</span>
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <div className="filter-row anim-fade d2">
        {(["all", "low", "medium", "high"] as FilterKey[]).map((f) => {
          const active = filter === f;
          const label =
            f === "all"
              ? "Semua"
              : f === "low"
              ? "Low Risk"
              : f === "medium"
              ? "Medium"
              : "High Risk";
          return (
            <button
              key={f}
              className={`filter-chip ${active ? "active" : ""} ${
                f !== "all" ? `chip-${f}` : ""
              }`}
              onClick={() => setFilter(f)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Entity Cards */}
      <div className="port-list">
        {filtered.map((e, i) => {
          const rc = riskConfig[e.risk];
          const isOpen = expanded === e.name;
          return (
            <div
              key={e.name}
              className={`port-card card anim-slide d${Math.min(i + 2, 6)}`}
            >
              <button
                className="port-card-main"
                onClick={() => setExpanded(isOpen ? null : e.name)}
              >
                <div
                  className="port-card-avatar"
                  style={{ borderColor: rc.border }}
                >
                  {e.name.charAt(0)}
                </div>
                <div className="port-card-info">
                  <h4 className="port-card-name">{e.name}</h4>
                  <div className="port-card-tags">
                    <span className="tag tag-sector">{e.sector}</span>
                    <span
                      className="tag"
                      style={{
                        background: rc.bg,
                        color: rc.color,
                        borderColor: rc.border,
                      }}
                    >
                      {rc.icon} {rc.label}
                    </span>
                  </div>
                </div>
                <div className="port-card-chevron">
                  {isOpen ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="port-card-detail anim-slide">
                  <p className="port-detail-desc">{e.description}</p>
                  <div className="port-detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Revenue</span>
                      <span className="detail-value">Rp {e.revenue}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Growth</span>
                      <span
                        className={`detail-value ${
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
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">BMC Readiness</span>
                      <div className="detail-bmc">
                        <div className="progress-track">
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
                        <span className="detail-bmc-val">{e.bmc}%</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value">{e.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
