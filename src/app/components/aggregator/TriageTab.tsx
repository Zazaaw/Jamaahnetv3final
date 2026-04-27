"use client";

import React from "react";
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
} from "lucide-react";
import "./TriageTab.css";

const triageItems = [
  {
    priority: "URGENT",
    label: "Urgent Review",
    entity: "Clean & Bright",
    sector: "Service",
    deadline: "2 Hari",
    color: "#f87171",
    colorBg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    icon: <ShieldAlert size={20} />,
    problems: [
      { icon: <TrendingDown size={13} />, text: "Growth -2.3% — tren menurun" },
      { icon: <AlertOctagon size={13} />, text: "BMC 60% — perlu review model bisnis" },
    ],
    actions: [
      "Audit BMC dalam 48 jam",
      "Evaluasi cost structure",
      "Tindakan defensif — stabilisasi revenue",
    ],
  },
  {
    priority: "OPPORTUNITY",
    label: "Golden Opportunity",
    entity: "DataNexus AI",
    sector: "Tech",
    deadline: "7 Hari",
    color: "#fbbf24",
    colorBg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    icon: <Zap size={20} />,
    problems: [
      { icon: <TrendingUp size={13} />, text: "Hypergrowth +42.1% — momentum tinggi" },
      { icon: <Lightbulb size={13} />, text: "BMC 40% — model bisnis belum matang" },
    ],
    actions: [
      "Perbaiki model bisnis (BMC Canvas)",
      "Suntikkan modal — capital injection",
      "Tindakan agresif — amankan potensi",
    ],
  },
  {
    priority: "EXPANSION",
    label: "Strategic Expansion",
    entity: "Evaluasi Wilayah Baru",
    sector: "Multi-Sector",
    deadline: "30 Hari",
    color: "#60a5fa",
    colorBg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    icon: <Rocket size={20} />,
    problems: [
      { icon: <MapPin size={13} />, text: "Target: Bali, Medan" },
      { icon: <TrendingUp size={13} />, text: "Leverage entitas yang sudah solid" },
    ],
    actions: [
      "Market feasibility study",
      "Pilot project di wilayah target",
      "Gunakan TechFlow & Kopi Kenangan sebagai basis ekspansi",
    ],
  },
];

const scenarios = [
  {
    title: "Scale-Up Strategy",
    subtitle: "Menumbuhkan bisnis yang sudah solid",
    entities: ["TechFlow Solutions", "Kopi Kenangan Senja"],
    condition: "BMC > 85%, Trend solid",
    actions: ["Cash Cow", "Ekspansi geografis", "Ekspansi lini bisnis"],
    color: "#34d399",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    title: "Incubation & Capital Injection",
    subtitle: "Mengamankan potensi bisnis baru",
    entities: ["DataNexus AI"],
    condition: "Growth +42.1%, BMC rendah 40%",
    actions: ["Perbaiki model bisnis", "Suntikkan modal", "Amankan hypergrowth"],
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
];

export default function TriageTab() {
  return (
    <div className="triage">
      <header className="triage-header anim-fade">
        <div>
          <h1 className="triage-title">Strategic Triage</h1>
          <p className="triage-subtitle">
            Menerjemahkan insight menjadi aksi
          </p>
        </div>
        <div className="triage-header-icon">
          <ShieldAlert size={22} />
        </div>
      </header>

      {/* Triage Cards */}
      <div className="triage-list">
        {triageItems.map((t, i) => (
          <div
            key={t.label}
            className={`triage-card anim-slide d${i + 1}`}
            style={{
              borderColor: t.border,
              // @ts-expect-error CSS custom property
              "--card-accent": t.color,
            }}
          >
            {/* Priority strip */}
            <div
              className="triage-strip"
              style={{ background: t.color }}
            />

            <div className="triage-card-body">
              {/* Top row */}
              <div className="triage-card-top">
                <div
                  className="triage-card-icon"
                  style={{ color: t.color, background: t.colorBg }}
                >
                  {t.icon}
                </div>
                <div className="triage-card-head">
                  <span
                    className="triage-priority-tag"
                    style={{ color: t.color }}
                  >
                    {t.priority}
                  </span>
                  <h3 className="triage-card-title">{t.label}</h3>
                </div>
                <div
                  className="triage-deadline"
                  style={{ background: t.colorBg, color: t.color }}
                >
                  <Clock size={11} />
                  {t.deadline}
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
                  <div
                    key={j}
                    className="triage-problem"
                    style={{ color: t.color }}
                  >
                    {p.icon}
                    <span>{p.text}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="triage-actions">
                <span className="triage-actions-label">Action Items</span>
                {t.actions.map((a, j) => (
                  <div key={j} className="triage-action-item">
                    <CheckCircle2 size={13} />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scenarios */}
      <section className="triage-section anim-fade d4">
        <h3 className="triage-section-title">Skenario Strategis</h3>
        <div className="scenario-list">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="scenario-card"
              style={{ borderColor: s.border, background: s.bg }}
            >
              <h4
                className="scenario-title"
                style={{ color: s.color }}
              >
                {s.title}
              </h4>
              <p className="scenario-sub">{s.subtitle}</p>
              <div className="scenario-entities">
                {s.entities.map((e) => (
                  <span key={e} className="scenario-entity-chip">
                    {e}
                  </span>
                ))}
              </div>
              <p className="scenario-condition">
                <ArrowRight size={12} /> {s.condition}
              </p>
              <div className="scenario-actions">
                {s.actions.map((a) => (
                  <span key={a} className="scenario-action-chip">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
