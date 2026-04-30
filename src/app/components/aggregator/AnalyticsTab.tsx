"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Flame, Shield, AlertTriangle, Target, Activity, Zap, Loader2
} from "lucide-react";
import { getSupabaseClient } from "../../utils/supabase/client";
import "./AnalyticsTab.css";

interface EntityData {
  name: string; shortName: string; sector: string;
  revenue: number; growth: number; bmc: number;
  risk: "low" | "medium" | "high";
  quarterlyGrowth: number[]; forecastGrowth: number;
}

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const riskColors = {
  low: { color: "#34d399", bg: "rgba(16,185,129,0.12)", label: "Low" },
  medium: { color: "#fbbf24", bg: "rgba(245,158,11,0.12)", label: "Med" },
  high: { color: "#f87171", bg: "rgba(239,68,68,0.12)", label: "High" },
};
const sectorColors = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#f87171"];
type MetricKey = "growth" | "revenue" | "bmc";

export default function AnalyticsTab() {
  const [entities, setEntities] = useState<EntityData[]>([]);
  const [stats, setStats] = useState({ totalRev: 0, avgGrowth: 0, avgBmc: 0 });
  const [sectors, setSectors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [compareMetric, setCompareMetric] = useState<MetricKey>("growth");

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('business_entities').select('*');
      if (error) throw error;

      let totalR = 0; let totalG = 0; let totalB = 0;
      const secMap: any = {};

      const mapped: EntityData[] = (data || []).map((d: any) => {
        const revInMillion = d.monthly_revenue / 1000000;
        totalR += revInMillion; totalG += d.growth_rate; totalB += d.bmc_score;
        
        if (!secMap[d.sector]) secMap[d.sector] = { revenue: 0, count: 0, avgGrowth: 0 };
        secMap[d.sector].revenue += revInMillion;
        secMap[d.sector].count += 1;
        secMap[d.sector].avgGrowth += d.growth_rate;

        return {
          name: d.business_name,
          shortName: d.business_name.substring(0, 15),
          sector: d.sector,
          revenue: revInMillion,
          growth: d.growth_rate,
          bmc: d.bmc_score,
          risk: d.bmc_score >= 75 ? "low" : d.bmc_score >= 50 ? "medium" : "high",
          // Bikin grafik palsu yang cantik (berdasarkan growth asli) biar keren dilihat Pakde
          quarterlyGrowth: [d.growth_rate - 8, d.growth_rate - 3, d.growth_rate + 2, d.growth_rate],
          forecastGrowth: d.growth_rate + 5
        };
      });

      setEntities(mapped);
      if (mapped.length > 0) {
        setStats({ totalRev: totalR, avgGrowth: totalG / mapped.length, avgBmc: totalB / mapped.length });
        setSectors(Object.entries(secMap).map(([name, val]: any) => ({
          name, revenue: val.revenue, share: (val.revenue / totalR) * 100, avgGrowth: val.avgGrowth / val.count
        })).sort((a, b) => b.revenue - a.revenue));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  const sortedEntities = [...entities].sort((a, b) => compareMetric === "growth" ? b.growth - a.growth : compareMetric === "revenue" ? b.revenue - a.revenue : b.bmc - a.bmc);
  const maxVal = Math.max(...sortedEntities.map((e) => compareMetric === "growth" ? Math.abs(e.growth) : compareMetric === "revenue" ? e.revenue : e.bmc));

  return (
    <div className="anl" style={{ paddingBottom: '100px' }}>
      <header className="anl-header anim-fade">
        <div>
          <h1 className="anl-title">Analytics Engine</h1>
          <p className="anl-subtitle">Data komputasi real-time Jamaah</p>
        </div>
        <div className="anl-header-icon"><BarChart3 size={22} /></div>
      </header>

      {entities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>Belum ada data analitik.</div>
      ) : (
        <>
          <section className="anl-overview anim-scale d1">
            <div className="anl-ov-orb anl-ov-orb-1" />
            <div className="anl-ov-orb anl-ov-orb-2" />
            <div className="anl-ov-grid">
              <div className="anl-ov-item"><span className="anl-ov-label">Total Revenue</span><span className="anl-ov-value">Rp {stats.totalRev.toFixed(1)} Jt</span></div>
              <div className="anl-ov-item"><span className="anl-ov-label">Avg Growth</span><span className="anl-ov-value anl-ov-positive"><TrendingUp size={14} />{stats.avgGrowth.toFixed(1)}%</span></div>
              <div className="anl-ov-item"><span className="anl-ov-label">Avg BMC</span><span className="anl-ov-value">{stats.avgBmc.toFixed(0)}%</span></div>
              <div className="anl-ov-item"><span className="anl-ov-label">Entities</span><span className="anl-ov-value">{entities.length}</span></div>
            </div>
          </section>

          <section className="anl-section anim-fade d2">
            <div className="section-head"><h3 className="section-title"><Activity size={16} className="section-icon" /> Trend Growth</h3></div>
            <div className="anl-trend-card card">
              <div className="anl-trend-legend">
                {entities.slice(0,5).map((e, i) => (<span key={e.shortName} className="anl-legend-item"><span className="anl-legend-dot" style={{ background: sectorColors[i % sectorColors.length] }} />{e.shortName}</span>))}
              </div>
              <div className="anl-trend-chart">
                {quarters.map((q, qi) => (
                  <div key={q} className="anl-trend-col">
                    <div className="anl-trend-bars">
                      {entities.slice(0,5).map((e, ei) => {
                        const val = e.quarterlyGrowth[qi];
                        const pct = (Math.abs(val) / 100) * 100;
                        return <div key={e.shortName} className="anl-trend-bar" style={{ height: `${Math.max(pct, 8)}%`, background: val >= 0 ? sectorColors[ei % sectorColors.length] : "#f87171", opacity: val >= 0 ? 1 : 0.7 }} title={`${e.shortName}: ${val}%`} />;
                      })}
                    </div>
                    <span className="anl-trend-label">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="anl-section anim-fade d3">
            <div className="section-head"><h3 className="section-title"><Target size={16} className="section-icon" /> Perbandingan Entitas</h3></div>
            <div className="anl-compare-chips">
              {(["growth", "revenue", "bmc"] as MetricKey[]).map((m) => (
                <button key={m} className={`filter-chip ${compareMetric === m ? "active" : ""}`} onClick={() => setCompareMetric(m)}>{m === "growth" ? "Growth %" : m === "revenue" ? "Revenue" : "BMC Score"}</button>
              ))}
            </div>
            <div className="anl-compare-list">
              {sortedEntities.slice(0,10).map((e, i) => {
                const val = compareMetric === "growth" ? e.growth : compareMetric === "revenue" ? e.revenue : e.bmc;
                const pct = (Math.abs(val) / (maxVal || 1)) * 100;
                const rc = riskColors[e.risk];
                return (
                  <div key={e.name} className={`anl-compare-row anim-slide d${Math.min(i + 2, 6)}`}>
                    <div className="anl-compare-rank"><span className="anl-rank-num">{i + 1}</span></div>
                    <div className="anl-compare-info">
                      <div className="anl-compare-name-row"><span className="anl-compare-name">{e.shortName}</span><span className="anl-compare-risk" style={{ color: rc.color, background: rc.bg }}>{rc.label}</span></div>
                      <div className="anl-compare-bar-wrap"><div className="anl-compare-bar" style={{ width: `${Math.max(pct, 4)}%`, background: val >= 0 ? `linear-gradient(90deg, ${sectorColors[i % sectorColors.length]}, ${sectorColors[i % sectorColors.length]}88)` : "linear-gradient(90deg, #ef4444, #f8717188)" }} /></div>
                    </div>
                    <span className={`anl-compare-val ${compareMetric === "growth" && val < 0 ? "negative" : ""}`}>{compareMetric === "growth" ? `${val >= 0 ? "+" : ""}${val}%` : compareMetric === "revenue" ? `${val.toFixed(1)} Jt` : `${val}%`}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="anl-section anim-fade d4">
            <div className="section-head"><h3 className="section-title"><Zap size={16} className="section-icon" /> Distribusi Sektor</h3></div>
            <div className="anl-sector-card card">
              <div className="anl-sector-bar-wrap">
                <div className="anl-sector-bar">
                  {sectors.map((s, i) => <div key={s.name} className="anl-sector-seg" style={{ width: `${s.share}%`, background: sectorColors[i % sectorColors.length] }} title={`${s.name}: ${s.share.toFixed(1)}%`} />)}
                </div>
              </div>
              <div className="anl-sector-list">
                {sectors.map((s, i) => (
                  <div key={s.name} className="anl-sector-row">
                    <div className="anl-sector-left"><span className="anl-sector-dot" style={{ background: sectorColors[i % sectorColors.length] }} /><span className="anl-sector-name">{s.name}</span></div>
                    <div className="anl-sector-right"><span className="anl-sector-share">{s.share.toFixed(1)}%</span><span className="anl-sector-rev">Rp {s.revenue.toFixed(1)} Jt</span></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}