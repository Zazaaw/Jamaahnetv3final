"use client";

import React, { useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Flame, Shield, AlertTriangle, Target, Activity, Zap,
} from "lucide-react";
import "./AnalyticsTab.css";

interface EntityData {
  name: string; shortName: string; sector: string;
  revenue: number; growth: number; bmc: number;
  risk: "low" | "medium" | "high";
  quarterlyGrowth: number[]; forecastGrowth: number;
}

const entities: EntityData[] = [
  { name: "TechFlow Solutions", shortName: "TechFlow", sector: "Tech", revenue: 24.5, growth: 24.5, bmc: 85, risk: "low", quarterlyGrowth: [12.3, 18.1, 21.6, 24.5], forecastGrowth: 28.2 },
  { name: "Kopi Kenangan Senja", shortName: "KKS", sector: "F&B", revenue: 18.2, growth: 15.8, bmc: 95, risk: "low", quarterlyGrowth: [10.4, 11.9, 14.2, 15.8], forecastGrowth: 18.5 },
  { name: "Urban Style Wear", shortName: "USW", sector: "Retail", revenue: 15.1, growth: 8.4, bmc: 75, risk: "medium", quarterlyGrowth: [5.2, 6.8, 7.1, 8.4], forecastGrowth: 10.2 },
  { name: "Clean & Bright", shortName: "C&B", sector: "Service", revenue: 8.7, growth: -2.3, bmc: 60, risk: "high", quarterlyGrowth: [3.1, 1.2, -0.8, -2.3], forecastGrowth: -1.0 },
  { name: "DataNexus AI", shortName: "DNAI", sector: "Tech", revenue: 5.3, growth: 42.1, bmc: 40, risk: "high", quarterlyGrowth: [18.5, 25.3, 34.7, 42.1], forecastGrowth: 55.0 },
];

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const riskColors = {
  low: { color: "#34d399", bg: "rgba(16,185,129,0.12)", label: "Low" },
  medium: { color: "#fbbf24", bg: "rgba(245,158,11,0.12)", label: "Med" },
  high: { color: "#f87171", bg: "rgba(239,68,68,0.12)", label: "High" },
};
const sectorColors = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#f87171"];
const totalRevenue = entities.reduce((s, e) => s + e.revenue, 0);
const avgGrowth = entities.reduce((s, e) => s + e.growth, 0) / entities.length;
const avgBmc = entities.reduce((s, e) => s + e.bmc, 0) / entities.length;

const sectorMap = entities.reduce<Record<string, { revenue: number; count: number; avgGrowth: number }>>((acc, e) => {
  if (!acc[e.sector]) acc[e.sector] = { revenue: 0, count: 0, avgGrowth: 0 };
  acc[e.sector].revenue += e.revenue;
  acc[e.sector].count += 1;
  acc[e.sector].avgGrowth += e.growth;
  return acc;
}, {});

const sectors = Object.entries(sectorMap)
  .map(([name, d]) => ({ name, revenue: d.revenue, share: (d.revenue / totalRevenue) * 100, avgGrowth: d.avgGrowth / d.count }))
  .sort((a, b) => b.revenue - a.revenue);

type MetricKey = "growth" | "revenue" | "bmc";

