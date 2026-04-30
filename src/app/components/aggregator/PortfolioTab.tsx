"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  Shield, AlertTriangle, Flame, Layers, Loader2
} from "lucide-react";
import { getSupabaseClient } from "../../utils/supabase/client";
import "./PortfolioTab.css";

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

const riskConfig = {
  low: { label: "Low Risk", color: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.2)", icon: <Shield size={14} /> },
  medium: { label: "Medium Risk", color: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.2)", icon: <AlertTriangle size={14} /> },
  high: { label: "High Risk", color: "#f87171", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.2)", icon: <Flame size={14} /> },
};

type FilterKey = "all" | "low" | "medium" | "high";

export default function PortfolioTab() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const { data, error } = await supabase.from('business_entities').select('*').order('bmc_score', { ascending: false });
      if (error) throw error;
      
      const mapped: Entity[] = (data || []).map((d: any) => ({
        name: d.business_name,
        sector: d.sector,
        // Format uang rapi (Jt atau Milyar)
        revenue: d.monthly_revenue >= 1000000000 ? `${(d.monthly_revenue / 1000000000).toFixed(1)}M` : `${(d.monthly_revenue / 1000000).toFixed(1)} Jt`,
        growth: d.growth_rate,
        bmc: d.bmc_score,
        risk: d.bmc_score >= 75 ? "low" : d.bmc_score >= 50 ? "medium" : "high",
        status: d.health_status || "Active",
        description: d.bmc_details?.offers ? `Menawarkan: ${d.bmc_details.offers}` : `Bisnis di sektor ${d.sector}`
      }));
      setEntities(mapped);
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = filter === "all" ? entities : entities.filter((e) => e.risk === filter);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><Loader2 className="animate-spin text-purple-500" size={40} /></div>;
  }

  return (
    <div className="port" style={{ paddingBottom: '100px' }}>
      <header className="port-header anim-fade">
        <div>
          <h1 className="port-title">Portfolio Entitas</h1>
          <p className="port-subtitle">{entities.length} bisnis terdaftar dalam ekosistem</p>
        </div>
        <div className="port-header-icon"><Layers size={22} /></div>
      </header>

      {entities.length > 0 && (
        <section className="matrix-card card anim-scale d1">
          <h3 className="matrix-title">Matriks Posisi Strategis</h3>
          <div className="matrix-grid">
            <div className="matrix-y-label"><span>BMC Score (%)</span></div>
            <div className="matrix-plot">
              {entities.map((e) => {
                const x = Math.min(Math.max((e.growth + 10) / 60, 0), 1) * 100;
                const y = (1 - e.bmc / 100) * 100;
                const rc = riskConfig[e.risk];
                return (
                  <div key={e.name} className="matrix-dot" style={{ left: `${x}%`, top: `${y}%`, background: rc.color, boxShadow: `0 0 8px ${rc.bg}` }} title={e.name}>
                    <span className="matrix-dot-label">{e.name.charAt(0)}</span>
                  </div>
                );
              })}
              <div className="matrix-line-h" /><div className="matrix-line-v" />
              <span className="matrix-q q-tl">Stars</span><span className="matrix-q q-tr">Scale-Up</span>
              <span className="matrix-q q-bl">Watch</span><span className="matrix-q q-br">Incubate</span>
            </div>
            <div className="matrix-x-label"><span>Growth Rate (%)</span></div>
          </div>
        </section>
      )}

      <div className="filter-row anim-fade d2">
        {(["all", "low", "medium", "high"] as FilterKey[]).map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""} ${f !== "all" ? `chip-${f}` : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "Semua" : f === "low" ? "Low Risk" : f === "medium" ? "Medium" : "High Risk"}
          </button>
        ))}
      </div>

      <div className="port-list">
        {filtered.map((e, i) => {
          const rc = riskConfig[e.risk];
          const isOpen = expanded === e.name;
          return (
            <div key={e.name} className={`port-card card anim-slide d${Math.min(i + 2, 6)}`}>
              <button className="port-card-main" onClick={() => setExpanded(isOpen ? null : e.name)}>
                <div className="port-card-avatar" style={{ borderColor: rc.border }}>{e.name.charAt(0).toUpperCase()}</div>
                <div className="port-card-info">
                  <h4 className="port-card-name">{e.name}</h4>
                  <div className="port-card-tags">
                    <span className="tag tag-sector">{e.sector}</span>
                    <span className="tag" style={{ background: rc.bg, color: rc.color, borderColor: rc.border }}>{rc.icon} {rc.label}</span>
                  </div>
                </div>
                <div className="port-card-chevron">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
              </button>

              {isOpen && (
                <div className="port-card-detail anim-slide">
                  <p className="port-detail-desc">{e.description}</p>
                  <div className="port-detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Revenue</span>
                      <span className="detail-value">{e.revenue}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Growth</span>
                      <span className={`detail-value ${e.growth >= 0 ? "positive" : "negative"}`}>
                        {e.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {e.growth >= 0 ? "+" : ""}{e.growth}%
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">BMC Readiness</span>
                      <div className="detail-bmc">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${e.bmc}%`, background: e.bmc >= 80 ? "linear-gradient(90deg, #10b981, #06d6a0)" : e.bmc >= 60 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #ef4444, #f87171)" }} />
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