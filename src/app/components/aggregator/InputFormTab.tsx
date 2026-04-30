"use client";

import React, { useState } from "react";
import { Save, CheckCircle2, TrendingUp, Target, Handshake, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { getSupabaseClient } from "../../utils/supabase/client"; 
import { toast } from "sonner@2.0.3";
import "./DashboardTab.css"; // Minjam CSS dari dashboard biar seragam

export default function InputFormTab({ session }: { session?: any }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseClient();

  // State nampung isian form
  const [formData, setFormData] = useState({
    business_name: "",
    sector: "F&B",
    monthly_revenue: "",
    growth_rate: 0,
    bmc_score: 50, // Nilai default tengah-tengah
    needs: "", // Apa yang dicari/dibutuhkan
    offers: "" // Apa yang bisa dikolaborasikan/ditawarkan
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Sesi tidak ditemukan, silakan login ulang.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Siapin data buat dikirim ke Supabase
      const payload = {
        owner_id: session.user.id,
        business_name: formData.business_name,
        sector: formData.sector,
        monthly_revenue: parseFloat(formData.monthly_revenue.replace(/[^0-9.-]+/g,"")) || 0,
        growth_rate: formData.growth_rate,
        bmc_score: formData.bmc_score,
        bmc_details: {
          needs: formData.needs,
          offers: formData.offers
        },
        health_status: formData.bmc_score > 75 ? 'Golden Opportunity' : formData.bmc_score < 40 ? 'Urgent Review' : 'Strategic Expansion'
      };

      const { error } = await supabase
        .from('business_entities')
        .insert([payload]);

      if (error) throw error;

      toast.success("Data Bisnis berhasil dikirim ke Pusat Komando!");
      setStep(4); // Langsung lempar ke layar sukses
    } catch (error: any) {
      console.error("Error submitting data:", error);
      toast.error("Gagal mengirim data. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dash" style={{ padding: '20px', paddingBottom: '100px' }}>
      <div className="section-head anim-fade">
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Update Data Bisnis</h2>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Lengkapi profil bisnis Anda untuk mendapatkan rekomendasi dan peluang sinergi dari Aggregator Jamaah.
      </p>

      {/* Stepper Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '2px', background: 'var(--border-subtle)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '2px', background: 'var(--accent-primary)', zIndex: 0, width: step >= 2 ? (step >= 3 ? '80%' : '40%') : '0%', transition: 'width 0.3s' }} />
        
        {[
          { num: 1, icon: <TrendingUp size={14} />, label: "Finansial" },
          { num: 2, icon: <Target size={14} />, label: "Status BMC" },
          { num: 3, icon: <Handshake size={14} />, label: "Sinergi" }
        ].map((s) => (
          <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px' }}>
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              background: step >= s.num ? 'var(--accent-primary)' : 'var(--bg-card)', 
              color: step >= s.num ? 'white' : 'var(--text-secondary)',
              border: `2px solid ${step >= s.num ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              transition: 'all 0.3s'
            }}>
              {s.icon}
            </div>
            <span style={{ fontSize: '10px', fontWeight: step >= s.num ? 'bold' : 'normal', color: step >= s.num ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Konten Form */}
      <div className="card anim-slide" style={{ padding: '24px' }}>
        {step === 4 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Data Terkirim!</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Terima kasih. Sistem Aggregator sedang memproses data Anda untuk mencari peluang sinergi dan rekomendasi upscaling yang cocok.
            </p>
          </div>
        ) : (
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
            
            {/* STEP 1: PROFIL & FINANSIAL */}
            {step === 1 && (
              <div className="space-y-4 anim-fade">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Nama Unit Bisnis</label>
                  <input required type="text" name="business_name" value={formData.business_name} onChange={handleChange} placeholder="Contoh: Kopi Kenangan Senja" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Sektor Industri</label>
                  <select name="sector" value={formData.sector} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}>
                    <option value="F&B">F&B (Makanan & Minuman)</option>
                    <option value="Retail">Retail & Perdagangan</option>
                    <option value="Jasa">Jasa & Pelayanan</option>
                    <option value="Tech">Teknologi & Digital</option>
                    <option value="Agrikultur">Agrikultur & Peternakan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Rata-rata Omset Bulanan (Rp)</label>
                  <input required type="number" name="monthly_revenue" value={formData.monthly_revenue} onChange={handleChange} placeholder="Contoh: 15000000" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Pertumbuhan YoY (%)</label>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Seberapa besar bisnis Anda tumbuh dibanding tahun lalu? (Bisa minus jika turun)</p>
                  <input required type="number" name="growth_rate" value={formData.growth_rate} onChange={handleChange} placeholder="Contoh: 15" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
              </div>
            )}

            {/* STEP 2: PENILAIAN BMC */}
            {step === 2 && (
              <div className="space-y-4 anim-fade">
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '12px', display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <AlertCircle size={20} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                  <p style={{ fontSize: '11px', color: 'var(--amber)', lineHeight: '1.4' }}>
                    Penilaian Business Model Canvas (BMC) membantu pusat melihat ketahanan bisnis Anda. Geser slider sesuai dengan kondisi real bisnis Anda saat ini.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span>Skor Kekuatan BMC</span>
                    <span style={{ color: 'var(--accent-primary)' }}>{formData.bmc_score} / 100</span>
                  </label>
                  <input type="range" name="bmc_score" min="0" max="100" value={formData.bmc_score} onChange={handleSliderChange} style={{ width: '100%', accentColor: 'var(--accent-primary)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                    <span>Lemah (Butuh Bantuan)</span>
                    <span>Sangat Kuat (Skala Nasional)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SINERGI */}
            {step === 3 && (
              <div className="space-y-4 anim-fade">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Kebutuhan Bisnis (Needs)</label>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Apa yang paling bisnis Anda butuhkan saat ini? (Modal, Supplier, Mentor, dll)</p>
                  <textarea required name="needs" value={formData.needs} onChange={handleChange} rows={3} placeholder="Kami sedang mencari supplier bahan baku organik yang konsisten..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Penawaran Kolaborasi (Offers)</label>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Apa yang bisnis Anda bisa tawarkan ke jaringan Jamaah?</p>
                  <textarea required name="offers" value={formData.offers} onChange={handleChange} rows={3} placeholder="Kami siap menerima maklon produksi dengan kapasitas 1000 pcs/hari..." style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
                </div>
              </div>
            )}

            {/* Navigasi Bawah */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 'bold' }}>
                  Kembali
                </button>
              )}
              
              <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '12px', borderRadius: '24px', background: 'var(--accent-primary)', color: 'white', fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: 'none' }}>
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                ) : step === 3 ? (
                  <><Save size={16} /> Simpan Data</>
                ) : (
                  <>Selanjutnya <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}