export default function AnalyticsTab() {
  const [compareMetric, setCompareMetric] = useState<MetricKey>("growth");

  const sortedEntities = [...entities].sort((a, b) => {
    if (compareMetric === "growth") return b.growth - a.growth;
    if (compareMetric === "revenue") return b.revenue - a.revenue;
    return b.bmc - a.bmc;
  });

  const maxVal = Math.max(...sortedEntities.map((e) =>
    compareMetric === "growth" ? Math.abs(e.growth) : compareMetric === "revenue" ? e.revenue : e.bmc
  ));

  return (
    <div className="anl">
      <header className="anl-header anim-fade">
        <div>
          <h1 className="anl-title">Analytics</h1>
          <p className="anl-subtitle">Analisis mendalam lintas entitas</p>
        </div>
        <div className="anl-header-icon"><BarChart3 size={22} /></div>
      </header>

      {/* Overview KPIs */}
      <section className="anl-overview anim-scale d1">
        <div className="anl-ov-orb anl-ov-orb-1" />
        <div className="anl-ov-orb anl-ov-orb-2" />
        <div className="anl-ov-grid">
          <div className="anl-ov-item">
            <span className="anl-ov-label">Total Revenue</span>
            <span className="anl-ov-value">Rp {totalRevenue.toFixed(1)}M</span>
          </div>
          <div className="anl-ov-item">
            <span className="anl-ov-label">Avg Growth</span>
            <span className="anl-ov-value anl-ov-positive"><TrendingUp size={14} />{avgGrowth.toFixed(1)}%</span>
          </div>
          <div className="anl-ov-item">
            <span className="anl-ov-label">Avg BMC</span>
            <span className="anl-ov-value">{avgBmc.toFixed(0)}%</span>
          </div>
          <div className="anl-ov-item">
            <span className="anl-ov-label">Entities</span>
            <span className="anl-ov-value">{entities.length}</span>
          </div>
        </div>
      </section>

      {/* Trend Growth */}
      <section className="anl-section anim-fade d2">
        <div className="section-head">
          <h3 className="section-title"><Activity size={16} className="section-icon" /> Trend Growth</h3>
        </div>
        <div className="anl-trend-card card">
          <div className="anl-trend-legend">
            {entities.map((e, i) => (
              <span key={e.shortName} className="anl-legend-item">
                <span className="anl-legend-dot" style={{ background: sectorColors[i % sectorColors.length] }} />
                {e.shortName}
              </span>
            ))}
          </div>
          <div className="anl-trend-chart">
            {quarters.map((q, qi) => (
              <div key={q} className="anl-trend-col">
                <div className="anl-trend-bars">
                  {entities.map((e, ei) => {
                    const val = e.quarterlyGrowth[qi];
                    const maxQ = Math.max(...entities.map((x) => Math.abs(x.quarterlyGrowth[qi])));
                    const pct = (Math.abs(val) / (maxQ || 1)) * 100;
                    return (
                      <div key={e.shortName} className="anl-trend-bar" style={{
                        height: `${Math.max(pct, 8)}%`,
                        background: val >= 0 ? sectorColors[ei % sectorColors.length] : "#f87171",
                        opacity: val >= 0 ? 1 : 0.7,
                        animationDelay: `${qi * 100 + ei * 50}ms`,
                      }} title={`${e.shortName}: ${val}%`} />
                    );
                  })}
                </div>
                <span className="anl-trend-label">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Entity Comparison */}
      <section className="anl-section anim-fade d3">
        <div className="section-head">
          <h3 className="section-title"><Target size={16} className="section-icon" /> Perbandingan Entitas</h3>
        </div>
        <div className="anl-compare-chips">
          {(["growth", "revenue", "bmc"] as MetricKey[]).map((m) => (
            <button key={m} className={`filter-chip ${compareMetric === m ? "active" : ""}`} onClick={() => setCompareMetric(m)}>
              {m === "growth" ? "Growth %" : m === "revenue" ? "Revenue" : "BMC Score"}
            </button>
          ))}
        </div>
        <div className="anl-compare-list">
          {sortedEntities.map((e, i) => {
            const val = compareMetric === "growth" ? e.growth : compareMetric === "revenue" ? e.revenue : e.bmc;
            const pct = (Math.abs(val) / (maxVal || 1)) * 100;
            const rc = riskColors[e.risk];
            return (
              <div key={e.name} className={`anl-compare-row anim-slide d${Math.min(i + 2, 6)}`}>
                <div className="anl-compare-rank"><span className="anl-rank-num">{i + 1}</span></div>
                <div className="anl-compare-info">
                  <div className="anl-compare-name-row">
                    <span className="anl-compare-name">{e.shortName}</span>
                    <span className="anl-compare-risk" style={{ color: rc.color, background: rc.bg }}>{rc.label}</span>
                  </div>
                  <div className="anl-compare-bar-wrap">
                    <div className="anl-compare-bar" style={{
                      width: `${Math.max(pct, 4)}%`,
                      background: val >= 0
                        ? `linear-gradient(90deg, ${sectorColors[i % sectorColors.length]}, ${sectorColors[i % sectorColors.length]}88)`
                        : "linear-gradient(90deg, #ef4444, #f8717188)",
                    }} />
                  </div>
                </div>
                <span className={`anl-compare-val ${compareMetric === "growth" && val < 0 ? "negative" : ""}`}>
                  {compareMetric === "growth" ? `${val >= 0 ? "+" : ""}${val}%` : compareMetric === "revenue" ? `${val}M` : `${val}%`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sector Breakdown */}
      <section className="anl-section anim-fade d4">
        <div className="section-head">
          <h3 className="section-title"><Zap size={16} className="section-icon" /> Distribusi Sektor</h3>
        </div>
        <div className="anl-sector-card card">
          <div className="anl-sector-bar-wrap">
            <div className="anl-sector-bar">
              {sectors.map((s, i) => (
                <div key={s.name} className="anl-sector-seg" style={{ width: `${s.share}%`, background: sectorColors[i % sectorColors.length] }} title={`${s.name}: ${s.share.toFixed(1)}%`} />
              ))}
            </div>
          </div>
          <div className="anl-sector-list">
            {sectors.map((s, i) => (
              <div key={s.name} className="anl-sector-row">
                <div className="anl-sector-left">
                  <span className="anl-sector-dot" style={{ background: sectorColors[i % sectorColors.length] }} />
                  <span className="anl-sector-name">{s.name}</span>
                </div>
                <div className="anl-sector-right">
                  <span className="anl-sector-share">{s.share.toFixed(1)}%</span>
                  <span className="anl-sector-rev">Rp {s.revenue.toFixed(1)}M</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Heatmap */}
      <section className="anl-section anim-fade d5">
        <div className="section-head">
          <h3 className="section-title"><Flame size={16} className="section-icon" /> Risk Heatmap</h3>
        </div>
        <div className="anl-heat-grid">
          {entities.map((e) => {
            const rc = riskColors[e.risk];
            const heatScore = (e.risk === "high" ? 90 : e.risk === "medium" ? 55 : 20) + (e.growth < 0 ? 15 : 0) - e.bmc * 0.2;
            const clampedHeat = Math.min(Math.max(heatScore, 0), 100);
            return (
              <div key={e.name} className="anl-heat-cell card">
                <div className="anl-heat-top">
                  <span className="anl-heat-name">{e.shortName}</span>
                  <span className="anl-heat-risk" style={{ color: rc.color, background: rc.bg }}>
                    {e.risk === "low" ? <Shield size={11} /> : e.risk === "medium" ? <AlertTriangle size={11} /> : <Flame size={11} />}
                    {rc.label}
                  </span>
                </div>
                <div className="anl-heat-bar-wrap">
                  <div className="anl-heat-bar" style={{
                    width: `${clampedHeat}%`,
                    background: clampedHeat > 60 ? "linear-gradient(90deg, #ef4444, #f87171)" : clampedHeat > 35 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #10b981, #34d399)",
                  }} />
                </div>
                <div className="anl-heat-metrics">
                  <span className="anl-heat-metric">Growth: <b style={{ color: e.growth >= 0 ? "#34d399" : "#f87171" }}>{e.growth >= 0 ? "+" : ""}{e.growth}%</b></span>
                  <span className="anl-heat-metric">BMC: <b>{e.bmc}%</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Forecast */}
      <section className="anl-section anim-fade d6">
        <div className="section-head">
          <h3 className="section-title"><TrendingUp size={16} className="section-icon" /> Forecast Q1 2026</h3>
        </div>
        <div className="anl-forecast-list">
          {entities.map((e) => {
            const diff = e.forecastGrowth - e.growth;
            const isUp = diff >= 0;
            return (
              <div key={e.name} className="anl-forecast-row card">
                <div className="anl-forecast-avatar">{e.shortName.charAt(0)}</div>
                <div className="anl-forecast-info">
                  <span className="anl-forecast-name">{e.shortName}</span>
                  <span className="anl-forecast-sector">{e.sector}</span>
                </div>
                <div className="anl-forecast-data">
                  <div className="anl-forecast-current">
                    <span className="anl-forecast-label">Current</span>
                    <span className={`anl-forecast-val ${e.growth >= 0 ? "positive" : "negative"}`}>{e.growth >= 0 ? "+" : ""}{e.growth}%</span>
                  </div>
                  <div className="anl-forecast-arrow">{isUp ? <ArrowUpRight size={16} color="#34d399" /> : <ArrowDownRight size={16} color="#f87171" />}</div>
                  <div className="anl-forecast-projected">
                    <span className="anl-forecast-label">Forecast</span>
                    <span className={`anl-forecast-val ${e.forecastGrowth >= 0 ? "positive" : "negative"}`}>{e.forecastGrowth >= 0 ? "+" : ""}{e.forecastGrowth}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
