"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, TrendingDown,
  Minus, DollarSign, Cog, Users, AlertTriangle, Zap, BarChart3,
  Building2, Calendar, FileText, Activity, ArrowUpRight, ArrowDownRight,
  Handshake, Package,
} from "lucide-react";
import "./PeriodicUpdateForm.css";
import { getSupabaseClient } from "../../utils/supabase/client";
import { toast } from "sonner@2.0.3";
import { Loader2 } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const QUARTERS = ["Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Okt–Des)"];
const YEARS = ["2023", "2024", "2025", "2026"];

const MONTHLY_STEPS = [
  { title: "Ringkasan Periode", subtitle: "Kondisi umum bulan ini", color: "#3b82f6" },
  { title: "Kinerja Keuangan", subtitle: "Revenue, biaya & laba", color: "#10b981" },
  { title: "Kinerja Operasional", subtitle: "Volume & efisiensi", color: "#f97316" },
  { title: "Pasar & Pelanggan", subtitle: "Customer & demand", color: "#8b5cf6" },
  { title: "Risiko & Isu", subtitle: "Kejadian & mitigasi", color: "#ef4444" },
];

// Triwulanan: jalur terpisah, fokus strategis (tidak mengulang bulanan)
const QUARTERLY_STEPS = [
  { title: "Ringkasan Kuartal", subtitle: "Kondisi & highlight Q ini", color: "#3b82f6" },
  { title: "Perubahan BMC", subtitle: "Update model bisnis", color: "#f59e0b" },
  { title: "Investasi & SDM", subtitle: "Aset & ketenagakerjaan", color: "#06b6d4" },
  { title: "Digital & Strategi", subtitle: "Teknologi & rencana ke depan", color: "#a855f7" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type PeriodType = "bulanan" | "triwulanan";

type FormState = {
  // Meta
  period_type: PeriodType;
  reporting_year: string;
  reporting_month: string;
  reporting_quarter: string;
  // Step 1 – Ringkasan
  business_status: string;
  overall_condition_score: number;
  key_highlight: string;
  major_issue: string;
  // Step 2 – Keuangan
  revenue_current: string;
  revenue_previous: string;
  total_cost: string;
  net_profit: string;
  cash_balance: string;
  accounts_receivable: string;
  accounts_payable: string;
  // Step 3 – Operasional
  sales_volume: string;
  order_count: string;
  capacity_utilization: string;
  defect_rate: string;
  fulfillment_time_average: string;
  service_count: string;
  // Step 4 – Pelanggan & Pasar
  new_customer_count: string;
  total_customer_count: string;
  repeat_customer_rate: string;
  customer_complaint_count: string;
  customer_satisfaction_score: string;
  market_demand_trend: string;
  competitor_change: string;
  pricing_change: string;
  // Step 5 – Risiko
  risk_event_occurred: string;
  risk_category: string;
  risk_description: string;
  risk_impact_level: string;
  mitigation_action: string;
  // Step 6 – BMC Changes (triwulanan)
  new_segment_added: string;
  segment_removed: string;
  new_channel_added: string;
  channel_removed: string;
  new_revenue_stream: string;
  revenue_stream_removed: string;
  product_service_change: string;
  cost_increase_reason: string;
  // Step 7 – Investasi & SDM (triwulanan)
  new_asset_purchased: string;
  asset_type: string;
  investment_value: string;
  employee_added: string;
  employee_reduced: string;
  technology_adopted: string;
  // Step 8 – Digital & Strategi (triwulanan)
  digital_sales_percentage: string;
  system_used: string;
  automation_level: string;
  improvement_plan: string;
};

const INITIAL: FormState = {
  period_type: "bulanan",
  reporting_year: "2025", reporting_month: "", reporting_quarter: "",
  business_status: "", overall_condition_score: 70,
  key_highlight: "", major_issue: "",
  revenue_current: "", revenue_previous: "",
  total_cost: "", net_profit: "", cash_balance: "",
  accounts_receivable: "", accounts_payable: "",
  sales_volume: "", order_count: "", capacity_utilization: "",
  defect_rate: "", fulfillment_time_average: "", service_count: "",
  new_customer_count: "", total_customer_count: "",
  repeat_customer_rate: "", customer_complaint_count: "",
  customer_satisfaction_score: "", market_demand_trend: "",
  competitor_change: "", pricing_change: "",
  risk_event_occurred: "", risk_category: "", risk_description: "",
  risk_impact_level: "", mitigation_action: "",
  new_segment_added: "", segment_removed: "",
  new_channel_added: "", channel_removed: "",
  new_revenue_stream: "", revenue_stream_removed: "",
  product_service_change: "", cost_increase_reason: "",
  new_asset_purchased: "", asset_type: "", investment_value: "",
  employee_added: "", employee_reduced: "", technology_adopted: "",
  digital_sales_percentage: "", system_used: "", automation_level: "",
  improvement_plan: "",
};

// ─── Health Index Calculator ──────────────────────────────────────────────────
function calcHealthIndex(f: FormState) {
  let financial = 0, operational = 0, customer = 0, growth = 0, risk = 10;

  const rev = parseFloat(f.revenue_current) || 0;
  const prevRev = parseFloat(f.revenue_previous) || 0;
  const growthPct = prevRev > 0 ? ((rev - prevRev) / prevRev) * 100 : 0;
  const cost = parseFloat(f.total_cost) || 0;
  const netProfit = parseFloat(f.net_profit) || 0;
  const margin = rev > 0 ? (netProfit / rev) * 100 : 0;

  // Financial (30 pts max)
  if (growthPct > 20) financial += 15;
  else if (growthPct > 10) financial += 12;
  else if (growthPct > 0) financial += 8;
  else if (growthPct < -10) financial -= 5;
  if (margin > 20) financial += 15;
  else if (margin > 10) financial += 10;
  else if (margin > 0) financial += 6;
  financial = Math.min(30, Math.max(0, financial));

  // Operational (25 pts max)
  const util = parseFloat(f.capacity_utilization) || 0;
  const defect = parseFloat(f.defect_rate) || 0;
  if (util > 80) operational += 15;
  else if (util > 60) operational += 10;
  else if (util > 40) operational += 5;
  if (defect < 2) operational += 10;
  else if (defect < 5) operational += 6;
  else if (defect < 10) operational += 3;
  operational = Math.min(25, Math.max(0, operational));

  // Customer (20 pts max)
  const csat = parseFloat(f.customer_satisfaction_score) || 0;
  const repeat = parseFloat(f.repeat_customer_rate) || 0;
  if (csat >= 9) customer += 12;
  else if (csat >= 7) customer += 8;
  else if (csat >= 5) customer += 4;
  if (repeat > 60) customer += 8;
  else if (repeat > 40) customer += 5;
  else if (repeat > 20) customer += 2;
  customer = Math.min(20, Math.max(0, customer));

  // Growth (15 pts max)
  const newCust = parseFloat(f.new_customer_count) || 0;
  const totalCust = parseFloat(f.total_customer_count) || 0;
  const custGrowthPct = totalCust > 0 ? (newCust / totalCust) * 100 : 0;
  if (growthPct > 15 || custGrowthPct > 15) growth += 15;
  else if (growthPct > 5 || custGrowthPct > 5) growth += 10;
  else if (growthPct > 0 || custGrowthPct > 0) growth += 5;
  growth = Math.min(15, Math.max(0, growth));

  // Risk (10 pts max)
  if (f.risk_event_occurred === "Ya") {
    if (f.risk_impact_level === "Tinggi") risk = 2;
    else if (f.risk_impact_level === "Sedang") risk = 5;
    else risk = 7;
  }

  const total = financial + operational + customer + growth + risk;
  return {
    total: Math.min(100, total),
    financial, operational, customer, growth, risk,
    category: total >= 70 ? "Healthy" : total >= 45 ? "Warning" : "Critical",
  };
}

// ─── Reusable Controls ────────────────────────────────────────────────────────
function FG({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="pu-fg">
      <label className="pu-label">{label}</label>
      {hint && <p className="pu-hint">{hint}</p>}
      {children}
    </div>
  );
}

function PUInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input type={type} className="pu-input"
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} />
  );
}

