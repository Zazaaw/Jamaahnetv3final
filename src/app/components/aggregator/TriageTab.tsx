"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Zap,
  Rocket,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  Lightbulb,
  MapPin,
  Loader2
} from "lucide-react";
import { getSupabaseClient } from "../../utils/supabase/client";
import "./TriageTab.css";

// 1. TAMBAHIN ai_insight DI SINI WAK
interface BusinessEntity {
  id: string;
  business_name: string;
  sector: string;
  monthly_revenue: number;
  growth_rate: number;
  bmc_score: number;
  health_status: string;
  ai_insight?: string; 
  bmc_details: { needs: string; offers: string };
}

export default function TriageTab() {
  const [entities, setEntities] = useState<BusinessEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('business_entities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      console.error("Error fetching entities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // MESIN TRIAGE OTOMATIS
  const getTriageData = (entities: BusinessEntity[]) => {
    return entities.map((entity) => {
      // 1. URGENT REVIEW (Merah)
      if (entity.bmc_score < 50 || entity.growth_rate < 0) {
        return {
          priority: "URGENT",
          label: "Urgent Review",
          entity: entity.business_name,
          sector: entity.sector,
          ai_insight: entity.ai_insight, // Oper data AI ke kartu
          deadline: "Segera",
          color: "#f87171",
          colorBg: "rgba(239,68,68,0.12)",
          border: "rgba(239,68,68,0.25)",
          icon: <ShieldAlert size={20} />,
          problems: [
            { icon: entity.growth_rate < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />, text: `Growth ${entity.growth_rate}%` },
            { icon: <AlertOctagon size={13} />, text: `BMC ${entity.bmc_score}% — Perlu review model bisnis` },
          ],
          actions: [
            "Audit kelayakan bisnis",
            "Evaluasi efisiensi operasional",
            `Bantu penuhi: ${entity.bmc_details?.needs || 'Kebutuhan belum diupdate'}`
          ],
        };
      }
      
      // 2. STRATEGIC EXPANSION (Biru) - Bisnis Sehat & Skalabel
      if (entity.bmc_score >= 75 && entity.growth_rate > 5) {
        return {
          priority: "EXPANSION",
          label: "Strategic Expansion",
          entity: entity.business_name,
          sector: entity.sector,
          ai_insight: entity.ai_insight, // Oper data AI ke kartu
          deadline: "30 Hari",
          color: "#60a5fa",
          colorBg: "rgba(59,130,246,0.12)",
          border: "rgba(59,130,246,0.25)",
          icon: <Rocket size={20} />,
          problems: [
            { icon: <MapPin size={13} />, text: "Kandidat ekspansi wilayah baru" },
            { icon: <TrendingUp size={13} />, text: "Fundamental & Cashflow solid" },
          ],
          actions: [
            "Market feasibility study",
            "Tawarkan sistem Franchise / Cabang",
            `Promosikan: ${entity.bmc_details?.offers || 'Produk/Jasa ke jamaah lain'}`
          ],
        };
      }

      // 3. GOLDEN OPPORTUNITY (Kuning) - Potensi bagus tapi belum matang
      return {
        priority: "OPPORTUNITY",
        label: "Golden Opportunity",
        entity: entity.business_name,
        sector: entity.sector,
        ai_insight: entity.ai_insight, // Oper data AI ke kartu
        deadline: "7 Hari",
        color: "#fbbf24",
        colorBg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.25)",
        icon: <Zap size={20} />,
        problems: [
          { icon: <TrendingUp size={13} />, text: `Growth ${entity.growth_rate}% — Potensi tinggi` },
          { icon: <Lightbulb size={13} />, text: `BMC ${entity.bmc_score}% — Model bisnis perlu dimatangkan` },
        ],
        actions: [
          "Inkubasi & Mentoring bisnis",
          "Buka akses permodalan ringan",
          `Hubungkan dengan: ${entity.bmc_details?.needs || 'Partner strategis'}`
        ],
      };
    });
  };

  const dynamicTriageItems = getTriageData(entities);

  // Skenario Strategis (Agregasi)
  const urgentCount = dynamicTriageItems.filter(t => t.priority === 'URGENT').length;
  const goldenCount = dynamicTriageItems.filter(t => t.priority === 'OPPORTUNITY').length;
  const expansionCount = dynamicTriageItems.filter(t => t.priority === 'EXPANSION').length;

  const scenarios = [
    {
      title: "Scale-Up & Duplikasi Bisnis",
      subtitle: "Mendongkrak omset ekosistem Jamaah",
      entities: dynamicTriageItems.filter(t => t.priority === 'EXPANSION').map(t => t.entity).slice(0, 3),
      condition: `${expansionCount} Bisnis siap diekspansi`,
      actions: ["Injeksi Modal Skala Besar", "Buka Cabang Bersama"],
      color: "#34d399",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      title: "Program Penyelamatan & Inkubasi",
      subtitle: "Menekan angka kegagalan usaha jamaah",
      entities: dynamicTriageItems.filter(t => t.priority === 'URGENT').map(t => t.entity).slice(0, 3),
      condition: `${urgentCount} Bisnis butuh intervensi`,
      actions: ["Mentoring Gratis", "Restrukturisasi Bisnis", "Bantuan Supply Chain"],
      color: "#f87171",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.2)",
    },
  ];

  return (
    <div className="triage" style={{ paddingBottom: '100px' }}>
      <header className="triage-header anim-fade">
        <div>
          <h1 className="triage-title">Strategic Triage</h1>
          <p className="triage-subtitle">
            Mesin klasifikasi otomatis berdasarkan kesehatan bisnis
          </p>
        </div>
        <div className="triage-header-icon">
          <ShieldAlert size={22} />
        </div>
      </header>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : dynamicTriageItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <AlertOctagon size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p>Belum ada data bisnis yang masuk dari member.</p>
        </div>
      ) : (
        <>
          {/* Triage Cards List */}
          <div className="triage-list">
            {dynamicTriageItems.map((t, i) => (
              <div
                key={i}
                className={`triage-card anim-slide d${i % 5 + 1}`}
                style={{
                  borderColor: t.border,
                  // @ts-expect-error CSS custom property
                  "--card-accent": t.color,
                }}
              >
                {/* Priority strip */}
                <div className="triage-strip" style={{ background: t.color }} />

                <div className="triage-card-body">
                  {/* Top row */}
                  <div className="triage-card-top">
                    <div className="triage-card-icon" style={{ color: t.color, background: t.colorBg }}>
                      {t.icon}
                    </div>
                    <div className="triage-card-head">
                      <span className="triage-priority-tag" style={{ color: t.color }}>{t.priority}</span>
                      <h3 className="triage-card-title">{t.label}</h3>
                    </div>
                    <div className="triage-deadline" style={{ background: t.colorBg, color: t.color }}>
                      <Clock size={11} /> {t.deadline}
                    </div>
                  </div>

                  {/* Entity */}
                  <div className="triage-entity-row">
                    <span className="triage-entity-name">{t.entity}</span>
                    <span className="triage-entity-sector">{t.sector}</span>
                  </div>

                  {/* Problems */}
                  <div className="triage-problems">
                    {t.problems.map((p, j) => (
                      <div key={j} className="triage-problem" style={{ color: t.color }}>
                        {p.icon} <span>{p.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="triage-actions">
                    <span className="triage-actions-label">Rekomendasi Aksi</span>
                    {t.actions.map((a, j) => (
                      <div key={j} className="triage-action-item">
                        <CheckCircle2 size={13} /> <span>{a}</span>
                      </div>
                    ))}
                  </div>

                  {/* --- AI INSIGHT UNTUK ADMIN PUSAT --- */}
                  {t.ai_insight && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                        <Zap size={14} /> Analisis AI Pusat
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                        {t.ai_insight}
                      </p>
                    </div>
                  )}
                  {/* ------------------------------------- */}

                </div>
              </div>
            ))}
          </div>

          {/* Scenarios - Dinamis berdasarkan jumlah data */}
          <section className="triage-section anim-fade d4">
            <h3 className="triage-section-title">Program Agregasi Nasional</h3>
            <div className="scenario-list">
              {scenarios.map((s) => (
                <div key={s.title} className="scenario-card" style={{ borderColor: s.border, background: s.bg }}>
                  <h4 className="scenario-title" style={{ color: s.color }}>{s.title}</h4>
                  <p className="scenario-sub">{s.subtitle}</p>
                  
                  {s.entities.length > 0 ? (
                    <div className="scenario-entities">
                      {s.entities.map((e) => (
                        <span key={e} className="scenario-entity-chip">{e}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0' }}>Belum ada kandidat bisnis</p>
                  )}
                  
                  <p className="scenario-condition">
                    <ArrowRight size={12} /> {s.condition}
                  </p>
                  <div className="scenario-actions">
                    {s.actions.map((a) => (
                      <span key={a} className="scenario-action-chip">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}