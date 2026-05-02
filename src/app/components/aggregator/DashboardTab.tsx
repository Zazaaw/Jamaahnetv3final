"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Building2, HeartPulse, ChevronRight,
  Bell, Search, Zap, ShieldAlert, Rocket, Handshake, Lightbulb, Store, Map, Loader2
} from "lucide-react";
import { getSupabaseClient } from "../../utils/supabase/client";
import "./DashboardTab.css";

export default function DashboardTab({ onNavigate, userName = "Member", userRole = "user" }: { onNavigate: (t: any) => void; userName?: string; userRole?: string; }) {
  const [data, setData] = useState({ adminTotalRev: 0, adminAvgGrowth: 0, adminAvgBmc: 0, entityCount: 0, adminTop: [], adminTriage: [] });
  const [myBusiness, setMyBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = getSupabaseClient();
  const isAdmin = ['admin', 'aggregator_it', 'developer'].includes(userRole);
  const isMember = userRole === 'aggregator_member';
  const isPublic = userRole === 'user';

  useEffect(() => {
    fetchDashboardData();
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      const { data: entities } = await supabase.from('business_entities').select('*').order('growth_rate', { ascending: false });
      
      const allEnt = entities || [];
      if (isAdmin) {
        const totalR = allEnt.reduce((sum, e) => sum + e.monthly_revenue, 0);
        const avgG = allEnt.length ? allEnt.reduce((sum, e) => sum + e.growth_rate, 0) / allEnt.length : 0;
        const avgB = allEnt.length ? allEnt.reduce((sum, e) => sum + e.bmc_score, 0) / allEnt.length : 0;
        
        setData({
          adminTotalRev: totalR, adminAvgGrowth: avgG, adminAvgBmc: avgB, entityCount: allEnt.length,
          adminTop: allEnt.slice(0,3).map(e => ({ name: e.business_name, sector: e.sector, revenue: e.monthly_revenue, growth: e.growth_rate, bmc: e.bmc_score })),
          adminTriage: allEnt.slice(0,3).map(e => ({ entity: e.business_name, label: e.health_status || "Update Needed", color: e.bmc_score < 50 ? "var(--red)" : "var(--amber)", bg: e.bmc_score < 50 ? "var(--red-glow)" : "var(--amber-glow)", deadline: "Segera", icon: e.bmc_score < 50 ? <ShieldAlert size={16}/> : <Zap size={16}/> }))
        });
      }

      if (isMember && userAuth?.user?.id) {
        const myBiz = allEnt.find(e => e.owner_id === userAuth.user.id);
        if (myBiz) setMyBusiness(myBiz);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRev = (val: number) => val >= 1000000000 ? `${(val/1000000000).toFixed(1)} Milyar` : `${(val/1000000).toFixed(1)} Jt`;

  return (
    <div className="dash" style={{ paddingBottom: '100px' }}>
      <header className="dash-header anim-fade">
        <div className="dash-header-left"><p className="dash-greeting">Selamat Datang,</p><h1 className="dash-name">{userName}</h1></div>
        <div className="dash-header-right"><button className="header-icon-btn"><Search size={20} /></button><button className="header-icon-btn"><Bell size={20} /><span className="notif-dot" /></button></div>
      </header>

      {isLoading ? <div style={{ display:'flex', justifyContent:'center', padding:'50px 0'}}><Loader2 className="animate-spin text-emerald-500" size={40}/></div> : (
        <>
          {/* TAMPILAN ADMIN */}
          {isAdmin && (
            <>
              <section className="dash-hero anim-scale d1">
                <div className="hero-bg-orb hero-orb-1" /><div className="hero-bg-orb hero-orb-2" />
                <div className="hero-content">
                  <p className="hero-label">Total Portofolio Nasional</p>
                  <h2 className="hero-value">Rp {formatRev(data.adminTotalRev)}</h2>
                  <div className="hero-change"><TrendingUp size={14} /><span>+{data.adminAvgGrowth.toFixed(1)}% YoY</span></div>
                </div>
                <div className="hero-ring">
                  <div className="hero-ring-label"><span className="hero-ring-value">{data.adminAvgBmc.toFixed(0)}</span><span className="hero-ring-sub">Health</span></div>
                </div>
              </section>

              <section className="dash-section">
                <div className="section-head anim-fade d2"><h3 className="section-title">KPI Global</h3></div>
                <div className="kpi-grid">
                  <div className="kpi-card card"><div className="kpi-icon" style={{ color: "var(--accent-primary)", background: "var(--accent-glow)" }}><DollarSign size={18}/></div><p className="kpi-label">Portfolio Value</p><span className="kpi-value">{formatRev(data.adminTotalRev)}</span></div>
                  <div className="kpi-card card"><div className="kpi-icon" style={{ color: "var(--blue)", background: "var(--blue-glow)" }}><Building2 size={18}/></div><p className="kpi-label">Active Entities</p><span className="kpi-value">{data.entityCount}</span></div>
                  <div className="kpi-card card"><div className="kpi-icon" style={{ color: "var(--amber)", background: "var(--amber-glow)" }}><TrendingUp size={18}/></div><p className="kpi-label">Avg Growth</p><span className="kpi-value">{data.adminAvgGrowth.toFixed(1)}%</span></div>
                  <div className="kpi-card card"><div className="kpi-icon" style={{ color: "var(--red)", background: "var(--red-glow)" }}><HeartPulse size={18}/></div><p className="kpi-label">Health Index</p><span className="kpi-value">{data.adminAvgBmc.toFixed(0)}</span></div>
                </div>
              </section>

              <section className="dash-section">
                <div className="section-head anim-fade d3"><h3 className="section-title">Top Entitas Bisnis</h3><button className="section-link" onClick={() => onNavigate("entities")}>Lihat Semua <ChevronRight size={14}/></button></div>
                <div className="entity-list">
                  {data.adminTop.map((e: any, i) => (
                    <div key={i} className="entity-row card anim-slide"><div className="entity-avatar"><span>{e.name.charAt(0)}</span></div><div className="entity-info"><h4 className="entity-name">{e.name}</h4><p className="entity-meta">{e.sector} · Rp {formatRev(e.revenue)}</p></div></div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* TAMPILAN MEMBER */}
          {isMember && (
            <>
              {myBusiness ? (
                <>
                  <section className="dash-hero anim-scale d1">
                    <div className="hero-bg-orb hero-orb-1" style={{ background: 'var(--amber)' }} /><div className="hero-bg-orb hero-orb-2" style={{ background: 'var(--accent-primary)' }} />
                    <div className="hero-content"><p className="hero-label">Status Bisnis Anda</p><h2 className="hero-value" style={{ fontSize: '1.8rem' }}>{myBusiness.business_name}</h2><div className="hero-change" style={{ background: 'rgba(255,255,255,0.2)' }}><span>Sektor: {myBusiness.sector}</span></div></div>
                  </section>
                  <section className="dash-section">
                    <div className="section-head"><h3 className="section-title">Performa Unit</h3></div>
                    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
                      <div className="kpi-card card" style={{ flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
                        <div className="kpi-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}><DollarSign/></div>
                        <div><p className="kpi-label">Omset</p><span className="kpi-value">Rp {formatRev(myBusiness.monthly_revenue)}</span></div>
                      </div>
                      <div className="kpi-card card" style={{ flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
                        <div className="kpi-icon" style={{ background: 'var(--blue-glow)', color: 'var(--blue)' }}><TrendingUp/></div>
                        <div><p className="kpi-label">Growth</p><span className="kpi-value">{myBusiness.growth_rate}% YoY</span></div>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <section className="dash-section mt-4 text-center py-8">
                  <Store size={40} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }}/>
                  <h3 className="font-bold text-lg">Data Bisnis Belum Tersedia</h3>
                  <p className="text-sm text-gray-500 mb-4">Silakan masuk ke tab "Input Data" di bawah untuk melengkapi profil bisnis Anda.</p>
                  <button className="badge" onClick={() => onNavigate("input-data")} style={{ background: 'var(--accent-primary)', color: 'white', padding: '10px 20px' }}>Isi Form Sekarang</button>
                </section>
              )}
            </>
          )}

          {/* ======================================================== */}
          {/* 3. RENDER TAMPILAN PUBLIC (JAMAAH BIASA)                 */}
          {/* ======================================================== */}
          {isPublic && (
            <>
              <section className="dash-hero anim-scale d1">
                <div className="hero-bg-orb hero-orb-1" style={{ background: 'var(--blue)' }} />
                <div className="hero-bg-orb hero-orb-2" style={{ background: 'var(--accent-primary)' }} />
                <div className="hero-content">
                  {/* REVISI 1: Teks Atas (Direktori Ekonomi Dihilangkan) */}
                  <p className="hero-label">Business Aggregator</p>
                  
                  <h2 className="hero-value" style={{ fontSize: '1.6rem', lineHeight: '1.2', marginTop: '4px' }}>
                    Dukung Bisnis <br />Saudara Kita
                  </h2>
                  
                  {/* REVISI 2: Teks Subtitle */}
                  <div className="hero-change" style={{ background: 'rgba(255,255,255,0.2)', marginTop: '12px' }}>
                    <span>Temukan Inspirasi Bisnis di Ekosistem Jamaah.net</span>
                  </div>
                </div>
                <div className="hero-ring">
                  <Store size={48} style={{ color: 'rgba(255,255,255,0.8)', opacity: 0.8 }} />
                </div>
              </section>

              {/* REVISI 3: Bagian "Aksi Cepat" Dihilangkan Sesuai Arahan Pakde */}

              <section className="dash-section mt-4">
                <div className="card anim-slide d4" style={{ padding: '24px 20px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                  <Store size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)' }} />
                  
                  {/* REVISI 4: Punya Usaha -> Punya Bisnis */}
                  <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>Punya Bisnis Sendiri?</h3>
                  
                  {/* REVISI 5: Teks Penjelasan */}
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                    Jadilah bagian dari ekosistem bisnis jamaah.net untuk mendapatkan wawasan pasar dan inspirasi pengembangan bisnis.
                  </p>
                  
                  {/* REVISI 6: Teks Tombol */}
                  <button 
                    onClick={() => onNavigate("input-data")}
                    className="badge" 
                    style={{ background: 'var(--accent-primary)', color: 'white', padding: '10px 20px', fontSize: '12px', width: '100%', justifyContent: 'center', fontWeight: 'bold' }}
                  >
                    Daftar Jadi Member Business Aggregator
                  </button>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}