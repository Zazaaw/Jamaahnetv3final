"use client";

import React, { useState, useMemo } from "react";
import {
  Building2, User, Phone, Mail, Globe, MapPin,
  Users, Gem, Radio, Heart,
  DollarSign, Package, Cog, Handshake, Calculator,
  BarChart3, FileText, ChevronRight, ChevronLeft,
  Plus, Trash2, Search, CheckCircle2, Tag, Hash,
  X, ArrowRight,
} from "lucide-react";
import KPIDocsForm from "./KPIDocsForm";
import "./BMCRegistrationForm.css";

// ─── KBLI Data ────────────────────────────────────────────────────────────────
const KBLI_DATA = [
  {
    section: "A", name: "Pertanian, Kehutanan & Perikanan",
    items: [
      { code: "01", label: "Pertanian Tanaman" },
      { code: "02", label: "Kehutanan & Penebangan Kayu" },
      { code: "03", label: "Perikanan" },
    ],
  },
  {
    section: "B", name: "Pertambangan & Penggalian",
    items: [
      { code: "05", label: "Pertambangan Batubara & Lignit" },
      { code: "06", label: "Pertambangan Minyak Bumi & Gas Alam" },
      { code: "07", label: "Pertambangan Bijih Logam" },
      { code: "08", label: "Pertambangan & Penggalian Lainnya" },
    ],
  },
  {
    section: "C", name: "Industri Pengolahan",
    items: [
      { code: "10", label: "Industri Makanan" },
      { code: "11", label: "Industri Minuman" },
      { code: "12", label: "Industri Pengolahan Tembakau" },
      { code: "13", label: "Industri Tekstil" },
      { code: "14", label: "Industri Pakaian Jadi" },
      { code: "15", label: "Industri Kulit & Alas Kaki" },
      { code: "16", label: "Industri Kayu & Produk Kayu" },
      { code: "17", label: "Industri Kertas & Produk Kertas" },
      { code: "18", label: "Percetakan & Reproduksi Media" },
      { code: "20", label: "Industri Bahan Kimia" },
      { code: "21", label: "Industri Farmasi & Obat-obatan" },
      { code: "22", label: "Industri Karet & Plastik" },
      { code: "23", label: "Industri Produk Mineral Non-Logam" },
      { code: "24", label: "Industri Logam Dasar" },
      { code: "25", label: "Industri Barang Logam (Non-Mesin)" },
      { code: "26", label: "Industri Komputer, Elektronik & Optik" },
      { code: "27", label: "Industri Peralatan Listrik" },
      { code: "28", label: "Industri Mesin & Perlengkapan" },
      { code: "29", label: "Industri Kendaraan Bermotor" },
      { code: "30", label: "Industri Alat Transportasi Lainnya" },
      { code: "31", label: "Industri Furnitur" },
      { code: "32", label: "Industri Pengolahan Lainnya" },
      { code: "33", label: "Reparasi & Pemasangan Mesin & Peralatan" },
    ],
  },
  {
    section: "D", name: "Pengadaan Listrik & Gas",
    items: [
      { code: "35", label: "Pengadaan Listrik, Gas, Uap & Udara Dingin" },
    ],
  },
  {
    section: "E", name: "Pengelolaan Air & Limbah",
    items: [
      { code: "36", label: "Pengelolaan Air" },
      { code: "37", label: "Pengelolaan Air Limbah" },
      { code: "38", label: "Pengelolaan & Daur Ulang Sampah" },
      { code: "39", label: "Aktivitas Remediasi" },
    ],
  },
  {
    section: "F", name: "Konstruksi",
    items: [
      { code: "41", label: "Konstruksi Gedung" },
      { code: "42", label: "Konstruksi Sipil (Jalan, Jembatan, dll)" },
      { code: "43", label: "Konstruksi Khusus" },
    ],
  },
  {
    section: "G", name: "Perdagangan Besar & Eceran",
    items: [
      { code: "45", label: "Perdagangan Mobil & Sepeda Motor" },
      { code: "46", label: "Perdagangan Besar (Non-Otomotif)" },
      { code: "47", label: "Perdagangan Eceran (Non-Otomotif)" },
    ],
  },
  {
    section: "H", name: "Transportasi & Pergudangan",
    items: [
      { code: "49", label: "Angkutan Darat & Pipa" },
      { code: "50", label: "Angkutan Air" },
      { code: "51", label: "Angkutan Udara" },
      { code: "52", label: "Pergudangan & Jasa Pendukung Angkutan" },
      { code: "53", label: "Pos & Kurir" },
    ],
  },
  {
    section: "I", name: "Akomodasi & Makan Minum",
    items: [
      { code: "55", label: "Penyediaan Akomodasi (Hotel, Homestay, dll)" },
      { code: "56", label: "Penyediaan Makan Minum (Restoran, Katering)" },
    ],
  },
  {
    section: "J", name: "Informasi & Komunikasi",
    items: [
      { code: "58", label: "Penerbitan" },
      { code: "59", label: "Produksi Film, Video & Musik" },
      { code: "60", label: "Penyiaran & Pemrograman" },
      { code: "61", label: "Telekomunikasi" },
      { code: "62", label: "Pemrograman Komputer & Konsultasi IT" },
      { code: "63", label: "Aktivitas Jasa Informasi Lainnya" },
    ],
  },
  {
    section: "K", name: "Keuangan & Asuransi",
    items: [
      { code: "64", label: "Jasa Keuangan (Bukan Asuransi & Dana Pensiun)" },
      { code: "65", label: "Asuransi, Reasuransi & Dana Pensiun" },
      { code: "66", label: "Jasa Penunjang Keuangan & Asuransi" },
    ],
  },
  {
    section: "L", name: "Real Estat",
    items: [
      { code: "68", label: "Aktivitas Real Estat" },
    ],
  },
  {
    section: "M", name: "Aktivitas Profesional, Ilmiah & Teknis",
    items: [
      { code: "69", label: "Hukum & Akuntansi" },
      { code: "70", label: "Konsultasi Manajemen & Kantor Pusat" },
      { code: "71", label: "Arsitektur, Teknik & Pengujian Teknis" },
      { code: "72", label: "Penelitian & Pengembangan Ilmiah" },
      { code: "73", label: "Periklanan & Riset Pasar" },
      { code: "74", label: "Aktivitas Profesional & Teknis Lainnya" },
      { code: "75", label: "Aktivitas Kesehatan Hewan" },
    ],
  },
  {
    section: "N", name: "Penyewaan & Jasa Penunjang Usaha",
    items: [
      { code: "77", label: "Aktivitas Penyewaan & Sewa Guna Usaha" },
      { code: "78", label: "Aktivitas Ketenagakerjaan" },
      { code: "79", label: "Agen Perjalanan & Operator Wisata" },
      { code: "80", label: "Aktivitas Keamanan & Investigasi" },
      { code: "81", label: "Jasa untuk Gedung & Lansekap" },
      { code: "82", label: "Jasa Administrasi Kantor & Penunjang Usaha" },
    ],
  },
  {
    section: "P", name: "Pendidikan",
    items: [
      { code: "85", label: "Pendidikan (PAUD, SD, SMP, SMA, PT, Kursus)" },
    ],
  },
  {
    section: "Q", name: "Kesehatan & Aktivitas Sosial",
    items: [
      { code: "86", label: "Aktivitas Kesehatan Manusia" },
      { code: "87", label: "Aktivitas Rawat Inap" },
      { code: "88", label: "Aktivitas Sosial Tanpa Rawat Inap" },
    ],
  },
  {
    section: "R", name: "Kesenian, Hiburan & Rekreasi",
    items: [
      { code: "90", label: "Aktivitas Hiburan, Kesenian & Kreativitas" },
      { code: "91", label: "Perpustakaan, Arsip & Museum" },
      { code: "93", label: "Aktivitas Olahraga & Rekreasi Lainnya" },
    ],
  },
  {
    section: "S", name: "Aktivitas Jasa Lainnya",
    items: [
      { code: "94", label: "Aktivitas Organisasi Keanggotaan" },
      { code: "95", label: "Reparasi Komputer & Barang Rumah Tangga" },
      { code: "96", label: "Jasa Perorangan Lainnya (Laundry, Salon, Spa)" },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type CustomerSegment = {
  segment_name: string; segment_type: string;
  demographic_profile: string; geographic_area: string;
  needs_description: string; priority_level: string;
};
type ValueProposition = {
  value_title: string; value_type: string;
  customer_problem: string; unique_selling_point: string;
  innovation_level: string;
};
type Channel = {
  channel_name: string; channel_type: string;
  channel_stage: string; reach_estimation: string;
};
type RevenueStream = {
  revenue_name: string; revenue_type: string; pricing_model: string;
  price_range_min: string; price_range_max: string;
  average_monthly_sales: string; revenue_contribution_percentage: string;
};
type KeyResource = {
  resource_name: string; resource_type: string;
  ownership_status: string; quantity: string; criticality_level: string;
};
type KeyActivity = {
  activity_name: string; activity_type: string; frequency: string;
  responsible_unit: string; automation_level: string;
};
type KeyPartner = {
  partner_name: string; partner_type: string;
  role_description: string; dependency_level: string; risk_level: string;
};
type CostItem = {
  cost_name: string; cost_type: string; cost_category: string;
  monthly_cost_estimation: string; cost_driver: string;
};
type FormState = {
  // Step 1
  business_name: string; brand_name: string; owner_name: string;
  kbli_code: string; kbli_name: string; kbli_section: string;
  business_type: string; business_scale: string;
  year_established: string; employee_count: string;
  description: string; tagline: string;
  // Step 2
  phone_number: string; whatsapp_number: string; email: string;
  website: string; social_media_instagram: string;
  social_media_facebook: string; social_media_tiktok: string;
  address: string; city: string; province: string; postal_code: string;
  // BMC Blocks
  customer_segments: CustomerSegment[];
  value_propositions: ValueProposition[];
  channels: Channel[];
  relationship_type: string; engagement_method: string;
  communication_frequency: string; loyalty_program: string;
  customer_feedback_method: string; complaint_handling_method: string;
  revenue_streams: RevenueStream[];
  key_resources: KeyResource[];
  key_activities: KeyActivity[];
  key_partners: KeyPartner[];
  cost_structure: CostItem[];
};

const emptySegment = (): CustomerSegment => ({
  segment_name: "", segment_type: "", demographic_profile: "",
  geographic_area: "", needs_description: "", priority_level: "",
});
const emptyValue = (): ValueProposition => ({
  value_title: "", value_type: "", customer_problem: "",
  unique_selling_point: "", innovation_level: "",
});
const emptyChannel = (): Channel => ({
  channel_name: "", channel_type: "", channel_stage: "", reach_estimation: "",
});
const emptyRevenue = (): RevenueStream => ({
  revenue_name: "", revenue_type: "", pricing_model: "",
  price_range_min: "", price_range_max: "",
  average_monthly_sales: "", revenue_contribution_percentage: "",
});
const emptyResource = (): KeyResource => ({
  resource_name: "", resource_type: "", ownership_status: "",
  quantity: "", criticality_level: "",
});
const emptyActivity = (): KeyActivity => ({
  activity_name: "", activity_type: "", frequency: "",
  responsible_unit: "", automation_level: "",
});
const emptyPartner = (): KeyPartner => ({
  partner_name: "", partner_type: "", role_description: "",
  dependency_level: "", risk_level: "",
});
const emptyCost = (): CostItem => ({
  cost_name: "", cost_type: "", cost_category: "",
  monthly_cost_estimation: "", cost_driver: "",
});

const STEP_INFO = [
  { title: "Profil Bisnis", subtitle: "Identitas & Klasifikasi KBLI", color: "#3b82f6" },
  { title: "Kontak & Lokasi", subtitle: "Informasi Kontak & Alamat", color: "#6366f1" },
  { title: "Customer Segments", subtitle: "Blok BMC 1 — Segmen Pelanggan", color: "#10b981" },
  { title: "Value Proposition", subtitle: "Blok BMC 2 — Proposisi Nilai", color: "#f59e0b" },
  { title: "Channels", subtitle: "Blok BMC 3 — Saluran Distribusi", color: "#8b5cf6" },
  { title: "Customer Relationships", subtitle: "Blok BMC 4 — Hubungan Pelanggan", color: "#ec4899" },
  { title: "Revenue Streams", subtitle: "Blok BMC 5 — Sumber Pendapatan", color: "#10b981" },
  { title: "Key Resources", subtitle: "Blok BMC 6 — Sumber Daya Kunci", color: "#06b6d4" },
  { title: "Key Activities", subtitle: "Blok BMC 7 — Aktivitas Kunci", color: "#f97316" },
  { title: "Key Partners", subtitle: "Blok BMC 8 — Mitra Kunci", color: "#84cc16" },
  { title: "Cost Structure", subtitle: "Blok BMC 9 — Struktur Biaya", color: "#ef4444" },
];

const TOTAL_STEPS = STEP_INFO.length;

// ─── KBLI Picker Component ────────────────────────────────────────────────────
function KBLIPicker({
  selected, onSelect, onClose,
}: {
  selected: string;
  onSelect: (code: string, label: string, section: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query.trim()) return KBLI_DATA;
    const q = query.toLowerCase();
    return KBLI_DATA
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (i) => i.code.includes(q) || i.label.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0 || cat.name.toLowerCase().includes(q));
  }, [query]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const showExpanded = (section: string) =>
    query.trim().length > 0 || expandedSections.has(section);

  return (
    <div className="kbli-overlay" onClick={onClose}>
      <div className="kbli-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="kbli-header">
          <div>
            <h3 className="kbli-title">Pilih Klasifikasi KBLI</h3>
            <p className="kbli-sub">Klasifikasi Baku Lapangan Usaha Indonesia</p>
          </div>
          <button className="kbli-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="kbli-search-wrap">
          <Search size={15} className="kbli-search-icon" />
          <input
            className="kbli-search"
            placeholder="Cari kode atau nama (mis: 10, makanan)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="kbli-clear" onClick={() => setQuery("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="kbli-list">
          {filtered.map((cat) => (
            <div key={cat.section} className="kbli-section">
              <button
                className="kbli-section-head"
                onClick={() => toggleSection(cat.section)}
              >
                <span className="kbli-section-badge">{cat.section}</span>
                <span className="kbli-section-name">{cat.name}</span>
                <span className={`kbli-chevron ${showExpanded(cat.section) ? "open" : ""}`}>▾</span>
              </button>
              {showExpanded(cat.section) && (
                <div className="kbli-items">
                  {cat.items.map((item) => (
                    <button
                      key={item.code}
                      className={`kbli-item ${selected === item.code ? "selected" : ""}`}
                      onClick={() => { onSelect(item.code, item.label, cat.section + " — " + cat.name); onClose(); }}
                    >
                      <span className="kbli-item-code">{item.code}</span>
                      <span className="kbli-item-label">{item.label}</span>
                      {selected === item.code && <CheckCircle2 size={14} className="kbli-item-check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="kbli-empty">
              <Search size={32} />
              <p>Tidak ditemukan untuk &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Sub-components ──────────────────────────────────────────────────
function FormGroup({ label, icon: Icon, children }: {
  label: string; icon?: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="fg">
      <label className="fg-label">
        {Icon && <Icon size={13} />}
        {label}
      </label>
      {children}
    </div>
  );
}

function FInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      className="form-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function FTextarea({ value, onChange, placeholder, rows = 2 }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      className="form-textarea"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

function FSelect({ value, onChange, options, placeholder = "Pilih..." }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Chips({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="chip-group">
      {options.map((o) => (
        <button
          key={o} type="button"
          className={`chip ${value === o ? "active" : ""}`}
          onClick={() => onChange(value === o ? "" : o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="form-row">{children}</div>;
}

function ArrayCard({
  index, title, onRemove, canRemove, children,
}: {
  index: number; title: string; onRemove: () => void;
  canRemove: boolean; children: React.ReactNode;
}) {
  return (
    <div className="array-card">
      <div className="array-card-head">
        <span className="array-card-num">#{index + 1}</span>
        <span className="array-card-title">{title || `Item ${index + 1}`}</span>
        {canRemove && (
          <button className="array-card-remove" onClick={onRemove} type="button">
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div className="array-card-body">{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="btn-add" onClick={onClick} type="button">
      <Plus size={15} /> {label}
    </button>
  );
}

function SectionNote({ children }: { children: React.ReactNode }) {
  return <p className="section-note">{children}</p>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BMCRegistrationForm() {
  const [step, setStep] = useState(1);
  const [showKBLI, setShowKBLI] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showKPIDocs, setShowKPIDocs] = useState(false);

  const [form, setForm] = useState<FormState>({
    business_name: "", brand_name: "", owner_name: "",
    kbli_code: "", kbli_name: "", kbli_section: "",
    business_type: "", business_scale: "",
    year_established: "", employee_count: "",
    description: "", tagline: "",
    phone_number: "", whatsapp_number: "", email: "",
    website: "", social_media_instagram: "",
    social_media_facebook: "", social_media_tiktok: "",
    address: "", city: "", province: "", postal_code: "",
    customer_segments: [emptySegment()],
    value_propositions: [emptyValue()],
    channels: [emptyChannel()],
    relationship_type: "", engagement_method: "",
    communication_frequency: "", loyalty_program: "",
    customer_feedback_method: "", complaint_handling_method: "",
    revenue_streams: [emptyRevenue()],
    key_resources: [emptyResource()],
    key_activities: [emptyActivity()],
    key_partners: [emptyPartner()],
    cost_structure: [emptyCost()],
  });

  const set = (field: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Array helpers
  function updateArr<T>(field: keyof FormState, index: number, subField: keyof T, value: string) {
    setForm((prev) => {
      const arr = [...(prev[field] as T[])];
      arr[index] = { ...arr[index], [subField]: value };
      return { ...prev, [field]: arr };
    });
  }
  function addArr<T>(field: keyof FormState, empty: () => T) {
    setForm((prev) => ({ ...prev, [field]: [...(prev[field] as T[]), empty()] }));
  }
  function removeArr<T>(field: keyof FormState, index: number) {
    setForm((prev) => {
      const arr = (prev[field] as T[]).filter((_, i) => i !== index);
      return { ...prev, [field]: arr };
    });
  }

  const info = STEP_INFO[step - 1];
  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  // ── Step Renders ─────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 1: Profil Bisnis ──
      case 1: return (
        <>
          <FormGroup label="Nama Bisnis / Entitas *" icon={Building2}>
            <FInput value={form.business_name} onChange={(v) => set("business_name", v)} placeholder="PT / CV / UD / Nama Usaha" />
          </FormGroup>
          <FormGroup label="Nama Brand (jika berbeda)" icon={Tag}>
            <FInput value={form.brand_name} onChange={(v) => set("brand_name", v)} placeholder="Brand / merek yang dikenal publik" />
          </FormGroup>
          <FormGroup label="Nama Pemilik / Penanggung Jawab *" icon={User}>
            <FInput value={form.owner_name} onChange={(v) => set("owner_name", v)} placeholder="Nama lengkap" />
          </FormGroup>

          <FormGroup label="Klasifikasi KBLI *" icon={Hash}>
            <button className="kbli-trigger" onClick={() => setShowKBLI(true)} type="button">
              {form.kbli_code ? (
                <span className="kbli-trigger-selected">
                  <span className="kbli-trigger-code">{form.kbli_code}</span>
                  <span className="kbli-trigger-name">{form.kbli_name}</span>
                </span>
              ) : (
                <span className="kbli-trigger-placeholder">Pilih kode KBLI...</span>
              )}
              <Search size={15} />
            </button>
            {form.kbli_section && (
              <p className="kbli-section-label">{form.kbli_section}</p>
            )}
          </FormGroup>

          <FormGroup label="Jenis Badan Usaha" icon={Building2}>
            <FSelect
              value={form.business_type}
              onChange={(v) => set("business_type", v)}
              options={[
                { value: "Perorangan", label: "Perorangan / Usaha Mikro" },
                { value: "CV", label: "CV (Commanditaire Vennootschap)" },
                { value: "PT", label: "PT (Perseroan Terbatas)" },
                { value: "PT Tbk", label: "PT Tbk (Terbuka)" },
                { value: "Koperasi", label: "Koperasi" },
                { value: "Yayasan", label: "Yayasan" },
                { value: "Firma", label: "Firma" },
                { value: "BUMN", label: "BUMN / BUMD" },
                { value: "Lainnya", label: "Lainnya" },
              ]}
            />
          </FormGroup>

          <FormGroup label="Skala Usaha">
            <Chips
              value={form.business_scale}
              onChange={(v) => set("business_scale", v)}
              options={["Mikro", "Kecil", "Menengah", "Besar"]}
            />
          </FormGroup>

          <FormRow>
            <FormGroup label="Tahun Berdiri">
              <FInput value={form.year_established} onChange={(v) => set("year_established", v)} placeholder="2020" type="number" />
            </FormGroup>
            <FormGroup label="Jumlah Karyawan">
              <FInput value={form.employee_count} onChange={(v) => set("employee_count", v)} placeholder="10" type="number" />
            </FormGroup>
          </FormRow>

          <FormGroup label="Tagline / Slogan">
            <FInput value={form.tagline} onChange={(v) => set("tagline", v)} placeholder="Tagline singkat bisnis Anda" />
          </FormGroup>
          <FormGroup label="Deskripsi Bisnis">
            <FTextarea value={form.description} onChange={(v) => set("description", v)} placeholder="Jelaskan secara singkat model dan aktivitas bisnis..." rows={3} />
          </FormGroup>
        </>
      );

      // ── Step 2: Kontak & Lokasi ──
      case 2: return (
        <>
          <SectionNote>Informasi kontak dan lokasi operasional bisnis.</SectionNote>
          <FormRow>
            <FormGroup label="No. Telepon" icon={Phone}>
              <FInput value={form.phone_number} onChange={(v) => set("phone_number", v)} placeholder="021-xxx" type="tel" />
            </FormGroup>
            <FormGroup label="WhatsApp" icon={Phone}>
              <FInput value={form.whatsapp_number} onChange={(v) => set("whatsapp_number", v)} placeholder="08xx-xxxx" type="tel" />
            </FormGroup>
          </FormRow>
          <FormGroup label="Email Bisnis" icon={Mail}>
            <FInput value={form.email} onChange={(v) => set("email", v)} placeholder="info@bisnis.com" type="email" />
          </FormGroup>
          <FormGroup label="Website" icon={Globe}>
            <FInput value={form.website} onChange={(v) => set("website", v)} placeholder="https://www.bisnis.com" />
          </FormGroup>
          <FormRow>
            <FormGroup label="Instagram" icon={Phone}>
              <FInput value={form.social_media_instagram} onChange={(v) => set("social_media_instagram", v)} placeholder="@username" />
            </FormGroup>
            <FormGroup label="Facebook" icon={Phone}>
              <FInput value={form.social_media_facebook} onChange={(v) => set("social_media_facebook", v)} placeholder="Nama halaman" />
            </FormGroup>
          </FormRow>
          <FormGroup label="TikTok" icon={Radio}>
            <FInput value={form.social_media_tiktok} onChange={(v) => set("social_media_tiktok", v)} placeholder="@username" />
          </FormGroup>
          <FormGroup label="Alamat Lengkap" icon={MapPin}>
            <FTextarea value={form.address} onChange={(v) => set("address", v)} placeholder="Jl. ..., No. ..." rows={2} />
          </FormGroup>
          <FormRow>
            <FormGroup label="Kota / Kabupaten">
              <FInput value={form.city} onChange={(v) => set("city", v)} placeholder="Jakarta" />
            </FormGroup>
            <FormGroup label="Provinsi">
              <FInput value={form.province} onChange={(v) => set("province", v)} placeholder="DKI Jakarta" />
            </FormGroup>
          </FormRow>
          <FormGroup label="Kode Pos">
            <FInput value={form.postal_code} onChange={(v) => set("postal_code", v)} placeholder="10110" type="number" />
          </FormGroup>
        </>
      );

      // ── Step 3: Customer Segments ──
      case 3: return (
        <>
          <SectionNote>Siapa pelanggan yang Anda layani? Tambahkan setiap segmen pelanggan yang berbeda.</SectionNote>
          {form.customer_segments.map((seg, i) => (
            <ArrayCard key={i} index={i} title={seg.segment_name} onRemove={() => removeArr("customer_segments", i)} canRemove={form.customer_segments.length > 1}>
              <FormGroup label="Nama Segmen">
                <FInput value={seg.segment_name} onChange={(v) => updateArr<CustomerSegment>("customer_segments", i, "segment_name", v)} placeholder="Mis: UMKM Sektor F&B" />
              </FormGroup>
              <FormGroup label="Tipe Segmen">
                <Chips value={seg.segment_type} onChange={(v) => updateArr<CustomerSegment>("customer_segments", i, "segment_type", v)} options={["B2C", "B2B", "B2G", "Internal"]} />
              </FormGroup>
              <FormGroup label="Profil Demografis">
                <FInput value={seg.demographic_profile} onChange={(v) => updateArr<CustomerSegment>("customer_segments", i, "demographic_profile", v)} placeholder="Usia, gender, pendapatan, dll" />
              </FormGroup>
              <FormGroup label="Area Geografis">
                <FInput value={seg.geographic_area} onChange={(v) => updateArr<CustomerSegment>("customer_segments", i, "geographic_area", v)} placeholder="Jabodetabek, Jawa Barat, Nasional" />
              </FormGroup>
              <FormGroup label="Kebutuhan Utama">
                <FTextarea value={seg.needs_description} onChange={(v) => updateArr<CustomerSegment>("customer_segments", i, "needs_description", v)} placeholder="Apa kebutuhan / pain point segmen ini?" />
              </FormGroup>
              <FormGroup label="Tingkat Prioritas">
                <Chips value={seg.priority_level} onChange={(v) => updateArr<CustomerSegment>("customer_segments", i, "priority_level", v)} options={["Tinggi", "Sedang", "Rendah"]} />
              </FormGroup>
            </ArrayCard>
          ))}
          <AddButton label="Tambah Segmen" onClick={() => addArr("customer_segments", emptySegment)} />
        </>
      );

      // ── Step 4: Value Proposition ──
      case 4: return (
        <>
          <SectionNote>Nilai apa yang Anda tawarkan kepada setiap segmen pelanggan?</SectionNote>
          {form.value_propositions.map((vp, i) => (
            <ArrayCard key={i} index={i} title={vp.value_title} onRemove={() => removeArr("value_propositions", i)} canRemove={form.value_propositions.length > 1}>
              <FormGroup label="Judul Proposisi Nilai">
                <FInput value={vp.value_title} onChange={(v) => updateArr<ValueProposition>("value_propositions", i, "value_title", v)} placeholder="Mis: Pengiriman Super Cepat" />
              </FormGroup>
              <FormGroup label="Jenis Nilai">
                <FSelect value={vp.value_type} onChange={(v) => updateArr<ValueProposition>("value_propositions", i, "value_type", v)}
                  options={[
                    { value: "Cost Reduction", label: "Pengurangan Biaya" },
                    { value: "Quality", label: "Kualitas / Keandalan" },
                    { value: "Convenience", label: "Kemudahan / Kenyamanan" },
                    { value: "Innovation", label: "Inovasi / Kebaruan" },
                    { value: "Speed", label: "Kecepatan" },
                    { value: "Customization", label: "Kustomisasi" },
                    { value: "Brand", label: "Brand / Status" },
                    { value: "Access", label: "Akses ke Produk/Layanan" },
                  ]}
                />
              </FormGroup>
              <FormGroup label="Masalah yang Diselesaikan">
                <FTextarea value={vp.customer_problem} onChange={(v) => updateArr<ValueProposition>("value_propositions", i, "customer_problem", v)} placeholder="Apa masalah pelanggan yang Anda selesaikan?" />
              </FormGroup>
              <FormGroup label="Keunggulan Unik (USP)">
                <FInput value={vp.unique_selling_point} onChange={(v) => updateArr<ValueProposition>("value_propositions", i, "unique_selling_point", v)} placeholder="Apa yang membedakan Anda dari kompetitor?" />
              </FormGroup>
              <FormGroup label="Level Inovasi">
                <Chips value={vp.innovation_level} onChange={(v) => updateArr<ValueProposition>("value_propositions", i, "innovation_level", v)} options={["Rendah", "Sedang", "Tinggi"]} />
              </FormGroup>
            </ArrayCard>
          ))}
          <AddButton label="Tambah Proposisi Nilai" onClick={() => addArr("value_propositions", emptyValue)} />
        </>
      );

      // ── Step 5: Channels ──
      case 5: return (
        <>
          <SectionNote>Bagaimana Anda menjangkau dan menyampaikan nilai kepada pelanggan?</SectionNote>
          {form.channels.map((ch, i) => (
            <ArrayCard key={i} index={i} title={ch.channel_name} onRemove={() => removeArr("channels", i)} canRemove={form.channels.length > 1}>
              <FormGroup label="Nama Channel">
                <FInput value={ch.channel_name} onChange={(v) => updateArr<Channel>("channels", i, "channel_name", v)} placeholder="Mis: Marketplace Tokopedia" />
              </FormGroup>
              <FormGroup label="Tipe Channel">
                <Chips value={ch.channel_type} onChange={(v) => updateArr<Channel>("channels", i, "channel_type", v)} options={["Online", "Offline", "Hybrid"]} />
              </FormGroup>
              <FormGroup label="Tahap Channel">
                <FSelect value={ch.channel_stage} onChange={(v) => updateArr<Channel>("channels", i, "channel_stage", v)}
                  options={[
                    { value: "Awareness", label: "Awareness (Pengenalan)" },
                    { value: "Consideration", label: "Consideration (Pertimbangan)" },
                    { value: "Purchase", label: "Purchase (Pembelian)" },
                    { value: "Delivery", label: "Delivery (Pengiriman)" },
                    { value: "After-sales", label: "After-sales (Purna Jual)" },
                  ]}
                />
              </FormGroup>
              <FormGroup label="Estimasi Jangkauan">
                <FInput value={ch.reach_estimation} onChange={(v) => updateArr<Channel>("channels", i, "reach_estimation", v)} placeholder="Mis: 5.000 orang/bulan" />
              </FormGroup>
            </ArrayCard>
          ))}
          <AddButton label="Tambah Channel" onClick={() => addArr("channels", emptyChannel)} />
        </>
      );

      // ── Step 6: Customer Relationships ──
      case 6: return (
        <>
          <SectionNote>Bagaimana Anda membangun dan menjaga hubungan dengan pelanggan?</SectionNote>
          <FormGroup label="Tipe Hubungan Pelanggan" icon={Heart}>
            <FSelect value={form.relationship_type} onChange={(v) => set("relationship_type", v)}
              options={[
                { value: "Personal Assistance", label: "Bantuan Personal" },
                { value: "Dedicated Support", label: "Dedicated Support" },
                { value: "Self-service", label: "Self-service" },
                { value: "Automated", label: "Otomatis / Digital" },
                { value: "Community", label: "Komunitas" },
                { value: "Co-creation", label: "Ko-kreasi" },
              ]}
            />
          </FormGroup>
          <FormGroup label="Metode Engagement">
            <FInput value={form.engagement_method} onChange={(v) => set("engagement_method", v)} placeholder="Mis: WhatsApp, email newsletter, forum" />
          </FormGroup>
          <FormGroup label="Frekuensi Komunikasi">
            <Chips
              value={form.communication_frequency}
              onChange={(v) => set("communication_frequency", v)}
              options={["Harian", "Mingguan", "Bulanan", "Insidental"]}
            />
          </FormGroup>
          <FormGroup label="Program Loyalitas">
            <FInput value={form.loyalty_program} onChange={(v) => set("loyalty_program", v)} placeholder="Mis: Poin reward, diskon member, referral" />
          </FormGroup>
          <FormGroup label="Metode Feedback Pelanggan">
            <FInput value={form.customer_feedback_method} onChange={(v) => set("customer_feedback_method", v)} placeholder="Mis: Google Form, survei, bintang di app" />
          </FormGroup>
          <FormGroup label="Penanganan Keluhan">
            <FTextarea value={form.complaint_handling_method} onChange={(v) => set("complaint_handling_method", v)} placeholder="Bagaimana prosedur penanganan keluhan?" />
          </FormGroup>
        </>
      );

      // ── Step 7: Revenue Streams ──
      case 7: return (
        <>
          <SectionNote>Dari mana sumber pendapatan bisnis Anda berasal?</SectionNote>
          {form.revenue_streams.map((rs, i) => (
            <ArrayCard key={i} index={i} title={rs.revenue_name} onRemove={() => removeArr("revenue_streams", i)} canRemove={form.revenue_streams.length > 1}>
              <FormGroup label="Nama Stream Pendapatan">
                <FInput value={rs.revenue_name} onChange={(v) => updateArr<RevenueStream>("revenue_streams", i, "revenue_name", v)} placeholder="Mis: Penjualan Produk A" />
              </FormGroup>
              <FormGroup label="Tipe Pendapatan">
                <FSelect value={rs.revenue_type} onChange={(v) => updateArr<RevenueStream>("revenue_streams", i, "revenue_type", v)}
                  options={[
                    { value: "Product Sales", label: "Penjualan Produk" },
                    { value: "Service Fee", label: "Biaya Layanan / Jasa" },
                    { value: "Subscription", label: "Berlangganan (Subscription)" },
                    { value: "Leasing", label: "Sewa / Leasing" },
                    { value: "Licensing", label: "Lisensi / Royalti" },
                    { value: "Commission", label: "Komisi / Brokerage" },
                    { value: "Advertising", label: "Periklanan" },
                    { value: "Project Based", label: "Berbasis Proyek" },
                  ]}
                />
              </FormGroup>
              <FormGroup label="Model Penetapan Harga">
                <Chips value={rs.pricing_model} onChange={(v) => updateArr<RevenueStream>("revenue_streams", i, "pricing_model", v)} options={["Tetap", "Dinamis", "Negosiasi", "Paket"]} />
              </FormGroup>
              <FormRow>
                <FormGroup label="Harga Min (Rp)">
                  <FInput value={rs.price_range_min} onChange={(v) => updateArr<RevenueStream>("revenue_streams", i, "price_range_min", v)} placeholder="50.000" type="number" />
                </FormGroup>
                <FormGroup label="Harga Maks (Rp)">
                  <FInput value={rs.price_range_max} onChange={(v) => updateArr<RevenueStream>("revenue_streams", i, "price_range_max", v)} placeholder="500.000" type="number" />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup label="Rata-rata Penjualan/Bulan (Rp)">
                  <FInput value={rs.average_monthly_sales} onChange={(v) => updateArr<RevenueStream>("revenue_streams", i, "average_monthly_sales", v)} placeholder="10.000.000" type="number" />
                </FormGroup>
                <FormGroup label="Kontribusi (%)">
                  <FInput value={rs.revenue_contribution_percentage} onChange={(v) => updateArr<RevenueStream>("revenue_streams", i, "revenue_contribution_percentage", v)} placeholder="60" type="number" />
                </FormGroup>
              </FormRow>
            </ArrayCard>
          ))}
          <AddButton label="Tambah Sumber Pendapatan" onClick={() => addArr("revenue_streams", emptyRevenue)} />
        </>
      );

      // ── Step 8: Key Resources ──
      case 8: return (
        <>
          <SectionNote>Aset dan sumber daya apa yang paling penting untuk menjalankan bisnis?</SectionNote>
          {form.key_resources.map((kr, i) => (
            <ArrayCard key={i} index={i} title={kr.resource_name} onRemove={() => removeArr("key_resources", i)} canRemove={form.key_resources.length > 1}>
              <FormGroup label="Nama Sumber Daya">
                <FInput value={kr.resource_name} onChange={(v) => updateArr<KeyResource>("key_resources", i, "resource_name", v)} placeholder="Mis: Mesin Produksi, Tim Sales" />
              </FormGroup>
              <FormGroup label="Tipe Sumber Daya">
                <Chips value={kr.resource_type} onChange={(v) => updateArr<KeyResource>("key_resources", i, "resource_type", v)} options={["Fisik", "Manusia", "Intelektual", "Finansial"]} />
              </FormGroup>
              <FormGroup label="Status Kepemilikan">
                <Chips value={kr.ownership_status} onChange={(v) => updateArr<KeyResource>("key_resources", i, "ownership_status", v)} options={["Milik", "Sewa", "Bersama"]} />
              </FormGroup>
              <FormRow>
                <FormGroup label="Jumlah / Kapasitas">
                  <FInput value={kr.quantity} onChange={(v) => updateArr<KeyResource>("key_resources", i, "quantity", v)} placeholder="5 unit" />
                </FormGroup>
                <FormGroup label="Tingkat Kekritisan">
                  <FSelect value={kr.criticality_level} onChange={(v) => updateArr<KeyResource>("key_resources", i, "criticality_level", v)}
                    options={[
                      { value: "Sangat Kritis", label: "Sangat Kritis" },
                      { value: "Kritis", label: "Kritis" },
                      { value: "Sedang", label: "Sedang" },
                      { value: "Rendah", label: "Rendah" },
                    ]}
                  />
                </FormGroup>
              </FormRow>
            </ArrayCard>
          ))}
          <AddButton label="Tambah Sumber Daya" onClick={() => addArr("key_resources", emptyResource)} />
        </>
      );

      // ── Step 9: Key Activities ──
      case 9: return (
        <>
          <SectionNote>Aktivitas apa yang paling penting untuk menciptakan dan menyampaikan nilai?</SectionNote>
          {form.key_activities.map((ka, i) => (
            <ArrayCard key={i} index={i} title={ka.activity_name} onRemove={() => removeArr("key_activities", i)} canRemove={form.key_activities.length > 1}>
              <FormGroup label="Nama Aktivitas">
                <FInput value={ka.activity_name} onChange={(v) => updateArr<KeyActivity>("key_activities", i, "activity_name", v)} placeholder="Mis: Proses Produksi Harian" />
              </FormGroup>
              <FormGroup label="Tipe Aktivitas">
                <FSelect value={ka.activity_type} onChange={(v) => updateArr<KeyActivity>("key_activities", i, "activity_type", v)}
                  options={[
                    { value: "Production", label: "Produksi" },
                    { value: "Problem Solving", label: "Problem Solving / Konsultasi" },
                    { value: "Platform", label: "Pengelolaan Platform / Teknologi" },
                    { value: "Distribution", label: "Distribusi & Logistik" },
                    { value: "Marketing", label: "Pemasaran & Penjualan" },
                    { value: "R&D", label: "Riset & Pengembangan" },
                    { value: "Administration", label: "Administrasi & Keuangan" },
                  ]}
                />
              </FormGroup>
              <FormRow>
                <FormGroup label="Frekuensi">
                  <FSelect value={ka.frequency} onChange={(v) => updateArr<KeyActivity>("key_activities", i, "frequency", v)}
                    options={[
                      { value: "Harian", label: "Harian" },
                      { value: "Mingguan", label: "Mingguan" },
                      { value: "Bulanan", label: "Bulanan" },
                      { value: "Per Proyek", label: "Per Proyek" },
                      { value: "Insidental", label: "Insidental" },
                    ]}
                  />
                </FormGroup>
                <FormGroup label="Level Otomasi">
                  <FSelect value={ka.automation_level} onChange={(v) => updateArr<KeyActivity>("key_activities", i, "automation_level", v)}
                    options={[
                      { value: "Manual", label: "Manual" },
                      { value: "Semi-otomatis", label: "Semi-otomatis" },
                      { value: "Penuh Otomatis", label: "Penuh Otomatis" },
                    ]}
                  />
                </FormGroup>
              </FormRow>
              <FormGroup label="Unit Penanggung Jawab">
                <FInput value={ka.responsible_unit} onChange={(v) => updateArr<KeyActivity>("key_activities", i, "responsible_unit", v)} placeholder="Mis: Tim Produksi, Divisi Operasional" />
              </FormGroup>
            </ArrayCard>
          ))}
          <AddButton label="Tambah Aktivitas" onClick={() => addArr("key_activities", emptyActivity)} />
        </>
      );

      // ── Step 10: Key Partners ──
      case 10: return (
        <>
          <SectionNote>Siapa mitra strategis yang mendukung operasional bisnis Anda?</SectionNote>
          {form.key_partners.map((kp, i) => (
            <ArrayCard key={i} index={i} title={kp.partner_name} onRemove={() => removeArr("key_partners", i)} canRemove={form.key_partners.length > 1}>
              <FormGroup label="Nama Mitra">
                <FInput value={kp.partner_name} onChange={(v) => updateArr<KeyPartner>("key_partners", i, "partner_name", v)} placeholder="Mis: PT Suplai Indonesia" />
              </FormGroup>
              <FormGroup label="Tipe Mitra">
                <FSelect value={kp.partner_type} onChange={(v) => updateArr<KeyPartner>("key_partners", i, "partner_type", v)}
                  options={[
                    { value: "Supplier", label: "Pemasok (Supplier)" },
                    { value: "Distributor", label: "Distributor" },
                    { value: "Strategic Alliance", label: "Aliansi Strategis" },
                    { value: "Technology Partner", label: "Mitra Teknologi" },
                    { value: "Financing Partner", label: "Mitra Pendanaan / Investor" },
                    { value: "Government", label: "Pemerintah / Regulator" },
                    { value: "Research Partner", label: "Mitra Riset / Perguruan Tinggi" },
                  ]}
                />
              </FormGroup>
              <FormGroup label="Peran / Kontribusi">
                <FTextarea value={kp.role_description} onChange={(v) => updateArr<KeyPartner>("key_partners", i, "role_description", v)} placeholder="Apa peran mitra ini dalam bisnis Anda?" />
              </FormGroup>
              <FormRow>
                <FormGroup label="Tingkat Ketergantungan">
                  <FSelect value={kp.dependency_level} onChange={(v) => updateArr<KeyPartner>("key_partners", i, "dependency_level", v)}
                    options={[
                      { value: "Sangat Tinggi", label: "Sangat Tinggi" },
                      { value: "Tinggi", label: "Tinggi" },
                      { value: "Sedang", label: "Sedang" },
                      { value: "Rendah", label: "Rendah" },
                    ]}
                  />
                </FormGroup>
                <FormGroup label="Tingkat Risiko">
                  <FSelect value={kp.risk_level} onChange={(v) => updateArr<KeyPartner>("key_partners", i, "risk_level", v)}
                    options={[
                      { value: "Tinggi", label: "Tinggi" },
                      { value: "Sedang", label: "Sedang" },
                      { value: "Rendah", label: "Rendah" },
                    ]}
                  />
                </FormGroup>
              </FormRow>
            </ArrayCard>
          ))}
          <AddButton label="Tambah Mitra" onClick={() => addArr("key_partners", emptyPartner)} />
        </>
      );

      // ── Step 11: Cost Structure ──
      case 11: return (
        <>
          <SectionNote>Apa saja biaya-biaya utama yang dikeluarkan untuk menjalankan bisnis?</SectionNote>
          {form.cost_structure.map((cs, i) => (
            <ArrayCard key={i} index={i} title={cs.cost_name} onRemove={() => removeArr("cost_structure", i)} canRemove={form.cost_structure.length > 1}>
              <FormGroup label="Nama Pos Biaya">
                <FInput value={cs.cost_name} onChange={(v) => updateArr<CostItem>("cost_structure", i, "cost_name", v)} placeholder="Mis: Gaji Karyawan" />
              </FormGroup>
              <FormRow>
                <FormGroup label="Tipe Biaya">
                  <Chips value={cs.cost_type} onChange={(v) => updateArr<CostItem>("cost_structure", i, "cost_type", v)} options={["Tetap", "Variabel"]} />
                </FormGroup>
                <FormGroup label="Kategori">
                  <FSelect value={cs.cost_category} onChange={(v) => updateArr<CostItem>("cost_structure", i, "cost_category", v)}
                    options={[
                      { value: "Operasional", label: "Operasional" },
                      { value: "SDM / HR", label: "SDM / HR" },
                      { value: "Marketing", label: "Marketing" },
                      { value: "Logistik", label: "Logistik" },
                      { value: "Teknologi / IT", label: "Teknologi / IT" },
                      { value: "Overhead", label: "Overhead / Umum" },
                      { value: "R&D", label: "R&D" },
                    ]}
                  />
                </FormGroup>
              </FormRow>
              <FormGroup label="Estimasi Biaya per Bulan (Rp)">
                <FInput value={cs.monthly_cost_estimation} onChange={(v) => updateArr<CostItem>("cost_structure", i, "monthly_cost_estimation", v)} placeholder="5.000.000" type="number" />
              </FormGroup>
              <FormGroup label="Cost Driver (Pemicu Biaya)">
                <FInput value={cs.cost_driver} onChange={(v) => updateArr<CostItem>("cost_structure", i, "cost_driver", v)} placeholder="Mis: Volume produksi, jumlah karyawan" />
              </FormGroup>
            </ArrayCard>
          ))}
          <AddButton label="Tambah Pos Biaya" onClick={() => addArr("cost_structure", emptyCost)} />
        </>
      );

      default: return null;
    }
  };

  if (showKPIDocs) {
    return <KPIDocsForm onBack={() => setShowKPIDocs(false)} />;
  }

  if (submitted) {
    return (
      <div className="bmc-form">
        <div className="success-screen anim-scale">
          <div className="success-glow" />
          <div className="success-icon-wrap">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="success-title">Registrasi BMC Selesai!</h2>
          <p className="success-sub">
            Data bisnis dan 9 blok BMC Anda telah berhasil disimpan. Lengkapi KPI dan dokumen legalitas agar profil bisnis Anda dapat diverifikasi.
          </p>
          <div className="success-steps">
            {STEP_INFO.map((s, idx) => (
              <div key={idx} className="success-step-item">
                <CheckCircle2 size={12} />
                <span>{s.title}</span>
              </div>
            ))}
          </div>
          <button className="btn-complete-profile" onClick={() => setShowKPIDocs(true)}>
            <BarChart3 size={16} />
            Lengkapi KPI &amp; Dokumen
            <ArrowRight size={16} />
          </button>
          <button className="btn-back-home" onClick={() => setSubmitted(false)}>
            Isi Data Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bmc-form">
      {/* Header */}
      <header className="bmc-header anim-fade">
        <div className="bmc-header-top">
          {step > 1 ? (
            <button className="bmc-back-btn" onClick={() => setStep((s) => s - 1)} type="button">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="bmc-step-badge">BMC</div>
          )}
          <div className="bmc-header-center">
            <h1 className="bmc-step-title" style={{ color: info.color }}>{info.title}</h1>
            <p className="bmc-step-subtitle">{info.subtitle}</p>
          </div>
          <div className="bmc-step-counter">
            <span className="bmc-step-current">{step}</span>
            <span className="bmc-step-total">/{TOTAL_STEPS}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bmc-progress-track">
          <div
            className="bmc-progress-fill"
            style={{ width: `${progress}%`, background: info.color }}
          />
        </div>

        {/* Step Dots */}
        <div className="bmc-step-dots">
          {STEP_INFO.map((s, idx) => (
            <button
              key={idx}
              className={`bmc-dot ${step === idx + 1 ? "active" : ""} ${step > idx + 1 ? "done" : ""}`}
              style={step === idx + 1 ? { background: s.color } : undefined}
              onClick={() => setStep(idx + 1)}
              type="button"
              title={s.title}
            />
          ))}
        </div>
      </header>

      {/* Step Content */}
      <div className="bmc-body anim-slide" key={step}>
        {renderStep()}
      </div>

      {/* Footer Navigation */}
      <div className="bmc-footer anim-slide d3">
        {step > 1 ? (
          <button
            className="btn-back"
            onClick={() => setStep((s) => s - 1)}
            type="button"
          >
            <ChevronLeft size={16} />
            Kembali
          </button>
        ) : (
          <button
            className="btn-skip"
            onClick={() => setStep((s) => s + 1)}
            type="button"
          >
            Lewati
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            className="btn-next"
            onClick={() => setStep((s) => s + 1)}
            type="button"
            style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)` }}
          >
            Lanjut
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn-submit-bmc"
            onClick={() => setSubmitted(true)}
            type="button"
          >
            <CheckCircle2 size={18} />
            Selesai & Submit
          </button>
        )}
      </div>

      {/* KBLI Picker Modal */}
      {showKBLI && (
        <KBLIPicker
          selected={form.kbli_code}
          onSelect={(code, label, section) => {
            set("kbli_code", code);
            set("kbli_name", label);
            set("kbli_section", section);
          }}
          onClose={() => setShowKBLI(false)}
        />
      )}
    </div>
  );
}
