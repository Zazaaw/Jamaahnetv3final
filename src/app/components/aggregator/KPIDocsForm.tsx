"use client";

import React, { useState } from "react";
import {
  ChevronLeft, BarChart3, Users, FileText,
  DollarSign, TrendingUp, Plus, Trash2, CheckCircle2,
  ShieldCheck, AlertCircle,
} from "lucide-react";
import "./KPIDocsForm.css";
import { getSupabaseClient } from "../../utils/supabase/client";
import { toast } from "sonner@2.0.3";
import { Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type BizDocument = {
  document_type: string;
  document_number: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
};

type KPIState = {
  // Keuangan
  revenue_monthly: string;
  profit_monthly: string;
  gross_margin: string;
  net_margin: string;
  capacity_utilization: string;
  break_even_point: string;
  // Pelanggan
  customer_count: string;
  repeat_customer_rate: string;
  customer_satisfaction_score: string;
  on_time_delivery_rate: string;
  complaint_rate: string;
  // Dokumen
  documents: BizDocument[];
};

const emptyDoc = (): BizDocument => ({
  document_type: "", document_number: "",
  issue_date: "", expiry_date: "", issuing_authority: "",
});

const DOC_TYPES = [
  { value: "NIB", label: "NIB (Nomor Induk Berusaha)" },
  { value: "NPWP", label: "NPWP Badan / Usaha" },
  { value: "SIUP", label: "SIUP / Izin Usaha" },
  { value: "TDP", label: "TDP / Tanda Daftar Perusahaan" },
  { value: "Halal", label: "Sertifikat Halal MUI / BPJPH" },
  { value: "ISO", label: "Sertifikat ISO" },
  { value: "SNI", label: "Sertifikat SNI" },
  { value: "BPOM", label: "Izin Edar BPOM" },
  { value: "Merek", label: "Pendaftaran Merek / HKI" },
  { value: "Lainnya", label: "Dokumen Lainnya" },
];

// ─── Sub-components (local, ringan) ──────────────────────────────────────────
function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kd-fg">
      <label className="kd-label">{label}</label>
      {children}
    </div>
  );
}

function KDInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      className="kd-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function KDSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select className="kd-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Pilih...</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function KDRow({ children }: { children: React.ReactNode }) {
  return <div className="kd-row">{children}</div>;
}

function SectionHead({ icon: Icon, title, color }: {
  icon: React.ComponentType<{ size?: number }>;
  title: string; color: string;
}) {
  return (
    <div className="kd-section-head">
      <div className="kd-section-icon" style={{ background: `${color}1a`, color }}>
        <Icon size={16} />
      </div>
      <h3 className="kd-section-title">{title}</h3>
    </div>
  );
}

