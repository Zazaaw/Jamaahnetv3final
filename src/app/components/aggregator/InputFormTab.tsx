"use client";

import React, { useState } from "react";
import {
  FilePlus,
  Building2,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  User,
  Phone,
  Users,
  Cog,
  Gem,
  Target,
  RotateCcw,
  Send,
  CheckCircle2,
} from "lucide-react";
import "./InputFormTab.css";

const sectorOptions = ["Tech", "F&B", "Retail", "Service", "Manufaktur", "Lainnya"];

export default function InputFormTab() {
  const [submitted, setSubmitted] = useState(false);
  const [bmcScore, setBmcScore] = useState(50);

  const [form, setForm] = useState({
    name: "",
    sector: "",
    description: "",
    revenue: "",
    growth: "",
    location: "",
    owner: "",
    contact: "",
    keyPartners: "",
    keyActivities: "",
    valuePropositions: "",
    customerSegments: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleReset = () => {
    setForm({
      name: "",
      sector: "",
      description: "",
      revenue: "",
      growth: "",
      location: "",
      owner: "",
      contact: "",
      keyPartners: "",
      keyActivities: "",
      valuePropositions: "",
      customerSegments: "",
    });
    setBmcScore(50);
  };

  if (submitted) {
    return (
      <div className="input-form">
        <div className="success-screen anim-scale">
          <div className="success-icon-wrap">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="success-title">Data Berhasil Dikirim!</h2>
          <p className="success-sub">
            Data bisnis dan BMC akan segera diproses oleh sistem aggregator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="input-form">
      <header className="form-header anim-fade">
        <div>
          <h1 className="form-title">Input Data</h1>
          <p className="form-subtitle">Formulir Data Bisnis & BMC</p>
        </div>
        <div className="form-header-icon">
          <FilePlus size={22} />
        </div>
      </header>

      {/* Business Data Section */}
      <section className="form-section anim-slide d1">
        <div className="form-section-head">
          <Building2 size={16} />
          <h3>Data Bisnis</h3>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Briefcase size={14} />
            Nama Bisnis / Entitas
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Contoh: TechFlow Solutions"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FileText size={14} />
            Sektor
          </label>
          <div className="sector-chips">
            {sectorOptions.map((s) => (
              <button
                key={s}
                className={`sector-chip ${form.sector === s ? "active" : ""}`}
                onClick={() => handleChange("sector", s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <FileText size={14} />
            Deskripsi Singkat
          </label>
          <textarea
            className="form-textarea"
            placeholder="Jelaskan secara singkat model bisnis..."
            rows={3}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <DollarSign size={14} />
              Revenue (YoY)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Rp 0M"
              value={form.revenue}
              onChange={(e) => handleChange("revenue", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <TrendingUp size={14} />
              Growth Rate (%)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="0%"
              value={form.growth}
              onChange={(e) => handleChange("growth", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <MapPin size={14} />
            Lokasi
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Jakarta, Indonesia"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <User size={14} />
              Nama Owner
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama lengkap"
              value={form.owner}
              onChange={(e) => handleChange("owner", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <Phone size={14} />
              Nomor Kontak
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="08xx-xxxx-xxxx"
              value={form.contact}
              onChange={(e) => handleChange("contact", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* BMC Data Section */}
      <section className="form-section anim-slide d2">
        <div className="form-section-head">
          <Cog size={16} />
          <h3>BMC Data</h3>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Users size={14} />
            Key Partners
          </label>
          <textarea
            className="form-textarea"
            placeholder="Mitra utama bisnis Anda..."
            rows={2}
            value={form.keyPartners}
            onChange={(e) => handleChange("keyPartners", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Cog size={14} />
            Key Activities
          </label>
          <textarea
            className="form-textarea"
            placeholder="Aktivitas kunci yang dijalankan..."
            rows={2}
            value={form.keyActivities}
            onChange={(e) => handleChange("keyActivities", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Gem size={14} />
            Value Propositions
          </label>
          <textarea
            className="form-textarea"
            placeholder="Nilai unik yang ditawarkan..."
            rows={2}
            value={form.valuePropositions}
            onChange={(e) => handleChange("valuePropositions", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Target size={14} />
            Customer Segments
          </label>
          <textarea
            className="form-textarea"
            placeholder="Segmen pelanggan target..."
            rows={2}
            value={form.customerSegments}
            onChange={(e) => handleChange("customerSegments", e.target.value)}
          />
        </div>
      </section>

      {/* BMC Readiness Score */}
      <section className="form-section anim-slide d3">
        <div className="form-section-head">
          <Target size={16} />
          <h3>BMC Readiness Score</h3>
        </div>

        <div className="bmc-slider-wrap">
          <p className="bmc-slider-label">Self Assessment</p>
          <div className="bmc-slider-display">
            <span
              className="bmc-slider-value"
              style={{
                color:
                  bmcScore >= 80
                    ? "#34d399"
                    : bmcScore >= 60
                    ? "#fbbf24"
                    : "#f87171",
              }}
            >
              {bmcScore}
            </span>
            <span className="bmc-slider-max">/ 100</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={bmcScore}
            onChange={(e) => setBmcScore(Number(e.target.value))}
            className="bmc-slider"
            style={{
              // @ts-expect-error CSS custom property
              "--slider-pct": `${bmcScore}%`,
              "--slider-color":
                bmcScore >= 80
                  ? "#10b981"
                  : bmcScore >= 60
                  ? "#f59e0b"
                  : "#ef4444",
            }}
          />
          <div className="bmc-slider-labels">
            <span>Rendah</span>
            <span>Sedang</span>
            <span>Tinggi</span>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <div className="form-actions anim-slide d4">
        <button className="btn-reset" onClick={handleReset} type="button">
          <RotateCcw size={16} />
          Reset
        </button>
        <button className="btn-submit" onClick={handleSubmit} type="button">
          <Send size={16} />
          Submit Data
        </button>
      </div>
    </div>
  );
}