function PUTextarea({ value, onChange, placeholder, rows = 2 }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea className="pu-textarea" value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows} />
  );
}

function PUSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select className="pu-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Pilih...</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function PURow({ children }: { children: React.ReactNode }) {
  return <div className="pu-row">{children}</div>;
}

function Chips({ value, onChange, options, color }: {
  value: string; onChange: (v: string) => void;
  options: string[]; color?: string;
}) {
  return (
    <div className="pu-chips">
      {options.map((o) => (
        <button key={o} type="button"
          className={`pu-chip ${value === o ? "active" : ""}`}
          style={value === o && color ? { background: color, borderColor: color, color: "#fff" } : undefined}
          onClick={() => onChange(value === o ? "" : o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

function AutoCalcBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="pu-autocalc" style={{ borderColor: `${color}40`, background: `${color}10` }}>
      <span className="pu-autocalc-label">{label}</span>
      <span className="pu-autocalc-value" style={{ color }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; Icon: React.ComponentType<{ size?: number }> }> = {
    "Sangat Baik": { color: "#10b981", Icon: TrendingUp },
    "Baik": { color: "#06b6d4", Icon: TrendingUp },
    "Stabil": { color: "#6366f1", Icon: Minus },
    "Menurun": { color: "#f59e0b", Icon: TrendingDown },
    "Kritis": { color: "#ef4444", Icon: AlertTriangle },
  };
  const cfg = map[status];
  if (!cfg) return null;
  return (
    <div className="pu-status-badge" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
      <cfg.Icon size={12} />
      <span>{status}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PeriodicUpdateForm({ session, onBack }: { session?: any, onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);
  const supabase = getSupabaseClient();

  // (biarkan fungsi-fungsi kalkulasi bawaan Om tetap di sini)
  // ...

  // 🚀 FUNGSI SAKTI PENYIMPANAN UPDATE KE SUPABASE
  const handleSubmitUpdate = async () => {
    if (!session?.user?.id) {
      toast.error("Sesi tidak valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Simpan ke riwayat update
      const historyPayload = {
        owner_id: session.user.id,
        period_type: form.period_type,
        reporting_month: form.reporting_month,
        reporting_quarter: form.reporting_quarter,
        reporting_year: form.reporting_year,
        health_score: health.total,
        health_category: health.category,
        update_data: form
      };
      
      const { error: histErr } = await supabase.from('periodic_updates').insert([historyPayload]);
      if (histErr) throw histErr;

      // 2. Update dashboard utama (biar grafik Admin gerak)
      if (form.period_type === "bulanan") {
         const newRev = parseFloat(form.revenue_current.replace(/[^0-9.-]+/g,"")) || 0;
         const newGrowth = parseFloat(growthPct as string) || 0;
         await supabase.from('business_entities').update({
             monthly_revenue: newRev,
             growth_rate: newGrowth,
             bmc_score: health.total
         }).eq('owner_id', session.user.id);
      }

      toast.success("Laporan berhasil diperbarui!");
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim update periodik.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBlock = (highlightHint: string, showImprovementPlan = false) => (
    <>
      <FG label="Status Kondisi Bisnis">
        <div className="pu-status-chips">
          {["Sangat Baik", "Baik", "Stabil", "Menurun", "Kritis"].map((s) => {
            const colors: Record<string, string> = {
              "Sangat Baik": "#10b981", "Baik": "#06b6d4",
              "Stabil": "#6366f1", "Menurun": "#f59e0b", "Kritis": "#ef4444",
            };
            return (
              <button key={s} type="button"
                className={`pu-status-chip ${form.business_status === s ? "active" : ""}`}
                style={form.business_status === s ? {
                  background: `${colors[s]}20`, borderColor: colors[s], color: colors[s],
                } : undefined}
                onClick={() => set("business_status", s)}>
                {s}
              </button>
            );
          })}
        </div>
      </FG>
      <FG label="Self-Assessment Score (0–100)"
        hint="Penilaian Anda secara keseluruhan terhadap kondisi bisnis periode ini">
        <div className="pu-score-wrap">
          <div className="pu-score-display" style={{
            color: form.overall_condition_score >= 70 ? "#10b981"
              : form.overall_condition_score >= 45 ? "#f59e0b" : "#ef4444",
          }}>
            {form.overall_condition_score}
          </div>
          <input type="range" min={0} max={100} className="pu-slider"
            value={form.overall_condition_score}
            onChange={(e) => set("overall_condition_score", Number(e.target.value))}
            style={{
              // @ts-expect-error CSS custom property
              "--pct": `${form.overall_condition_score}%`,
              "--clr": form.overall_condition_score >= 70 ? "#10b981"
                : form.overall_condition_score >= 45 ? "#f59e0b" : "#ef4444",
            }} />
          <div className="pu-slider-marks">
            <span>Kritis</span><span>Warning</span><span>Healthy</span>
          </div>
        </div>
      </FG>
      <FG label="Highlight Utama" hint={highlightHint}>
        <PUTextarea value={form.key_highlight} onChange={(v) => set("key_highlight", v)}
          placeholder="Mis: Peluncuran produk baru, rekor penjualan, kemitraan baru..." rows={3} />
      </FG>
      <FG label="Tantangan / Isu Utama">
        <PUTextarea value={form.major_issue} onChange={(v) => set("major_issue", v)}
          placeholder="Mis: Kenaikan bahan baku, penurunan permintaan..." rows={2} />
      </FG>
      {showImprovementPlan && (
        <FG label="Rencana Strategis Kuartal Berikutnya"
          hint="Target dan langkah utama yang direncanakan">
          <PUTextarea value={form.improvement_plan} onChange={(v) => set("improvement_plan", v)}
            placeholder="Mis: Ekspansi ke 2 kota, rekrut 5 sales, target revenue +15%..." rows={3} />
        </FG>
      )}
    </>
  );

  // ── Quarterly steps 2–4 (shared JSX, dipanggil dari kedua renderer) ──
  const renderBMCChanges = () => (
    <>
      <div className="pu-section-note">
        Isi hanya jika ada perubahan. Kosongkan jika tidak ada perubahan pada blok tersebut.
      </div>
      <div className="pu-keu-group">
        <p className="pu-group-label">Customer Segments</p>
        <FG label="Segmen Baru yang Ditambahkan">
          <PUTextarea value={form.new_segment_added} onChange={(v) => set("new_segment_added", v)}
            placeholder="Mis: Mulai masuk segmen B2B, ekspansi ke luar Jawa..." />
        </FG>
        <FG label="Segmen yang Ditinggalkan">
          <PUTextarea value={form.segment_removed} onChange={(v) => set("segment_removed", v)}
            placeholder="Mis: Menghentikan layanan ke segmen premium..." />
        </FG>
      </div>
      <div className="pu-keu-group">
        <p className="pu-group-label">Channels</p>
        <FG label="Channel Baru">
          <PUTextarea value={form.new_channel_added} onChange={(v) => set("new_channel_added", v)}
            placeholder="Mis: Masuk marketplace Tokopedia, buka cabang baru..." />
        </FG>
        <FG label="Channel yang Ditutup">
          <PUTextarea value={form.channel_removed} onChange={(v) => set("channel_removed", v)}
            placeholder="Mis: Menutup toko fisik di lokasi X..." />
        </FG>
      </div>
      <div className="pu-keu-group">
        <p className="pu-group-label">Produk / Layanan & Revenue</p>
        <FG label="Produk / Layanan Baru">
          <PUTextarea value={form.product_service_change} onChange={(v) => set("product_service_change", v)}
            placeholder="Mis: Meluncurkan varian baru, menambah layanan konsultasi..." />
        </FG>
        <FG label="Revenue Stream Baru">
          <PUTextarea value={form.new_revenue_stream} onChange={(v) => set("new_revenue_stream", v)}
            placeholder="Mis: Mulai terima pendapatan dari afiliasi..." />
        </FG>
      </div>
      <div className="pu-keu-group">
        <p className="pu-group-label">Biaya</p>
        <FG label="Kenaikan Biaya Signifikan">
          <PUTextarea value={form.cost_increase_reason} onChange={(v) => set("cost_increase_reason", v)}
            placeholder="Mis: Kenaikan harga bahan baku 20%, kenaikan biaya sewa..." />
        </FG>
      </div>
    </>
  );

  const renderInvestment = () => (
    <>
      <div className="pu-keu-group">
        <p className="pu-group-label">Investasi Aset</p>
        <FG label="Aset Baru yang Dibeli">
          <PUInput value={form.new_asset_purchased} onChange={(v) => set("new_asset_purchased", v)}
            placeholder="Mis: Mesin produksi, kendaraan, peralatan" />
        </FG>
        <PURow>
          <FG label="Tipe Aset">
            <PUSelect value={form.asset_type} onChange={(v) => set("asset_type", v)}
              options={[
                { value: "Mesin", label: "Mesin & Peralatan" },
                { value: "Kendaraan", label: "Kendaraan" },
                { value: "Properti", label: "Properti / Bangunan" },
                { value: "Teknologi", label: "Teknologi / Software" },
                { value: "Inventaris", label: "Inventaris / Stok" },
                { value: "Lainnya", label: "Lainnya" },
              ]} />
          </FG>
          <FG label="Nilai Investasi (Rp)">
            <PUInput value={form.investment_value} onChange={(v) => set("investment_value", v)}
              placeholder="50.000.000" type="number" />
          </FG>
        </PURow>
      </div>
      <div className="pu-keu-group">
        <p className="pu-group-label">Sumber Daya Manusia</p>
        <PURow>
          <FG label="Karyawan Baru (orang)">
            <PUInput value={form.employee_added} onChange={(v) => set("employee_added", v)}
              placeholder="3" type="number" />
          </FG>
          <FG label="Karyawan Keluar (orang)">
            <PUInput value={form.employee_reduced} onChange={(v) => set("employee_reduced", v)}
              placeholder="1" type="number" />
          </FG>
        </PURow>
      </div>
      <div className="pu-keu-group">
        <p className="pu-group-label">Teknologi Baru</p>
        <FG label="Teknologi / Sistem Baru yang Diadopsi">
          <PUInput value={form.technology_adopted} onChange={(v) => set("technology_adopted", v)}
            placeholder="Mis: Implementasi POS, sistem ERP, CRM baru..." />
        </FG>
      </div>
    </>
  );

  const renderDigital = () => (
    <>
      <div className="pu-keu-group">
        <p className="pu-group-label">Digital & Teknologi</p>
        <FG label="Porsi Penjualan Digital (%)">
          <PUInput value={form.digital_sales_percentage} onChange={(v) => set("digital_sales_percentage", v)}
            placeholder="40" type="number" />
        </FG>
        <FG label="Sistem yang Digunakan">
          <div className="pu-system-chips">
            {["POS", "ERP", "CRM", "Marketplace", "Media Sosial", "Website"].map((s) => (
              <button key={s} type="button"
                className={`pu-system-chip ${form.system_used.includes(s) ? "active" : ""}`}
                onClick={() => {
                  const arr = form.system_used ? form.system_used.split(",").filter(Boolean) : [];
                  const updated = arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s];
                  set("system_used", updated.join(","));
                }}>
                {s}
              </button>
            ))}
          </div>
        </FG>
        <FG label="Level Otomasi Operasional">
          <Chips value={form.automation_level} onChange={(v) => set("automation_level", v)}
            options={["Manual", "Semi-Otomatis", "Penuh Otomatis"]} color="#a855f7" />
        </FG>
      </div>
    </>
  );

  // ── Monthly render (5 steps) ──────────────────────────────────
  const renderMonthlyStep = () => {
    switch (step) {
      case 1: return (
        <>
          {renderPeriodToggle()}
          {renderStatusBlock("Pencapaian atau momen penting bulan ini")}
        </>
      );

      // ── Step 2: Keuangan ──
      case 2: return (
        <>
          <div className="pu-section-note">
            Field bertanda ✦ adalah minimal wajib untuk health index.
          </div>
          <div className="pu-keu-group">
            <p className="pu-group-label">Pendapatan</p>
            <PURow>
              <FG label="✦ Revenue Periode Ini (Rp)">
                <PUInput value={form.revenue_current} onChange={(v) => set("revenue_current", v)} placeholder="50.000.000" type="number" />
              </FG>
              <FG label="Revenue Periode Lalu (Rp)">
                <PUInput value={form.revenue_previous} onChange={(v) => set("revenue_previous", v)} placeholder="45.000.000" type="number" />
              </FG>
            </PURow>
            {(form.revenue_current || form.revenue_previous) && (
              <AutoCalcBadge
                label="Pertumbuhan Revenue"
                value={growthPct !== "—" ? `${growthPct}%` : "—"}
                color={parseFloat(growthPct) >= 0 ? "#10b981" : "#ef4444"}
              />
            )}
          </div>

          <div className="pu-keu-group">
            <p className="pu-group-label">Biaya & Laba</p>
            <PURow>
              <FG label="✦ Total Biaya (Rp)">
                <PUInput value={form.total_cost} onChange={(v) => set("total_cost", v)} placeholder="35.000.000" type="number" />
              </FG>
              <FG label="✦ Laba Bersih (Rp)">
                <PUInput value={form.net_profit} onChange={(v) => set("net_profit", v)} placeholder="8.000.000" type="number" />
              </FG>
            </PURow>
            {form.revenue_current && form.total_cost && (
              <AutoCalcBadge
                label="Gross Profit (auto)"
                value={`Rp ${grossProfit}`}
                color="#06b6d4"
              />
            )}
          </div>

          <div className="pu-keu-group">
            <p className="pu-group-label">Arus Kas</p>
            <FG label="✦ Saldo Kas Akhir Periode (Rp)">
              <PUInput value={form.cash_balance} onChange={(v) => set("cash_balance", v)} placeholder="20.000.000" type="number" />
            </FG>
          </div>

          <div className="pu-keu-group">
            <p className="pu-group-label">Piutang & Hutang (opsional)</p>
            <PURow>
              <FG label="Piutang Usaha (Rp)">
                <PUInput value={form.accounts_receivable} onChange={(v) => set("accounts_receivable", v)} placeholder="5.000.000" type="number" />
              </FG>
              <FG label="Hutang Usaha (Rp)">
                <PUInput value={form.accounts_payable} onChange={(v) => set("accounts_payable", v)} placeholder="3.000.000" type="number" />
              </FG>
            </PURow>
          </div>
        </>
      );

      // ── Step 3: Operasional ──
      case 3: return (
        <>
          <PURow>
            <FG label="Volume Penjualan (unit/transaksi)">
              <PUInput value={form.sales_volume} onChange={(v) => set("sales_volume", v)} placeholder="500" type="number" />
            </FG>
            <FG label="✦ Jumlah Order">
              <PUInput value={form.order_count} onChange={(v) => set("order_count", v)} placeholder="120" type="number" />
            </FG>
          </PURow>
          <PURow>
            <FG label="✦ Utilisasi Kapasitas (%)">
              <PUInput value={form.capacity_utilization} onChange={(v) => set("capacity_utilization", v)} placeholder="75" type="number" />
            </FG>
            <FG label="Defect / Return Rate (%)">
              <PUInput value={form.defect_rate} onChange={(v) => set("defect_rate", v)} placeholder="2" type="number" />
            </FG>
          </PURow>
          <PURow>
            <FG label="Rata-rata Waktu Fulfillment (hari)">
              <PUInput value={form.fulfillment_time_average} onChange={(v) => set("fulfillment_time_average", v)} placeholder="3" type="number" />
            </FG>
            <FG label="Jumlah Layanan Terlaksana">
              <PUInput value={form.service_count} onChange={(v) => set("service_count", v)} placeholder="80" type="number" />
            </FG>
          </PURow>

          {/* Kapasitas visual indicator */}
          {form.capacity_utilization && (
            <div className="pu-util-bar-wrap">
              <div className="pu-util-bar-track">
                <div className="pu-util-bar-fill"
                  style={{
                    width: `${Math.min(100, parseFloat(form.capacity_utilization))}%`,
                    background: parseFloat(form.capacity_utilization) >= 80 ? "#10b981"
                      : parseFloat(form.capacity_utilization) >= 50 ? "#f59e0b" : "#ef4444",
                  }} />
              </div>
              <span className="pu-util-label">
                Utilisasi {form.capacity_utilization}%
              </span>
            </div>
          )}
        </>
      );

      // ── Step 4: Pelanggan & Pasar ──
      case 4: return (
        <>
          <div className="pu-keu-group">
            <p className="pu-group-label">Pelanggan</p>
            <PURow>
              <FG label="✦ Pelanggan Baru">
                <PUInput value={form.new_customer_count} onChange={(v) => set("new_customer_count", v)} placeholder="25" type="number" />
              </FG>
              <FG label="✦ Total Pelanggan Aktif">
                <PUInput value={form.total_customer_count} onChange={(v) => set("total_customer_count", v)} placeholder="200" type="number" />
              </FG>
            </PURow>
            <PURow>
              <FG label="Repeat Customer (%)">
                <PUInput value={form.repeat_customer_rate} onChange={(v) => set("repeat_customer_rate", v)} placeholder="60" type="number" />
              </FG>
              <FG label="Jumlah Komplain">
                <PUInput value={form.customer_complaint_count} onChange={(v) => set("customer_complaint_count", v)} placeholder="3" type="number" />
              </FG>
            </PURow>
            <FG label="✦ CSAT Score (1–10)">
              <PUInput value={form.customer_satisfaction_score} onChange={(v) => set("customer_satisfaction_score", v)} placeholder="8.2" type="number" />
            </FG>
          </div>

          <div className="pu-keu-group">
            <p className="pu-group-label">Kondisi Pasar</p>
            <FG label="Tren Permintaan Pasar">
              <Chips value={form.market_demand_trend} onChange={(v) => set("market_demand_trend", v)}
                options={["Naik", "Stabil", "Turun"]}
                color={form.market_demand_trend === "Naik" ? "#10b981"
                  : form.market_demand_trend === "Turun" ? "#ef4444" : "#6366f1"} />
            </FG>
            <PURow>
              <FG label="Ada Perubahan Kompetitor?">
                <Chips value={form.competitor_change} onChange={(v) => set("competitor_change", v)} options={["Ya", "Tidak"]} />
              </FG>
              <FG label="Ada Perubahan Harga?">
                <Chips value={form.pricing_change} onChange={(v) => set("pricing_change", v)} options={["Ya", "Tidak"]} />
              </FG>
            </PURow>
          </div>
        </>
      );

      // ── Step 5: Risiko ──
      case 5: return (
        <>
          <FG label="Apakah ada kejadian risiko periode ini?">
            <Chips value={form.risk_event_occurred} onChange={(v) => set("risk_event_occurred", v)}
              options={["Ya", "Tidak"]}
              color={form.risk_event_occurred === "Ya" ? "#ef4444" : "#10b981"} />
          </FG>

          {form.risk_event_occurred === "Ya" && (
            <>
              <FG label="Kategori Risiko">
                <PUSelect value={form.risk_category} onChange={(v) => set("risk_category", v)}
                  options={[
                    { value: "Financial", label: "Keuangan / Finansial" },
                    { value: "Operational", label: "Operasional" },
                    { value: "Market", label: "Pasar / Persaingan" },
                    { value: "Legal", label: "Hukum / Regulasi" },
                    { value: "HR", label: "Ketenagakerjaan / SDM" },
                    { value: "Technology", label: "Teknologi / Sistem" },
                    { value: "Supply Chain", label: "Rantai Pasok" },
                  ]} />
              </FG>
              <FG label="Deskripsi Risiko / Kejadian">
                <PUTextarea value={form.risk_description} onChange={(v) => set("risk_description", v)}
                  placeholder="Jelaskan kejadian risiko yang terjadi..." rows={3} />
              </FG>
              <FG label="Level Dampak">
                <Chips value={form.risk_impact_level} onChange={(v) => set("risk_impact_level", v)}
                  options={["Rendah", "Sedang", "Tinggi"]}
                  color={form.risk_impact_level === "Tinggi" ? "#ef4444"
                    : form.risk_impact_level === "Sedang" ? "#f59e0b" : "#10b981"} />
              </FG>
              <FG label="Tindakan Mitigasi">
                <PUTextarea value={form.mitigation_action} onChange={(v) => set("mitigation_action", v)}
                  placeholder="Apa langkah yang sudah / akan diambil?" rows={2} />
              </FG>
            </>
          )}

          {form.risk_event_occurred === "Tidak" && (
            <div className="pu-no-risk">
              <CheckCircle2 size={32} />
              <p>Tidak ada kejadian risiko yang tercatat periode ini.</p>
            </div>
          )}
        </>
      );

      default: return null;
    }
  };

  // ── Quarterly render (4 steps — fokus strategis, tidak ulang bulanan) ───────
  const renderQuarterlyStep = () => {
    switch (step) {
      case 1: return (
        <>
          {renderPeriodToggle()}
          {renderStatusBlock(
            "Pencapaian atau keputusan strategis penting kuartal ini",
            true // tampilkan improvement_plan di step 1 quarterly
          )}
        </>
      );
      case 2: return renderBMCChanges();
      case 3: return renderInvestment();
      case 4: return renderDigital();
      default: return null;
    }
  };

  const renderStep = () =>
    form.period_type === "bulanan" ? renderMonthlyStep() : renderQuarterlyStep();

  // ── Success Screen ────────────────────────────────────────────
  if (submitted) {
    const isMonthly = form.period_type === "bulanan";
    const hCategory = health.category;
    const hColor = hCategory === "Healthy" ? "#10b981" : hCategory === "Warning" ? "#f59e0b" : "#ef4444";

    return (
      <div className="pu-form">
        <div className="pu-success anim-scale">
          <div className="pu-success-glow" style={{ background: `radial-gradient(circle, ${isMonthly ? hColor : "#a855f7"}18 0%, transparent 70%)` }} />
          <div className="pu-success-icon" style={{
            background: `${isMonthly ? hColor : "#a855f7"}18`,
            color: isMonthly ? hColor : "#a855f7",
            boxShadow: `0 0 40px ${isMonthly ? hColor : "#a855f7"}40`,
          }}>
            <CheckCircle2 size={44} />
          </div>
          <h2>Update {isMonthly ? "Bulanan" : "Triwulanan"} Tersimpan!</h2>
          <p className="pu-success-period">{periodLabel}</p>

          {/* Health index hanya untuk bulanan — data finansial tersedia */}
          {isMonthly && (
            <div className="pu-success-health" style={{ borderColor: `${hColor}30`, background: `${hColor}08` }}>
              <p className="pu-sh-label">Health Index Periode Ini</p>
              <div className="pu-sh-score" style={{ color: hColor }}>{health.total}</div>
              <div className="pu-sh-cat" style={{ background: `${hColor}20`, color: hColor }}>{hCategory}</div>
              <div className="pu-sh-bars">
                {[
                  { label: "Financial", val: health.financial, max: 30, color: "#10b981" },
                  { label: "Operational", val: health.operational, max: 25, color: "#3b82f6" },
                  { label: "Customer", val: health.customer, max: 20, color: "#8b5cf6" },
                  { label: "Growth", val: health.growth, max: 15, color: "#f59e0b" },
                  { label: "Risk", val: health.risk, max: 10, color: "#ef4444" },
                ].map((b) => (
                  <div key={b.label} className="pu-sh-bar-row">
                    <span>{b.label}</span>
                    <div className="pu-sh-bar-track">
                      <div style={{ width: `${(b.val / b.max) * 100}%`, background: b.color, height: "100%", borderRadius: 99 }} />
                    </div>
                    <span style={{ color: b.color, fontSize: 11, fontWeight: 700 }}>{b.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quarterly: tampilkan ringkasan strategis saja */}
          {!isMonthly && (
            <div className="pu-success-health" style={{ borderColor: "#a855f730", background: "#a855f708" }}>
              <p className="pu-sh-label">Update Strategis Tersimpan</p>
              <div className="pu-quarterly-summary">
                {[
                  { label: "Perubahan BMC", done: !!(form.new_segment_added || form.new_channel_added || form.new_revenue_stream || form.product_service_change) },
                  { label: "Investasi & SDM", done: !!(form.investment_value || form.employee_added || form.technology_adopted) },
                  { label: "Digital & Teknologi", done: !!(form.digital_sales_percentage || form.system_used || form.automation_level) },
                  { label: "Rencana Strategis", done: !!form.improvement_plan },
                ].map((item) => (
                  <div key={item.label} className="pu-qs-item" style={{ color: item.done ? "#a855f7" : "var(--text-muted)" }}>
                    <CheckCircle2 size={13} style={{ opacity: item.done ? 1 : 0.3 }} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="pu-btn-new" onClick={() => { setForm(INITIAL); setStep(1); setSubmitted(false); }}>
            Input Periode Baru
          </button>
          <button className="pu-btn-back" onClick={onBack}>Kembali</button>
        </div>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────────
  return (
    <div className="pu-form">
      {/* Header */}
      <header className="pu-header anim-fade">
        <div className="pu-header-top">
          {step > 1 ? (
            <button className="pu-back-btn" onClick={() => setStep((s) => s - 1)} type="button">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <button className="pu-back-btn" onClick={onBack} type="button">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="pu-header-mid">
            <div className="pu-period-pill">
              <Calendar size={11} />
              {form.period_type === "bulanan" ? "Bulanan" : "Triwulanan"}
              {periodLabel !== "— " && ` · ${periodLabel}`}
            </div>
            <h1 className="pu-step-title" style={{ color: info.color }}>{info.title}</h1>
            <p className="pu-step-sub">{info.subtitle}</p>
          </div>
          <div className="pu-step-num">
            <span className="pu-step-cur">{step}</span>
            <span className="pu-step-tot">/{totalSteps}</span>
          </div>
        </div>
        <div className="pu-progress-track">
          <div className="pu-progress-fill" style={{ width: `${progress}%`, background: info.color }} />
        </div>
        <div className="pu-dots">
          {steps.map((s, idx) => (
            <button key={idx} type="button"
              className={`pu-dot ${step === idx + 1 ? "active" : ""} ${step > idx + 1 ? "done" : ""}`}
              style={step === idx + 1 ? { background: s.color } : undefined}
              onClick={() => setStep(idx + 1)}
              title={s.title} />
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="pu-body anim-slide" key={step}>
        {renderStep()}
      </div>

      {/* Footer */}
      <div className="pu-footer anim-slide d3">
        {step > 1 ? (
          <button className="pu-btn-back-footer" onClick={() => setStep((s) => s - 1)} type="button">
            <ChevronLeft size={15} /> Kembali
          </button>
        ) : (
          <button className="pu-btn-back-footer" onClick={onBack} type="button">
            <ChevronLeft size={15} /> Keluar
          </button>
        )}
        {step < totalSteps ? (
          <button className="pu-btn-next" onClick={() => setStep((s) => s + 1)} type="button"
            style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}bb)` }}>
            Lanjut <ChevronRight size={15} />
          </button>
        ) : (
          <button className="pu-btn-submit" disabled={isSubmitting} onClick={handleSubmitUpdate} type="button">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} 
            {isSubmitting ? "Menyimpan..." : "Simpan Update"}
          </button>
        )}
      </div>
    </div>
  );
}