// ─── KPI completion indicator helper ─────────────────────────────────────────
function completionOf(fields: string[]): number {
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KPIDocsForm({ bmcData, session, onBack, onComplete }: { bmcData?: any, session?: any, onBack: () => void, onComplete?: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseClient();

  // (Tetap biarkan state `form` dan fungsinya seperti aslinya di sini)
  const [form, setForm] = useState<KPIState>({
    revenue_monthly: "", profit_monthly: "", gross_margin: "", net_margin: "", capacity_utilization: "", break_even_point: "",
    customer_count: "", repeat_customer_rate: "", customer_satisfaction_score: "", on_time_delivery_rate: "", complaint_rate: "",
    documents: [emptyDoc()],
  });

  const set = (field: keyof KPIState, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));
  function updateDoc(index: number, field: keyof BizDocument, value: string) {
    setForm((prev) => { const docs = [...prev.documents]; docs[index] = { ...docs[index], [field]: value }; return { ...prev, documents: docs }; });
  }
  function addDoc() { setForm((prev) => ({ ...prev, documents: [...prev.documents, emptyDoc()] })); }
  function removeDoc(index: number) { setForm((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index), })); }

  const kpiFinancialPct = completionOf([form.revenue_monthly, form.profit_monthly, form.gross_margin, form.net_margin, form.capacity_utilization]);
  const kpiCustomerPct = completionOf([form.customer_count, form.repeat_customer_rate, form.customer_satisfaction_score, form.on_time_delivery_rate]);
  const docPct = completionOf(form.documents.flatMap((d) => [d.document_type, d.document_number]));
  const overallPct = Math.round((kpiFinancialPct + kpiCustomerPct + docPct) / 3);

  const [aiInsight, setAiInsight] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 🚀 FUNGSI TEMBAK API VERCEL
  const getAiInsight = async () => {
    setIsAiLoading(true);
    try {
      // Tinggal tembak endpoint lokal/vercel kita sendiri
      const res = await fetch("/api/ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bmcData, kpiData: form })
      });
      
      const data = await res.json();
      
      if (data.result) {
        setAiInsight(data.result);
      } else {
        toast.error(data.error || "AI lagi pusing, coba lagi nanti.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal nyambung ke server AI kita.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // 🚀 FUNGSI SAKTI PENYIMPANAN KE SUPABASE
  const handleSubmitToSupabase = async () => {
    if (!session?.user?.id) {
      toast.error("Sesi tidak valid, silakan login ulang!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        owner_id: session.user.id,
        business_name: bmcData.business_name,
        brand_name: bmcData.brand_name,
        owner_name: bmcData.owner_name,
        sector: bmcData.kbli_section ? bmcData.kbli_section.split("—")[0].trim() : "Lainnya",
        kbli_code: bmcData.kbli_code,
        kbli_name: bmcData.kbli_name,
        business_type: bmcData.business_type,
        business_scale: bmcData.business_scale,
        monthly_revenue: parseFloat(form.revenue_monthly.replace(/[^0-9.-]+/g,"")) || 0,
        growth_rate: 0, // Baseline pendaftaran awal
        bmc_score: 50, // Nilai tengah sebelum dinilai pusat
        health_status: "Active",
        contact_info: { phone: bmcData.phone_number, whatsapp: bmcData.whatsapp_number, email: bmcData.email, website: bmcData.website, address: bmcData.address },
        bmc_data: bmcData,
        kpi_data: form,
        documents: form.documents
      };

      const { error } = await supabase.from('business_entities').insert([payload]);
      if (error) throw error;
      
      toast.success("Registrasi Bisnis Berhasil!");
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim data. Cek koneksi Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="kd-form">
        <div className="kd-success anim-scale">
          <div className="kd-success-ring"><CheckCircle2 size={44} /></div>
          <h2>Data KPI & Dokumen Tersimpan!</h2>
          <p>Profil bisnis Anda kini lengkap. Tim agregator akan melakukan verifikasi legalitas dalam 1–3 hari kerja.</p>
          <button className="kd-btn-done" onClick={onComplete || onBack}>Selesai & Kembali ke Hub</button>
        </div>
      </div>
    );
  }

  return (
    <div className="kd-form">
      {/* Header */}
      <header className="kd-header anim-fade">
        <button className="kd-back" onClick={onBack} type="button">
          <ChevronLeft size={20} />
        </button>
        <div className="kd-header-text">
          <h1 className="kd-title">KPI &amp; Dokumen</h1>
          <p className="kd-subtitle">Lengkapi profil bisnis Anda</p>
        </div>
        <div className="kd-overall-pct" style={{
          color: overallPct >= 80 ? "#10b981" : overallPct >= 40 ? "#f59e0b" : "#ef4444"
        }}>
          {overallPct}%
        </div>
      </header>

      {/* Completion Cards */}
      <div className="kd-completion-row anim-slide d1">
        <div className="kd-comp-card">
          <span className="kd-comp-label">KPI Keuangan</span>
          <div className="kd-comp-bar">
            <div className="kd-comp-fill" style={{
              width: `${kpiFinancialPct}%`,
              background: "#10b981",
            }} />
          </div>
          <span className="kd-comp-pct" style={{ color: "#10b981" }}>{kpiFinancialPct}%</span>
        </div>
        <div className="kd-comp-card">
          <span className="kd-comp-label">KPI Pelanggan</span>
          <div className="kd-comp-bar">
            <div className="kd-comp-fill" style={{
              width: `${kpiCustomerPct}%`,
              background: "#3b82f6",
            }} />
          </div>
          <span className="kd-comp-pct" style={{ color: "#3b82f6" }}>{kpiCustomerPct}%</span>
        </div>
        <div className="kd-comp-card">
          <span className="kd-comp-label">Legalitas</span>
          <div className="kd-comp-bar">
            <div className="kd-comp-fill" style={{
              width: `${docPct}%`,
              background: "#a855f7",
            }} />
          </div>
          <span className="kd-comp-pct" style={{ color: "#a855f7" }}>{docPct}%</span>
        </div>
      </div>

      {/* NIB alert */}
      <div className="kd-nib-alert anim-slide d2">
        <AlertCircle size={14} />
        <p>NIB (Nomor Induk Berusaha) <strong>wajib</strong> diisi untuk verifikasi status bisnis formal.</p>
      </div>

      {/* ── KPI Keuangan ── */}
      <section className="kd-section anim-slide d2">
        <SectionHead icon={BarChart3} title="KPI Keuangan" color="#10b981" />

        <KDRow>
          <FG label="Pendapatan Bulanan (Rp)">
            <KDInput value={form.revenue_monthly} onChange={(v) => set("revenue_monthly", v)} placeholder="50.000.000" type="number" />
          </FG>
          <FG label="Laba Bersih Bulanan (Rp)">
            <KDInput value={form.profit_monthly} onChange={(v) => set("profit_monthly", v)} placeholder="10.000.000" type="number" />
          </FG>
        </KDRow>
        <KDRow>
          <FG label="Gross Margin (%)">
            <KDInput value={form.gross_margin} onChange={(v) => set("gross_margin", v)} placeholder="35" type="number" />
          </FG>
          <FG label="Net Margin (%)">
            <KDInput value={form.net_margin} onChange={(v) => set("net_margin", v)} placeholder="20" type="number" />
          </FG>
        </KDRow>
        <KDRow>
          <FG label="Utilisasi Kapasitas (%)">
            <KDInput value={form.capacity_utilization} onChange={(v) => set("capacity_utilization", v)} placeholder="75" type="number" />
          </FG>
          <FG label="Break Even Point (Rp/bln)">
            <KDInput value={form.break_even_point} onChange={(v) => set("break_even_point", v)} placeholder="30.000.000" type="number" />
          </FG>
        </KDRow>
      </section>

      {/* ── KPI Pelanggan ── */}
      <section className="kd-section anim-slide d3">
        <SectionHead icon={Users} title="KPI Pelanggan" color="#3b82f6" />

        <KDRow>
          <FG label="Jumlah Pelanggan Aktif">
            <KDInput value={form.customer_count} onChange={(v) => set("customer_count", v)} placeholder="200" type="number" />
          </FG>
          <FG label="Repeat Customer (%)">
            <KDInput value={form.repeat_customer_rate} onChange={(v) => set("repeat_customer_rate", v)} placeholder="60" type="number" />
          </FG>
        </KDRow>
        <KDRow>
          <FG label="CSAT Score (1–10)">
            <KDInput value={form.customer_satisfaction_score} onChange={(v) => set("customer_satisfaction_score", v)} placeholder="8.5" type="number" />
          </FG>
          <FG label="On-Time Delivery (%)">
            <KDInput value={form.on_time_delivery_rate} onChange={(v) => set("on_time_delivery_rate", v)} placeholder="95" type="number" />
          </FG>
        </KDRow>
        <FG label="Complaint Rate (%)">
          <KDInput value={form.complaint_rate} onChange={(v) => set("complaint_rate", v)} placeholder="2" type="number" />
        </FG>
      </section>

      {/* ── Dokumen Legalitas ── */}
      <section className="kd-section anim-slide d4">
        <SectionHead icon={ShieldCheck} title="Dokumen Legalitas" color="#a855f7" />

        {form.documents.map((doc, i) => (
          <div key={i} className="kd-doc-card">
            <div className="kd-doc-head">
              <span className="kd-doc-num">#{i + 1}</span>
              <span className="kd-doc-type-label">{doc.document_type || `Dokumen ${i + 1}`}</span>
              {form.documents.length > 1 && (
                <button className="kd-doc-remove" onClick={() => removeDoc(i)} type="button">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="kd-doc-body">
              <FG label="Jenis Dokumen">
                <KDSelect value={doc.document_type} onChange={(v) => updateDoc(i, "document_type", v)} options={DOC_TYPES} />
              </FG>
              <FG label="Nomor Dokumen">
                <KDInput value={doc.document_number} onChange={(v) => updateDoc(i, "document_number", v)} placeholder="Nomor registrasi / sertifikat" />
              </FG>
              <KDRow>
                <FG label="Tanggal Terbit">
                  <KDInput value={doc.issue_date} onChange={(v) => updateDoc(i, "issue_date", v)} type="date" />
                </FG>
                <FG label="Tanggal Berakhir">
                  <KDInput value={doc.expiry_date} onChange={(v) => updateDoc(i, "expiry_date", v)} type="date" />
                </FG>
              </KDRow>
              <FG label="Lembaga Penerbit">
                <KDInput value={doc.issuing_authority} onChange={(v) => updateDoc(i, "issuing_authority", v)} placeholder="Mis: OSS / BPJPH / BSN" />
              </FG>
            </div>
          </div>
        ))}

        <button className="kd-add-doc" onClick={addDoc} type="button">
          <Plus size={15} /> Tambah Dokumen
        </button>
      </section>

      {/* Submit */}
      <div className="kd-footer anim-slide d5">
        <button className="kd-btn-submit" disabled={isSubmitting} onClick={handleSubmitToSupabase} type="button">
          {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
          {isSubmitting ? "Memproses..." : "Simpan KPI & Dokumen"}
        </button>
      </div>
    </div>
  );
}
