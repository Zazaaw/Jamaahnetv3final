import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react"; 
import { getSupabaseClient } from '../utils/supabase/client'; 

// Manggil file-file original buatan Om dari folder aggregator
import DashboardTab from "./aggregator/DashboardTab";
import PortfolioTab from "./aggregator/PortfolioTab";
import AnalyticsTab from "./aggregator/AnalyticsTab";
import TriageTab from "./aggregator/TriageTab";
import MapTab from "./aggregator/MapTab";
import InputFormTab from "./aggregator/InputFormTab";
import BottomNav from "./aggregator/BottomNav";
import "./aggregator/aggregator-global.css";

export type TabId = "dashboard" | "entities" | "analytics" | "map" | "triage" | "input-data";

const supabase = getSupabaseClient();

export default function BusinessDashboardScreen({ 
  session, 
  onBack 
}: { 
  session?: any;
  onBack: () => void; 
}) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [userRole, setUserRole] = useState<string>('user');
  const [userName, setUserName] = useState<string>('Member');

  // 1. JURUS DETEKSI KASTA & AMBIL NAMA (Udah disesuaikan sama Supabase kau!)
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name') // <-- TARIK KOLOM 'name'
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        // Mantra Anti-Huruf-Besar: Admin -> admin
        const safeRole = (data.role || 'user').toLowerCase();
        setUserRole(safeRole);
        
        // Panggil dari kolom name
        setUserName(data.name || session.user.email?.split('@')[0] || 'Member');
      }
    }
    fetchProfile();
  }, [session]);

  // 2. SISTEM KEAMANAN
  useEffect(() => {
    if (userRole === 'user' && (activeTab === 'analytics' || activeTab === 'triage' || activeTab === 'input-data')) {
      setActiveTab('dashboard'); 
    }
  }, [userRole, activeTab]);

  return (
    <div className="aggregator-wrapper" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      
      {/* HEADER ATAS */}
      <div style={{ position: 'sticky', top: 0, zIndex: 999, padding: '16px 20px', background: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Bagian Kiri: Judul */}
        <div>
          <p style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            {(userRole === 'aggregator_it' || userRole === 'admin') ? 'Pusat Komando Admin' : userRole === 'aggregator_member' ? 'Business Aggregator' : 'Business Aggregator'}
          </p>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            {activeTab.replace('-', ' ').toUpperCase()}
          </h1>
        </div>

        {/* Bagian Kanan: Tombol Kembali ke Jamaah.net */}
        <button 
          onClick={onBack} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px 14px', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
        >
          <LogOut size={14} />
          Kembali ke Jamaah.net
        </button>
      </div>

      {/* Konten Tab Original Om + Tab Baru */}
      <div className="app-container" style={{ paddingBottom: 'calc(var(--nav-height) + 20px)' }}>
        {activeTab === "dashboard" && <DashboardTab onNavigate={setActiveTab as any} userName={userName} userRole={userRole} />}
        {activeTab === "entities" && <PortfolioTab />}
        {activeTab === "map" && <MapTab />}

        {activeTab === "input-data" && userRole !== 'user' && <InputFormTab session={session} />}
        {activeTab === "analytics" && userRole !== 'user' && <AnalyticsTab />}
        {activeTab === "triage" && userRole !== 'user' && <TriageTab />}
      </div>

      {/* Bottom Nav Original Om */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab as any} userRole={userRole} />
    </div>
  );
}